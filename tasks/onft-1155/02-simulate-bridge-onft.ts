import '@nomiclabs/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import getContract from './../helpers/getContract';
import { LZ_CONFIG, EMPTY_BYTES } from './../helpers/constants';
import { contractsDeployedOn } from './../utils/migrations';

export let runtimeHRE: HardhatRuntimeEnvironment;

// THIS SHOULD BE UPDATED ON SUCCESSIVE MINTs
const MINT_TOKEN_ID = 1;

// ANYONE YOU WANT TO ATTACK
const OTHER_PLAYER = '0x33FE1E3712161B1fd43803B682eE73de80Dc8544';

task('simulate-bridge-onft', 'simulates a flow on GameItemONFT1155: mint, equip, bridge, attack (should revert)')
  .addParam('remote')
  .addOptionalParam('attack')
  .setAction(async ({ remote, attack }, hre) => {
  runtimeHRE = hre;
  const ethers = hre.ethers;
  const networkName = hre.network.name;
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();

  if (!LZ_CONFIG[networkName]) throw new Error(`invalid network: ${networkName}`);
  if (!LZ_CONFIG[remote]) throw new Error(`invalid remote: ${remote}`);

  const onft = await getContract(
    ethers,
    'GameItemONFT1155',
    deployer,
  );

  const trustedRemote = ethers.utils.solidityPack(
    ['address','address'],
    [contractsDeployedOn(remote).GameItemONFT1155, onft.address]
  );

  if (!await onft.isTrustedRemote(LZ_CONFIG[remote].chainId, trustedRemote)) {
    throw new Error(`not a trusted remote remote`);
  }

  // mint, bridge, try to equip (will revert as our balance becomes 0)
  if (!attack) {
    let tx;

    // 1. mint ourselves a token
    console.log(`GameItemONFT1155.mint(${deployerAddress}, ${MINT_TOKEN_ID})`);
    tx = await onft.mint(deployerAddress, MINT_TOKEN_ID);
    console.log(`tx: ${tx.hash}`);
    await tx.wait();

    // 2. it should be auto-equipped, meaning we can use it for attacks
    const equippedTokenId = await onft.equippedItems(deployerAddress);
    console.log(`equippedItems[${deployerAddress}] => ${equippedTokenId.toNumber()}`);

    // 3. let's estimate the fee for the bridge (second value is the `zroFee`, irrelevant for now)
    // NOTE: during gas spikes, this will be a high value. you can check the averages at
    // https://stargate.finance/transfer => under 'Check Transfer Gas Estimator'
    const [nativeFee, _] = await onft.estimateSendFee(
      LZ_CONFIG[remote].chainId,
      ethers.utils.solidityPack(['bytes'], [deployerAddress]),
      MINT_TOKEN_ID,
      1,
      false, // `_useZro`
      EMPTY_BYTES // `_adapterParams`
    );

    console.log(`native fee in ${['mumbai', 'polygon'].includes(networkName) ? 'matic' : 'ether'}`, ethers.utils.formatEther(nativeFee));

    // 4. bridge it, and pay the native fee
    console.log(`GameItemONFT1155.bridge(${MINT_TOKEN_ID}, 1, ${LZ_CONFIG[remote].chainId})`);
    tx = await onft.bridge(MINT_TOKEN_ID, 1, LZ_CONFIG[remote].chainId, { value: nativeFee });
    console.log(`tx: ${tx.hash}`);
    await tx.wait();

    // 5. check https://layerzeroscan.com/ with the above tx hash

    // 6. will revert because our balance on this chain should now be 0
    try {
      tx = await onft.setEquippedItem(MINT_TOKEN_ID);
      console.log(`did not revert... ${tx.hash}`);
    } catch (error) {
      console.log(`REVERT! Our balance of token: ${MINT_TOKEN_ID} should now be 0`);
      console.log(error);
    }
  } else {
    // let's attack someone >:)
    console.log(`GameItemONFT1155.attack(${OTHER_PLAYER})`);
    try {
      tx = await onft.attack(OTHER_PLAYER);
      console.log(`tx: ${tx.hash}`);
      await tx.wait();
    } catch (error) {
      console.log('REVERT! Likely a defenseless player (but not because our balance is 0)');
      console.log(error);
    }
  }

  console.log('done!');
});
