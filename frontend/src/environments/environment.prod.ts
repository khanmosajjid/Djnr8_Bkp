
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import contracts from './Config/contracts';
import dgnr8ABI from './Config/abis/dgnr8.json'

export const environment = {
  production: true,

  URL: 'http://localhost:3000/api/v1',
  // URL: 'http://157.230.32.177:3000/api/v1',
  // URL: 'https://api.decryptnft.io/api/v1',

  testNetBSC: 'https://polygon-mumbai.g.alchemy.com/v2/kkTx-ajifJW76PdLgXFlRK01nv04F-0F',
  mainnetBSC: 'https://bsc-dataseed1.binance.org:443',


  main: 'Mainnet',
  rops: 'Ropsten',
  rinkeby: 'Rinkeby',
  Goerli: 'Goerli',
  Kovan: 'Kovan',
  // Binance Smart Chain Main Network 
  bscMainnet: 'bsc-mainnet',
  // Binance Smart Chain Test Network 
  bscTestnet: 'bsc-testnet',

  divideValue: 1000000000000000000,

  NFTaddress: contracts.NFT,
  NFTabi:dgnr8ABI,
};
