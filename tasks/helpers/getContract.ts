import { contractsDeployed } from './../../scripts/utils/migrations';

const getContract = async (ethers: any, contractName: string, signer: any, address?: string) => {
  const Contract = await ethers.getContractFactory(contractName);
  const instance = await Contract.attach(address || contractsDeployed[contractName]);

  return instance.connect(signer);
};

export default getContract;
