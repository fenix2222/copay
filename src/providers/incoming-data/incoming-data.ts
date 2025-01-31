import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Events } from 'ionic-angular';
import * as _ from 'lodash';

// providers
import { ActionSheetProvider } from '../action-sheet/action-sheet';
import { AppProvider } from '../app/app';
import { BwcProvider } from '../bwc/bwc';
import { Coin, CurrencyProvider } from '../currency/currency';
import { Logger } from '../logger/logger';
import { PayproProvider } from '../paypro/paypro';
import { ProfileProvider } from '../profile/profile';

export interface RedirParams {
  activePage?: any;
  amount?: string;
  coin?: Coin;
  fromHomeCard?: boolean;
}

@Injectable()
export class IncomingDataProvider {
  constructor(
    private actionSheetProvider: ActionSheetProvider,
    private events: Events,
    private bwcProvider: BwcProvider,
    private currencyProvider: CurrencyProvider,
    private payproProvider: PayproProvider,
    private logger: Logger,
    private appProvider: AppProvider,
    private translate: TranslateService,
    private profileProvider: ProfileProvider
  ) {
    this.logger.debug('IncomingDataProvider initialized');
  }

  public showMenu(data): void {
    const dataMenu = this.actionSheetProvider.createIncomingDataMenu({ data });
    dataMenu.present();
    dataMenu.onDidDismiss(data => this.finishIncomingData(data));
  }

  public finishIncomingData(data: any): void {
    let redirTo = null;
    let value = null;
    if (data) {
      redirTo = data.redirTo;
      value = data.value;
    }
    if (redirTo === 'AmountPage') {
      let coin = data.coin ? data.coin : 'btc';
      this.events.publish('finishIncomingDataMenuEvent', {
        redirTo,
        value,
        coin
      });
    } else if (redirTo === 'PaperWalletPage') {
      const nextView = {
        name: 'PaperWalletPage',
        params: { privateKey: value }
      };
      this.events.publish('IncomingDataRedir', nextView);
    } else {
      this.events.publish('finishIncomingDataMenuEvent', { redirTo, value });
    }
  }

  private isValidPayProNonBackwardsCompatible(data: string): boolean {
    data = this.sanitizeUri(data);
    return !!/^(bitcoin|bitcoincash|bchtest|ethereum)?:\?r=[\w+]/.exec(data);
  }

  private isValidBitPayInvoice(data: string): boolean {
    return !!/^https:\/\/(www.)?(test.)?bitpay.com\/i\/\w+/.exec(data);
  }

  private isValidBitPayUri(data: string): boolean {
    data = this.sanitizeUri(data);
    if (!(data && data.indexOf('bitpay:') === 0)) return false;
    const address = this.extractAddress(data);
    if (!address) return false;
    let params: URLSearchParams = new URLSearchParams(
      data.replace(`bitpay:${address}`, '')
    );
    const coin = params.get('coin');
    if (!coin) return false;
    return true;
  }

  private isValidBitcoinUri(data: string): boolean {
    data = this.sanitizeUri(data);
    return !!this.bwcProvider.getBitcore().URI.isValid(data);
  }

  private isValidBitcoinCashUri(data: string): boolean {
    data = this.sanitizeUri(data);
    return !!this.bwcProvider.getBitcoreCash().URI.isValid(data);
  }

  private isValidEthereumUri(data: string): boolean {
    data = this.sanitizeUri(data);
    return !!this.bwcProvider.getCore().Validation.validateUri('ETH', data);
  }

  public isValidBitcoinCashUriWithLegacyAddress(data: string): boolean {
    data = this.sanitizeUri(data);
    return !!this.bwcProvider
      .getBitcore()
      .URI.isValid(data.replace(/^(bitcoincash:|bchtest:)/, 'bitcoin:'));
  }

  private isValidPlainUrl(data: string): boolean {
    if (this.isValidBitPayInvoice(data)) {
      return false;
    }
    data = this.sanitizeUri(data);
    return !!/^https?:\/\//.test(data);
  }

