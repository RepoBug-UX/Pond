"use client"

import { useState, useEffect } from "react"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import ReputationDashboard from "@/components/reputation-dashboard"
import BadgesSection from "@/components/badges-section"
import ReputationControls from "@/components/reputation-controls"
import { MockContract } from "@/lib/mock-contract"
import { CircleOff } from "lucide-react"

export default function Home() {
  const [account, setAccount] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [contract, setContract] = useState<MockContract | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Check if we have a stored account
    const storedAccount = localStorage.getItem("pond-account")
    if (storedAccount) {
      setAccount(storedAccount)
      setIsConnected(true)
      setContract(new MockContract())
    }
  }, [])

  const connectWallet = async () => {
    try {
      setIsLoading(true)

      // Generate a mock account address
      const mockAccount =
        "0x" + Math.random().toString(16).substring(2, 14) + Math.random().toString(16).substring(2, 14)

      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setAccount(mockAccount)
      setIsConnected(true)
      setContract(new MockContract())

      // Store the account
      localStorage.setItem("pond-account", mockAccount)

      toast({
        title: "Wallet Connected",
        description: `Connected to ${mockAccount.substring(0, 6)}...${mockAccount.substring(mockAccount.length - 4)}`,
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
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
              <div className="h-6 w-6 rounded-full bg-white"></div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Pond Reputation
            </h1>
          </div>
          <p className="text-gray-600 text-center max-w-lg">
            Your ecosystem-wide reputation platform for the Polkadot ecosystem
          </p>
        </div>

        {isConnected && contract ? (
          <div className="space-y-8">
            <ReputationDashboard contract={contract} account={account} />
            <BadgesSection contract={contract} account={account} />
            <ReputationControls contract={contract} account={account} />
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-xl border border-purple-100 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-300 to-transparent opacity-30"></div>
              <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full border-8 border-pink-200 opacity-20"></div>
              <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full border-8 border-purple-200 opacity-20"></div>
            </div>

            <div className="relative z-10">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                <CircleOff className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Connect your wallet to view your reputation</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                View your DeFi, Governance, and Social reputation scores and manage your badges across the Polkadot
                ecosystem.
              </p>
              <button
                onClick={connectWallet}
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 shadow-md transition-all duration-200"
              >
                {isLoading ? "Connecting..." : "Connect Wallet"}
              </button>
            </div>
          </div>
        )}

        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>© 2025 Pond Reputation System · Polkadot Ecosystem</p>
        </footer>
      </div>
      <Toaster />
    </main>
  )
}
