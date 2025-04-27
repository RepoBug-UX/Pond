import { ethers } from 'ethers';

// Replace with your contract's ABI
export const contractABI = [
  // Add your contract's ABI here
];

// Replace with your contract's address
export const contractAddress = 'YOUR_CONTRACT_ADDRESS';

export const getContract = (provider: ethers.providers.Web3Provider) => {
  return new ethers.Contract(contractAddress, contractABI, provider.getSigner());
}; 