  private isValidBitcoinAddress(data: string): boolean {
    return !!(
      this.bwcProvider.getBitcore().Address.isValid(data, 'livenet') ||
      this.bwcProvider.getBitcore().Address.isValid(data, 'testnet')
    );
  }

  public isValidBitcoinCashLegacyAddress(data: string): boolean {
    return !!(
      this.bwcProvider.getBitcore().Address.isValid(data, 'livenet') ||
      this.bwcProvider.getBitcore().Address.isValid(data, 'testnet')
    );
  }

  private isValidBitcoinCashAddress(data: string): boolean {
    return !!(
      this.bwcProvider.getBitcoreCash().Address.isValid(data, 'livenet') ||
      this.bwcProvider.getBitcoreCash().Address.isValid(data, 'testnet')
    );
  }

  private isValidEthereumAddress(data: string): boolean {
    return !!this.bwcProvider
      .getCore()
      .Validation.validateAddress('ETH', 'livenet', data);
  }

  private isValidCoinbaseUri(data: string): boolean {
    data = this.sanitizeUri(data);
    return !!(
      data && data.indexOf(this.appProvider.info.name + '://coinbase') === 0
    );
  }

  private isValidShapeshiftUri(data: string): boolean {
    data = this.sanitizeUri(data);
    return !!(
      data && data.indexOf(this.appProvider.info.name + '://shapeshift') === 0
    );
  }

  private isValidBitPayCardUri(data: string): boolean {
    data = this.sanitizeUri(data);
    return !!(data && data.indexOf('bitpay://bitpay') === 0);
  }

  private isValidJoinCode(data: string): boolean {
    data = this.sanitizeUri(data);
    return !!(data && data.match(/^copay:[0-9A-HJ-NP-Za-km-z]{70,80}$/));
  }

  private isValidJoinLegacyCode(data: string): boolean {
    return !!(data && data.match(/^[0-9A-HJ-NP-Za-km-z]{70,80}$/));
  }

  private isValidPrivateKey(data: string): boolean {
    return !!(
      data &&
      (data.substring(0, 2) == '6P' || this.checkPrivateKey(data))
    );
  }

  private isValidImportPrivateKey(data: string): boolean {
    return !!(
      data &&
      (data.substring(0, 2) == '1|' ||
        data.substring(0, 2) == '2|' ||
        data.substring(0, 2) == '3|')
    );
  }

  private handlePrivateKey(data: string, redirParams?: RedirParams): void {
    this.logger.debug('Incoming-data: private key');
    this.showMenu({
      data,
      type: 'privateKey',
      fromHomeCard: redirParams ? redirParams.fromHomeCard : false
    });
  }

  private handlePayProNonBackwardsCompatible(data: string): void {
    this.logger.debug(
      'Incoming-data: Payment Protocol with non-backwards-compatible request'
    );
    const url = this.getPayProUrl(data);
    this.handleBitPayInvoice(url);
  }

  private async handleBitPayInvoice(invoiceUrl: string) {
    this.logger.debug('Incoming-data: Handling bitpay invoice');
    try {
      const disableLoader = true;
      const details = await this.payproProvider.getPayProOptions(
        invoiceUrl,
        disableLoader
      );
      const selected = details.paymentOptions.filter(option => option.selected);
      if (selected.length === 1) {
        // BTC, BCH, ETH Chains
        const [{ currency }] = selected;
        this.goToPayPro(invoiceUrl, currency.toLowerCase(), disableLoader);
      } else {
        // If ERC20
        if (selected.length > 1) {
          details.paymentOptions = selected;
        }
        // No currencies selected
        const stateParams = {
          payProOptions: details
        };
        let nextView = {
          name: 'SelectInvoicePage',
          params: stateParams
        };
        this.events.publish('IncomingDataRedir', nextView);
      }
    } catch (err) {
      this.events.publish('incomingDataError', err);
      this.logger.error(err);
    }
  }

