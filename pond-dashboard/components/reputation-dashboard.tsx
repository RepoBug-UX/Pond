"use client"

import { useState, useEffect } from "react"
import type { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"

interface ReputationDashboardProps {
  contract: ethers.Contract
  account: string
}

interface ReputationScores {
  defi: number
  governance: number
  social: number
}

export default function ReputationDashboard({ contract, account }: ReputationDashboardProps) {
  const [scores, setScores] = useState<ReputationScores>({ defi: 0, governance: 0, social: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchReputationScores = async () => {
      try {
        setIsLoading(true)
        setError("")

        // Fetch reputation scores for all three categories
        const defiScore = await contract.getReputation(account, 0)
        const governanceScore = await contract.getReputation(account, 1)
        const socialScore = await contract.getReputation(account, 2)

        setScores({
          defi: Number(defiScore),
          governance: Number(governanceScore),
          social: Number(socialScore),
        })
      } catch (error) {
        console.error("Error fetching reputation scores:", error)
        setError("Failed to load reputation scores. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (contract && account) {
      fetchReputationScores()
    }
  }, [contract, account])

  // Calculate max score for progress bars (for visualization purposes)
  const maxScore = Math.max(100, scores.defi, scores.governance, scores.social)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Reputation Scores</CardTitle>
          <CardDescription>Loading your DeFi, Governance, and Social reputation...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Reputation Scores</CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <button onClick={() => window.location.reload()} className="text-blue-600 hover:underline">
            Retry
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Reputation Scores</CardTitle>
        <CardDescription>View your current reputation in each category</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-800">DeFi Reputation</h3>
            <span className="text-sm font-medium">{scores.defi}</span>
          </div>
          <Progress value={(scores.defi / maxScore) * 100} className="h-2 bg-gray-100" />
          <p className="text-sm text-gray-500">Your reputation in decentralized finance activities</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-800">Governance Reputation</h3>
            <span className="text-sm font-medium">{scores.governance}</span>
          </div>
          <Progress value={(scores.governance / maxScore) * 100} className="h-2 bg-gray-100" />
          <p className="text-sm text-gray-500">Your reputation in protocol governance and voting</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-800">Social Reputation</h3>
            <span className="text-sm font-medium">{scores.social}</span>
          </div>
          <Progress value={(scores.social / maxScore) * 100} className="h-2 bg-gray-100" />
          <p className="text-sm text-gray-500">Your reputation in community engagement and social activities</p>
        </div>
      </CardContent>
    </Card>
  )
}
