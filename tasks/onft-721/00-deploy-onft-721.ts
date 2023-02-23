import '@nomiclabs/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import deployContract from './../helpers/deployContract';
import {
  LZ_CONFIG,
  SAMPLE_ERC721_NAME,
  SAMPLE_ERC721_SYMBOL,
  MIN_GAS_TO_TRANSFER
} from './../helpers/constants';

export let runtimeHRE: HardhatRuntimeEnvironment;

task('deploy-onft-721', 'deploys the GameItemONFT721 to the given network with the right LzEndpoint')
  .setAction(async ({}, hre) => {
  runtimeHRE = hre;
  const ethers = hre.ethers;
  const networkName = hre.network.name;
  const [deployer] = await ethers.getSigners();

  if (!LZ_CONFIG[networkName]) throw new Error(`invalid network: ${networkName}`);

  await deployContract(
    ethers,
    networkName,
    'GameItemONFT721',
    [
      SAMPLE_ERC721_NAME,
      SAMPLE_ERC721_SYMBOL,
      MIN_GAS_TO_TRANSFER,
      LZ_CONFIG[networkName].endpoint
    ]
  );

  console.log('done!');
});