  private handleBitPayUri(data: string, redirParams?: RedirParams): void {
    this.logger.debug('Incoming-data: BitPay URI');
    let amountFromRedirParams =
      redirParams && redirParams.amount ? redirParams.amount : '';
    const address = this.extractAddress(data);
    let params: URLSearchParams = new URLSearchParams(
      data.replace(`bitpay:${address}`, '')
    );
    let amount = params.get('amount') || amountFromRedirParams;
    const coin: Coin = Coin[params.get('coin').toUpperCase()];
    const message = params.get('message');
    const requiredFeeParam = params.get('gasPrice');
    if (amount) {
      const { unitToSatoshi } = this.currencyProvider.getPrecision(coin);
      amount = parseInt(
        (Number(amount) * unitToSatoshi).toFixed(0),
        10
      ).toString();
      this.goSend(address, amount, message, coin, requiredFeeParam);
    } else {
      this.goToAmountPage(address, coin);
    }
  }

  private handleBitcoinUri(data: string, redirParams?: RedirParams): void {
    this.logger.debug('Incoming-data: Bitcoin URI');
    let amountFromRedirParams =
      redirParams && redirParams.amount ? redirParams.amount : '';
    const coin = Coin.BTC;
    let parsed = this.bwcProvider.getBitcore().URI(data);
    let address = parsed.address ? parsed.address.toString() : '';
    let message = parsed.message;
    let amount = parsed.amount || amountFromRedirParams;
    if (parsed.r) this.goToPayPro(data, coin);
    else this.goSend(address, amount, message, coin);
  }

  private handleBitcoinCashUri(data: string, redirParams?: RedirParams): void {
    this.logger.debug('Incoming-data: Bitcoin Cash URI');
    let amountFromRedirParams =
      redirParams && redirParams.amount ? redirParams.amount : '';
    const coin = Coin.BCH;
    let parsed = this.bwcProvider.getBitcoreCash().URI(data);
    let address = parsed.address ? parsed.address.toString() : '';

    // keep address in original format
    if (parsed.address && data.indexOf(address) < 0) {
      address = parsed.address.toCashAddress();
    }

    let message = parsed.message;
    let amount = parsed.amount || amountFromRedirParams;

    if (parsed.r) this.goToPayPro(data, coin);
    else this.goSend(address, amount, message, coin);
  }

  private handleEthereumUri(data: string, redirParams?: RedirParams): void {
    this.logger.debug('Incoming-data: Ethereum URI');
    let amountFromRedirParams =
      redirParams && redirParams.amount ? redirParams.amount : '';
    const coin = Coin.ETH;
    const value = /[\?\&]value=(\d+([\,\.]\d+)?)/i;
    const gasPrice = /[\?\&]gasPrice=(\d+([\,\.]\d+)?)/i;
    let parsedAmount;
    let requiredFeeParam;
    if (value.exec(data)) {
      parsedAmount = value.exec(data)[1];
    }
    if (gasPrice.exec(data)) {
      requiredFeeParam = gasPrice.exec(data)[1];
    }
    const address = this.extractAddress(data);
    const message = '';
    const amount = parsedAmount || amountFromRedirParams;
    if (amount) {
      this.goSend(address, amount, message, coin, requiredFeeParam);
    } else {
      this.handleEthereumAddress(address, redirParams);
    }
  }

  private handleBitcoinCashUriLegacyAddress(data: string): void {
    this.logger.debug('Incoming-data: Bitcoin Cash URI with legacy address');
    const coin = Coin.BCH;
    let parsed = this.bwcProvider
      .getBitcore()
      .URI(data.replace(/^(bitcoincash:|bchtest:)/, 'bitcoin:'));

    let oldAddr = parsed.address ? parsed.address.toString() : '';
    if (!oldAddr)
      this.logger.error('Could not parse Bitcoin Cash legacy address');

    let a = this.bwcProvider
      .getBitcore()
      .Address(oldAddr)
      .toObject();
    let address = this.bwcProvider
      .getBitcoreCash()
      .Address.fromObject(a)
      .toString();
    let message = parsed.message;
    let amount = parsed.amount ? parsed.amount : '';

    // Translate address
    this.logger.warn('Legacy Bitcoin Address transalated to: ' + address);
    if (parsed.r) this.goToPayPro(data, coin);
    else this.goSend(address, amount, message, coin);
  }

