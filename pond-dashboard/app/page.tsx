"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import ConnectWallet from "@/components/connect-wallet"
import ReputationDashboard from "@/components/reputation-dashboard"
import BadgesSection from "@/components/badges-section"
import ReputationControls from "@/components/reputation-controls"
import contractABI from "@/lib/pond-abi.json"

export default function Home() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [account, setAccount] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Contract address would typically come from an environment variable
  const contractAddress = "0x0000000000000000000000000000000000000000" // Replace with actual contract address

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum)
          const accounts = await provider.listAccounts()

          if (accounts.length > 0) {
            const signer = await provider.getSigner()
            const contract = new ethers.Contract(contractAddress, contractABI, signer)

            setProvider(provider)
            setSigner(signer)
            setContract(contract)
            setAccount(accounts[0].address)
            setIsConnected(true)
          }
        } catch (error) {
          console.error("Failed to check connection:", error)
        }
      }
    }

    checkConnection()
  }, [])

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setIsLoading(true)
        const provider = new ethers.BrowserProvider(window.ethereum)
        await provider.send("eth_requestAccounts", [])
        const signer = await provider.getSigner()
        const contract = new ethers.Contract(contractAddress, contractABI, signer)
        const address = await signer.getAddress()

        setProvider(provider)
        setSigner(signer)
        setContract(contract)
        setAccount(address)
        setIsConnected(true)

        toast({
          title: "Wallet Connected",
          description: `Connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
        })
      } catch (error) {
        console.error("Error connecting wallet:", error)
        toast({
          title: "Connection Failed",
          description: "Failed to connect wallet. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    } else {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to use this application.",
        variant: "destructive",
      })
    }
  }

  return (
    <main className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pond Reputation Dashboard</h1>
          <ConnectWallet
            isConnected={isConnected}
            account={account}
            connectWallet={connectWallet}
            isLoading={isLoading}
          />
        </div>

        {isConnected && contract ? (
          <div className="space-y-8">
            <ReputationDashboard contract={contract} account={account} />
            <BadgesSection contract={contract} account={account} />
            <ReputationControls contract={contract} account={account} />
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-medium text-gray-700 mb-4">Connect your wallet to view your reputation</h2>
            <p className="text-gray-500 mb-6">
              View your DeFi, Governance, and Social reputation scores and manage your badges.
            </p>
            <button
              onClick={connectWallet}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? "Connecting..." : "Connect Wallet"}
            </button>
          </div>
        )}
      </div>
      <Toaster />
    </main>
  )
}
