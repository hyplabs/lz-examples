import '@nomiclabs/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import getContract from './../helpers/getContract';
import { LZ_CONFIG } from './../helpers/constants';
import { contractsDeployedOn } from './../utils/migrations';

export let runtimeHRE: HardhatRuntimeEnvironment;

task('set-trusted-onft-721', 'set the trusted remote for GameItemONFT721')
  .addParam('remote')
  .setAction(async ({ remote }, hre) => {
  runtimeHRE = hre;
  const ethers = hre.ethers;
  const networkName = hre.network.name;
  const [deployer] = await ethers.getSigners();

  if (!LZ_CONFIG[networkName]) throw new Error(`invalid network: ${networkName}`);
  if (!LZ_CONFIG[remote]) throw new Error(`invalid remote: ${remote}`);

  const onft = await getContract(
    ethers,
    'GameItemONFT721',
    deployer,
  );

  console.log('GameItemONFT721.setTrustedRemoteAddress()');
  const tx = await onft.setTrustedRemoteAddress(
    LZ_CONFIG[remote].chainId,
    contractsDeployedOn(remote).GameItemONFT721
  );
  console.log(`tx: ${tx.hash}`);
  await tx.wait();

  console.log('done!');
});