  private handlePlainUrl(data: string): void {
    this.logger.debug('Incoming-data: Plain URL');
    data = this.sanitizeUri(data);
    this.showMenu({
      data,
      type: 'url'
    });
  }

  private handlePlainBitcoinAddress(
    data: string,
    redirParams?: RedirParams
  ): void {
    this.logger.debug('Incoming-data: Bitcoin plain address');
    const coin = Coin.BTC;
    if (redirParams && redirParams.activePage === 'ScanPage') {
      this.showMenu({
        data,
        type: 'bitcoinAddress',
        coin
      });
    } else if (redirParams && redirParams.amount) {
      this.goSend(data, redirParams.amount, '', coin);
    } else {
      this.goToAmountPage(data, coin);
    }
  }

  private handlePlainBitcoinCashAddress(
    data: string,
    redirParams?: RedirParams
  ): void {
    this.logger.debug('Incoming-data: Bitcoin Cash plain address');
    const coin = Coin.BCH;
    if (redirParams && redirParams.activePage === 'ScanPage') {
      this.showMenu({
        data,
        type: 'bitcoinAddress',
        coin
      });
    } else if (redirParams && redirParams.amount) {
      this.goSend(data, redirParams.amount, '', coin);
    } else {
      this.goToAmountPage(data, coin);
    }
  }

  private handleEthereumAddress(data: string, redirParams?: RedirParams): void {
    this.logger.debug('Incoming-data: Ethereum address');
    const coin = Coin.ETH;
    if (redirParams && redirParams.activePage === 'ScanPage') {
      this.showMenu({
        data,
        type: 'ethereumAddress',
        coin
      });
    } else if (redirParams && redirParams.amount) {
      this.goSend(data, redirParams.amount, '', coin);
    } else {
      this.goToAmountPage(data, coin);
    }
  }

  private goToImportByPrivateKey(data: string): void {
    this.logger.debug('Incoming-data (redirect): QR code export feature');

    let stateParams = { code: data };
    let nextView = {
      name: 'ImportWalletPage',
      params: stateParams
    };
    this.events.publish('IncomingDataRedir', nextView);
  }

  private goToJoinWallet(data: string): void {
    this.logger.debug('Incoming-data (redirect): Code to join to a wallet');
    let nextView, stateParams;

    const opts = {
      showHidden: true,
      canAddNewAccount: true
    };
    const wallets = this.profileProvider.getWallets(opts);
    const nrKeys = _.values(_.groupBy(wallets, 'keyId')).length;

    if (nrKeys === 0) {
      stateParams = { url: data };
      nextView = {
        name: 'JoinWalletPage',
        params: stateParams
      };
    } else if (nrKeys != 1) {
      stateParams = { url: data, isJoin: true };
      nextView = {
        name: 'AddWalletPage',
        params: stateParams
      };
    } else if (nrKeys === 1) {
      stateParams = { keyId: wallets[0].credentials.keyId, url: data };
      nextView = {
        name: 'JoinWalletPage',
        params: stateParams
      };
    }

    if (this.isValidJoinCode(data) || this.isValidJoinLegacyCode(data)) {
      this.events.publish('IncomingDataRedir', nextView);
    } else {
      this.logger.error('Incoming-data: Invalid code to join to a wallet');
    }
  }

