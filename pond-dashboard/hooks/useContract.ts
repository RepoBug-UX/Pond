import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getContract } from '@/lib/contract';

export const useContract = () => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initContract = async () => {
      try {
        if (typeof window.ethereum !== 'undefined') {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          await provider.send("eth_requestAccounts", []);
          const contract = getContract(provider);
          setContract(contract);
        } else {
          setError('Please install MetaMask');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize contract');
      } finally {
        setLoading(false);
      }
    };

    initContract();
  }, []);

  return { contract, loading, error };
}; 