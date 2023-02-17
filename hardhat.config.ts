import { HardhatUserConfig } from 'hardhat/types';
import glob from 'glob';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import '@tenderly/hardhat-tenderly';
import '@typechain/hardhat';
import 'hardhat-deploy';
import 'hardhat-gas-reporter';
import 'hardhat-spdx-license-identifier';

if (!process.env.SKIP_LOAD) {
  glob.sync('./tasks/**/*.ts').forEach(function (file) {
    require(path.resolve(file));
  });
}

const DEFAULT_BLOCK_GAS_LIMIT = 12450000;
const HARDHAT_CHAINID = 31337;

const settings = {
  optimizer: {
    enabled: true,
    runs: 200,
    details: {
      yul: true,
    },
  }
};

const config = {
  defaultNetwork: 'hardhat',
  solidity: {
    compilers: [
      {
        version: '0.8.10',
        settings
      }
    ],
  },
  paths: {
    artifacts: './build'
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
  },
  networks: {
    hardhat: {
      hardfork: 'london',
      blockGasLimit: DEFAULT_BLOCK_GAS_LIMIT,
      gas: DEFAULT_BLOCK_GAS_LIMIT,
      gasPrice: 8000000000,
      chainId: HARDHAT_CHAINID,
      allowUnlimitedContractSize: true, // HACK: needed to run tests
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
    },
    mumbai: {
      url: process.env.ALCHEMY_MUMBAI_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY]
    },
    goerli: {
      url: process.env.ALCHEMY_GOERLI_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY]
    },
  },
  spdxLicenseIdentifier: {
    overwrite: false,
    runOnCompile: false,
  },
  gasReporter: {
    enabled: (process.env.REPORT_GAS) ? true : false,
    currency: 'USD',
    token: 'MATIC',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    gasPrice: 45, // https://polygonscan.com/gastracker
    gasPriceApi: 'https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice'
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.ETHERSCAN_API_KEY
    }
  },
  tenderly: {
    project: process.env.TENDERLY_PROJECT,
    username: process.env.TENDERLY_USERNAME,
  },
};

export default config;