  private goToBitPayCard(data: string): void {
    this.logger.debug('Incoming-data (redirect): BitPay Card URL');

    // Disable BitPay Card
    if (!this.appProvider.info._enabledExtensions.debitcard) {
      this.logger.warn('BitPay Card has been disabled for this build');
      return;
    }

    let secret = this.getParameterByName('secret', data);
    let email = this.getParameterByName('email', data);
    let otp = this.getParameterByName('otp', data);
    let reason = this.getParameterByName('r', data);
    switch (reason) {
      default:
      case '0':
        /* For BitPay card binding */
        let stateParams = { secret, email, otp };
        let nextView = {
          name: 'BitPayCardIntroPage',
          params: stateParams
        };
        this.events.publish('IncomingDataRedir', nextView);
        break;
    }
  }

  private goToCoinbase(data: string): void {
    this.logger.debug('Incoming-data (redirect): Coinbase URL');

    let code = this.getParameterByName('code', data);
    let stateParams = { code };
    let nextView = {
      name: 'CoinbasePage',
      params: stateParams
    };
    this.events.publish('IncomingDataRedir', nextView);
  }

  private goToShapeshift(data: string): void {
    this.logger.debug('Incoming-data (redirect): ShapeShift URL');

    let code = this.getParameterByName('code', data);
    let stateParams = { code };
    let nextView = {
      name: 'ShapeshiftPage',
      params: stateParams
    };
    this.events.publish('IncomingDataRedir', nextView);
  }

  public redir(data: string, redirParams?: RedirParams): boolean {
    //  Handling of a bitpay invoice url
    if (this.isValidBitPayInvoice(data)) {
      this.handleBitPayInvoice(data);
      return true;

      // Payment Protocol with non-backwards-compatible request
    } else if (this.isValidPayProNonBackwardsCompatible(data)) {
      this.handlePayProNonBackwardsCompatible(data);
      return true;

      // Bitcoin  URI
    } else if (this.isValidBitcoinUri(data)) {
      this.handleBitcoinUri(data, redirParams);
      return true;

      // Bitcoin Cash URI
    } else if (this.isValidBitcoinCashUri(data)) {
      this.handleBitcoinCashUri(data, redirParams);
      return true;

      // Ethereum URI
    } else if (this.isValidEthereumUri(data)) {
      this.handleEthereumUri(data, redirParams);
      return true;

      // Bitcoin Cash URI using Bitcoin Core legacy address
    } else if (this.isValidBitcoinCashUriWithLegacyAddress(data)) {
      this.handleBitcoinCashUriLegacyAddress(data);
      return true;

      // Plain URL
    } else if (this.isValidPlainUrl(data)) {
      this.handlePlainUrl(data);
      return true;

      // Plain Address (Bitcoin)
    } else if (this.isValidBitcoinAddress(data)) {
      this.handlePlainBitcoinAddress(data, redirParams);
      return true;

      // Plain Address (Bitcoin Cash)
    } else if (this.isValidBitcoinCashAddress(data)) {
      this.handlePlainBitcoinCashAddress(data, redirParams);
      return true;

      // Address (Ethereum)
    } else if (this.isValidEthereumAddress(data)) {
      this.handleEthereumAddress(data, redirParams);
      return true;

      // Coinbase
    } else if (this.isValidCoinbaseUri(data)) {
      this.goToCoinbase(data);
      return true;

      // ShapeShift
    } else if (this.isValidShapeshiftUri(data)) {
      this.goToShapeshift(data);
      return true;

      // BitPayCard Authentication
    } else if (this.isValidBitPayCardUri(data)) {
      this.goToBitPayCard(data);
      return true;

      // BitPay URI
    } else if (this.isValidBitPayUri(data)) {
      this.handleBitPayUri(data);
      return true;

      // Join
    } else if (this.isValidJoinCode(data) || this.isValidJoinLegacyCode(data)) {
      this.goToJoinWallet(data);
      return true;

      // Check Private Key
    } else if (this.isValidPrivateKey(data)) {
      this.handlePrivateKey(data, redirParams);
      return true;

      // Import Private Key
    } else if (this.isValidImportPrivateKey(data)) {
      this.goToImportByPrivateKey(data);
      return true;

      // Anything else
    } else {
      if (redirParams && redirParams.activePage === 'ScanPage') {
        this.logger.debug('Incoming-data: Plain text');
        this.showMenu({
          data,
          type: 'text'
        });
        return true;
      } else {
        this.logger.warn('Incoming-data: Unknown information');
        return false;
      }
    }
  }

