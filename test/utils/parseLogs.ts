import { ethers } from 'hardhat';

const parseLogs = ({ logs }, abi) => {
  const iface = new ethers.utils.Interface(abi);
  return (logs.map((log) => {
    try { return iface.parseLog(log); }
    catch {}
  })).filter((l) => l);
};

export default parseLogs;
