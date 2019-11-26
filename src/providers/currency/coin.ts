import { CoinsMap } from './currency';

export interface CoinOpts {
  // Bitcore-node
  name: string;
  chain: string;
  coin: string;
  unitInfo: {
    // Config/Precision
    unitName: string;
    unitToSatoshi: number;
    unitDecimals: number;
    unitCode: string;
  };
  properties: {
    // Properties
    hasMultiSig: boolean;
    hasMultiSend: boolean;
    isUtxo: boolean;
    isERCToken: boolean;
    isStableCoin: boolean;
    singleAddress: boolean;
  };
  paymentInfo: {
    paymentCode: string;
    protocolPrefix: { livenet: string; testnet: string };
    // Urls
    ratesApi: string;
    blockExplorerUrls: string;
  };
  feeInfo: {
    // Fee Units
    feeUnit: string;
    feeUnitAmount: number;
    blockTime: number;
    maxMerchantFee: string;
  };
  theme: {
    backgroundColor: string;
    gradientBackgroundColor: string;
  };
}
// btc: {
//   name: 'Bitcoin',
//   chain: 'BTC',
//   coin: 'btc',
//   unitInfo: {
//     unitName: 'BTC',
//     unitToSatoshi: 100000000,
//     unitDecimals: 8,
//     unitCode: 'btc'
//   },
export const availableCoins: CoinsMap<CoinOpts> = {
  strat: {
    name: 'Stratis',
    chain: 'STRAT',
    coin: 'strat',
    unitInfo: {
      unitName: 'STRAT',
      unitToSatoshi: 100000000,
      unitDecimals: 8,
      unitCode: 'strat'
    },
    properties: {
      hasMultiSig: false,
      hasMultiSend: false,
      isUtxo: true,
      isERCToken: false,
      isStableCoin: false,
      singleAddress: false
    },
    paymentInfo: {
      paymentCode: 'BIP73',
      protocolPrefix: { livenet: 'bitcoin', testnet: 'bitcoin' },
      ratesApi: 'https://bitpay.com/api/rates',
      blockExplorerUrls: 'insight.bitcore.io/#/BTC/'
    },
    feeInfo: {
      feeUnit: 'sat/byte',
      feeUnitAmount: 1000,
      blockTime: 1,
      maxMerchantFee: 'urgent'
    },
    theme: {
      backgroundColor: 'rgba(19,130,198,1)',
      gradientBackgroundColor: 'rgba(247,146,26, 0.2)'
    }
  }
};