  public parseData(data: string): any {
    if (!data) return;
    if (this.isValidBitPayInvoice(data)) {
      return {
        data,
        type: 'InvoiceUri',
        title: this.translate.instant('Invoice URL')
      };
    } else if (this.isValidPayProNonBackwardsCompatible(data)) {
      return {
        data,
        type: 'PayPro',
        title: this.translate.instant('Payment URL')
      };

      // Bitcoin URI
    } else if (this.isValidBitcoinUri(data)) {
      return {
        data,
        type: 'BitcoinUri',
        title: this.translate.instant('Bitcoin URI')
      };

      // Bitcoin Cash URI
    } else if (this.isValidBitcoinCashUri(data)) {
      return {
        data,
        type: 'BitcoinCashUri',
        title: this.translate.instant('Bitcoin Cash URI')
      };

      // Ethereum URI
    } else if (this.isValidEthereumUri(data)) {
      return {
        data,
        type: 'EthereumUri',
        title: this.translate.instant('Ethereum URI')
      };

      // Bitcoin Cash URI using Bitcoin Core legacy address
    } else if (this.isValidBitcoinCashUriWithLegacyAddress(data)) {
      return {
        data,
        type: 'BitcoinCashUri',
        title: this.translate.instant('Bitcoin Cash URI')
      };

      // Plain URL
    } else if (this.isValidPlainUrl(data)) {
      return {
        data,
        type: 'PlainUrl',
        title: this.translate.instant('Plain URL')
      };

      // Plain Address (Bitcoin)
    } else if (this.isValidBitcoinAddress(data)) {
      return {
        data,
        type: 'BitcoinAddress',
        title: this.translate.instant('Bitcoin Address')
      };

      // Plain Address (Bitcoin Cash)
    } else if (this.isValidBitcoinCashAddress(data)) {
      return {
        data,
        type: 'BitcoinCashAddress',
        title: this.translate.instant('Bitcoin Cash Address')
      };

      // Plain Address (Ethereum)
    } else if (this.isValidEthereumAddress(data)) {
      return {
        data,
        type: 'EthereumAddress',
        title: this.translate.instant('Ethereum Address')
      };

      // Coinbase
    } else if (this.isValidCoinbaseUri(data)) {
      return {
        data,
        type: 'Coinbase',
        title: 'Coinbase URI'
      };

      // BitPayCard Authentication
    } else if (this.isValidBitPayCardUri(data)) {
      return {
        data,
        type: 'BitPayCard',
        title: this.translate.instant('BitPay Card URI')
      };

      // BitPay  URI
    } else if (this.isValidBitPayUri(data)) {
      return {
        data,
        type: 'BitPayUri',
        title: this.translate.instant('BitPay URI')
      };

      // Join
    } else if (this.isValidJoinCode(data) || this.isValidJoinLegacyCode(data)) {
      return {
        data,
        type: 'JoinWallet',
        title: this.translate.instant('Invitation Code')
      };

      // Check Private Key
    } else if (this.isValidPrivateKey(data)) {
      return {
        data,
        type: 'PrivateKey',
        title: this.translate.instant('Private Key')
      };

      // Import Private Key
    } else if (this.isValidImportPrivateKey(data)) {
      return {
        data,
        type: 'ImportPrivateKey',
        title: this.translate.instant('Import Words')
      };

      // Anything else
    } else {
      return;
    }
  }

  public extractAddress(data: string): string {
    const address = data.replace(/^[a-z]+:/i, '').replace(/\?.*/, '');
    const params = /([\?\&]+[a-z]+=(\d+([\,\.]\d+)?))+/i;
    return address.replace(params, '');
  }

