import { updateContractsDeployed } from './../../scripts/utils/migrations';

const deployContract = async (ethers: any, networkName: string, contractName: string, args: any[] = []) => {
  console.log(`deploying contract ${contractName} ...`);
  const contract = await ethers.getContractFactory(contractName);
  const instance = await contract.deploy(...args);

  console.log(`tx: ${instance.deployTransaction.hash}`);

  await instance.deployed();

  console.log(`${contractName} deployed to: ${instance.address}`);

  updateContractsDeployed(contractName, instance.address, networkName);

  return instance;
};

export default deployContract;
