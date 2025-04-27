"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface ConnectWalletProps {
  isConnected: boolean
  account: string
  connectWallet: () => Promise<void>
  isLoading: boolean
}

export default function ConnectWallet({ isConnected, account, connectWallet, isLoading }: ConnectWalletProps) {
  return (
    <div>
      {isConnected ? (
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium text-gray-700">
            {account.substring(0, 6)}...{account.substring(account.length - 4)}
          </span>
        </div>
      ) : (
        <Button onClick={connectWallet} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting
            </>
          ) : (
            "Connect Wallet"
          )}
        </Button>
      )}
    </div>
  )
}