  private sanitizeUri(data): string {
    // Fixes when a region uses comma to separate decimals
    let regex = /[\?\&]amount=(\d+([\,\.]\d+)?)/i;
    let match = regex.exec(data);
    if (!match || match.length === 0) {
      return data;
    }
    let value = match[0].replace(',', '.');
    let newUri = data.replace(regex, value);

    // mobile devices, uris like copay://xxx
    newUri.replace('://', ':');

    return newUri;
  }

  public getPayProUrl(data: string): string {
    return decodeURIComponent(
      data.replace(/(bitcoin|bitcoincash|ethereum)?:\?r=/, '')
    );
  }

  private getParameterByName(name: string, url: string): string {
    if (!url) return undefined;
    name = name.replace(/[\[\]]/g, '\\$&');
    let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  private checkPrivateKey(privateKey: string): boolean {
    // Check if it is a Transaction id to prevent errors
    let isPK: boolean = this.checkRegex(privateKey);
    if (!isPK) return false;
    try {
      this.bwcProvider.getBitcore().PrivateKey(privateKey, 'livenet');
    } catch (err) {
      return false;
    }
    return true;
  }

  private checkRegex(data: string): boolean {
    let PKregex = new RegExp(/^[5KL][1-9A-HJ-NP-Za-km-z]{50,51}$/);
    return !!PKregex.exec(data);
  }

  private goSend(
    addr: string,
    amount: string,
    message: string,
    coin: Coin,
    requiredFeeRate?: string
  ): void {
    if (amount) {
      let stateParams = {
        amount,
        toAddress: addr,
        description: message,
        coin,
        requiredFeeRate
      };
      let nextView = {
        name: 'ConfirmPage',
        params: stateParams
      };
      this.events.publish('IncomingDataRedir', nextView);
    } else {
      let stateParams = {
        toAddress: addr,
        description: message,
        coin
      };
      let nextView = {
        name: 'AmountPage',
        params: stateParams
      };
      this.events.publish('IncomingDataRedir', nextView);
    }
  }

  private goToAmountPage(toAddress: string, coin: Coin): void {
    let stateParams = {
      toAddress,
      coin
    };
    let nextView = {
      name: 'AmountPage',
      params: stateParams
    };
    this.events.publish('IncomingDataRedir', nextView);
  }

  public goToPayPro(url: string, coin: Coin, disableLoader?: boolean): void {
    this.payproProvider
      .getPayProDetails(url, coin, disableLoader)
      .then(details => {
        this.handlePayPro(details, url, coin);
      })
      .catch(err => {
        this.events.publish('incomingDataError', err);
        this.logger.error(err);
      });
  }

  private async handlePayPro(payProDetails, url, coin: Coin): Promise<void> {
    if (!payProDetails) {
      this.logger.error('No wallets available');
      const error = this.translate.instant('No wallets available');
      this.events.publish('incomingDataError', error);
      return;
    }

    let requiredFeeRate;

    if (payProDetails.requiredFeeRate) {
      requiredFeeRate = !this.currencyProvider.isUtxoCoin(coin)
        ? payProDetails.requiredFeeRate
        : Math.ceil(payProDetails.requiredFeeRate * 1024);
    }

    try {
      const disableLoader = true;
      const { paymentOptions } = await this.payproProvider.getPayProOptions(
        url,
        disableLoader
      );
      const { estimatedAmount } = paymentOptions.find(
        option => option.currency.toLowerCase() === coin
      );
      const stateParams = {
        amount: estimatedAmount,
        toAddress: payProDetails.instructions[0].toAddress,
        description: payProDetails.memo,
        data: payProDetails.instructions[0].data,
        paypro: payProDetails,
        coin,
        network: payProDetails.network,
        payProUrl: url,
        requiredFeeRate
      };
      const nextView = {
        name: 'ConfirmPage',
        params: stateParams
      };
      this.events.publish('IncomingDataRedir', nextView);
    } catch (err) {
      this.events.publish('incomingDataError', err);
      this.logger.error(err);
    }
  }
}
