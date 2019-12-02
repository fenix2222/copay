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
  },
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
  //   properties: {
  //     hasMultiSig: true,
  //     hasMultiSend: true,
  //     isUtxo: true,
  //     isERCToken: false,
  //     isStableCoin: false,
  //     singleAddress: false
  //   },
  //   paymentInfo: {
  //     paymentCode: 'BIP73',
  //     protocolPrefix: { livenet: 'bitcoin', testnet: 'bitcoin' },
  //     ratesApi: 'https://bitpay.com/api/rates',
  //     blockExplorerUrls: 'insight.bitcore.io/#/BTC/'
  //   },
  //   feeInfo: {
  //     feeUnit: 'sat/byte',
  //     feeUnitAmount: 1000,
  //     blockTime: 10,
  //     maxMerchantFee: 'urgent'
  //   },
  //   theme: {
  //     backgroundColor: 'rgba(247,146,26,1)',
  //     gradientBackgroundColor: 'rgba(247,146,26, 0.2)'
  //   }
  // },
  // bch: {
  //   name: 'Bitcoin Cash',
  //   chain: 'BCH',
  //   coin: 'bch',
  //   unitInfo: {
  //     unitName: 'BCH',
  //     unitToSatoshi: 100000000,
  //     unitDecimals: 8,
  //     unitCode: 'bch'
  //   },
  //   properties: {
  //     hasMultiSig: true,
  //     hasMultiSend: true,
  //     isUtxo: true,
  //     isERCToken: false,
  //     isStableCoin: false,
  //     singleAddress: false
  //   },
  //   paymentInfo: {
  //     paymentCode: 'BIP73',
  //     protocolPrefix: { livenet: 'bitcoincash', testnet: 'bchtest' },
  //     ratesApi: 'https://bitpay.com/api/rates/bch',
  //     blockExplorerUrls: 'insight.bitcore.io/#/BCH/'
  //   },
  //   feeInfo: {
  //     feeUnit: 'sat/byte',
  //     feeUnitAmount: 1000,
  //     blockTime: 10,
  //     maxMerchantFee: 'normal'
  //   },
  //   theme: {
  //     backgroundColor: 'rgba(47,207,110,1)',
  //     gradientBackgroundColor: 'rgba(47,207,110, 0.2)'
  //   }
  // },
  // eth: {
  //   name: 'Ethereum',
  //   chain: 'ETH',
  //   coin: 'eth',
  //   unitInfo: {
  //     unitName: 'ETH',
  //     unitToSatoshi: 1e18,
  //     unitDecimals: 18,
  //     unitCode: 'eth'
  //   },
  //   properties: {
  //     hasMultiSig: false,
  //     hasMultiSend: false,
  //     isUtxo: false,
  //     isERCToken: false,
  //     isStableCoin: false,
  //     singleAddress: true
  //   },
  //   paymentInfo: {
  //     paymentCode: 'EIP681',
  //     protocolPrefix: { livenet: 'ethereum', testnet: 'ethereum' },
  //     ratesApi: 'https://bitpay.com/api/rates/eth',
  //     blockExplorerUrls: 'insight.bitcore.io/#/ETH/'
  //   },
  //   feeInfo: {
  //     feeUnit: 'Gwei',
  //     feeUnitAmount: 1e9,
  //     blockTime: 0.2,
  //     maxMerchantFee: 'urgent'
  //   },
  //   theme: {
  //     backgroundColor: 'rgba(135,206,250,1)',
  //     gradientBackgroundColor: 'rgba(30,144,255, 0.2)'
  //   }
  // },
  // pax: {
  //   name: 'Paxos Standard',
  //   chain: 'ETH',
  //   coin: 'pax',
  //   unitInfo: {
  //     unitName: 'PAX',
  //     unitToSatoshi: 1e18,
  //     unitDecimals: 18,
  //     unitCode: 'pax'
  //   },
  //   properties: {
  //     hasMultiSig: false,
  //     hasMultiSend: false,
  //     isUtxo: false,
  //     isERCToken: true,
  //     isStableCoin: true,
  //     singleAddress: true
  //   },
  //   paymentInfo: {
  //     paymentCode: 'EIP681b',
  //     protocolPrefix: { livenet: 'ethereum', testnet: 'ethereum' },
  //     ratesApi: 'https://bitpay.com/api/rates/pax',
  //     blockExplorerUrls: 'insight.bitcore.io/#/ETH/'
  //   },
  //   feeInfo: {
  //     feeUnit: 'Gwei',
  //     feeUnitAmount: 1e9,
  //     blockTime: 0.2,
  //     maxMerchantFee: 'urgent'
  //   },
  //   theme: {
  //     backgroundColor: 'rgba(0,132,93,1)',
  //     gradientBackgroundColor: 'rgba(0,209,147, 0.2)'
  //   }
  // },
  // usdc: {
  //   name: 'USD Coin',
  //   chain: 'ETH',
  //   coin: 'usdc',
  //   unitInfo: {
  //     unitName: 'USDC',
  //     unitToSatoshi: 1e6,
  //     unitDecimals: 6,
  //     unitCode: 'usdc'
  //   },
  //   properties: {
  //     hasMultiSig: false,
  //     hasMultiSend: false,
  //     isUtxo: false,
  //     isERCToken: true,
  //     isStableCoin: true,
  //     singleAddress: true
  //   },
  //   paymentInfo: {
  //     paymentCode: 'EIP681b',
  //     protocolPrefix: { livenet: 'ethereum', testnet: 'ethereum' },
  //     ratesApi: 'https://bitpay.com/api/rates/usdc',
  //     blockExplorerUrls: 'insight.bitcore.io/#/ETH/'
  //   },
  //   feeInfo: {
  //     feeUnit: 'Gwei',
  //     feeUnitAmount: 1e9,
  //     blockTime: 0.2,
  //     maxMerchantFee: 'urgent'
  //   },
  //   theme: {
  //     backgroundColor: 'rgba(39,117,201,1)',
  //     gradientBackgroundColor: 'rgba(93,156,224, 0.2)'
  //   }
  // },
  // gusd: {
  //   name: 'Gemini Dollar',
  //   chain: 'ETH',
  //   coin: 'gusd',
  //   unitInfo: {
  //     unitName: 'GUSD',
  //     unitToSatoshi: 1e2,
  //     unitDecimals: 2,
  //     unitCode: 'gusd'
  //   },
  //   properties: {
  //     hasMultiSig: false,
  //     hasMultiSend: false,
  //     isUtxo: false,
  //     isERCToken: true,
  //     isStableCoin: true,
  //     singleAddress: true
  //   },
  //   paymentInfo: {
  //     paymentCode: 'EIP681b',
  //     protocolPrefix: { livenet: 'ethereum', testnet: 'ethereum' },
  //     ratesApi: 'https://bitpay.com/api/rates/gusd',
  //     blockExplorerUrls: 'insight.bitcore.io/#/ETH/'
  //   },
  //   feeInfo: {
  //     feeUnit: 'Gwei',
  //     feeUnitAmount: 1e9,
  //     blockTime: 0.2,
  //     maxMerchantFee: 'urgent'
  //   },
  //   theme: {
  //     backgroundColor: 'rgba(0,220,250,1)',
  //     gradientBackgroundColor: 'rgba(72,233,255, 0.2)'
  //   }
  // }
};
