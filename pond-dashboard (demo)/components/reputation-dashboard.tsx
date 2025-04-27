"use client"

import { useState, useEffect } from "react"
import type { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts"
import { useReputationStore } from "@/lib/reputation-store"

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
  const reputationScores = useReputationStore((state) => state.reputationScores)

  // Reset store when account changes
  useEffect(() => {
    if (account) {
      // Only reset if this is a new account connection
      const storedAccount = localStorage.getItem("pond-account")
      if (storedAccount !== account) {
        useReputationStore.getState().resetStore()
        localStorage.setItem("pond-account", account)
      }
    }
  }, [account])

  // Subscribe to reputation changes
  useEffect(() => {
    setScores({
      defi: reputationScores[0],
      governance: reputationScores[1],
      social: reputationScores[2],
    })
    setIsLoading(false)

    // Subscribe to store changes
    const unsubscribe = useReputationStore.subscribe(
      (state) => [state.reputationScores[0], state.reputationScores[1], state.reputationScores[2]],
      ([defi, governance, social]) => {
        setScores({
          defi: Number(defi) || 0,
          governance: Number(governance) || 0,
          social: Number(social) || 0,
        })
      },
    )

    return () => unsubscribe()
  }, [reputationScores])

  // Format data for the radar chart
  const chartData = [
    { category: "DeFi", value: scores.defi, fullMark: 100 },
    { category: "Governance", value: scores.governance, fullMark: 100 },
    { category: "Social", value: scores.social, fullMark: 100 },
  ]

  // Calculate max score for chart scaling
  const maxScore = Math.max(100, scores.defi, scores.governance, scores.social)

  if (isLoading) {
    return (
      <Card className="border-purple-100 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
          <CardTitle className="text-gray-800">Your Reputation Scores</CardTitle>
          <CardDescription>Loading your DeFi, Governance, and Social reputation...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-purple-100 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
          <CardTitle className="text-gray-800">Your Reputation Scores</CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
        <CardContent className="py-6">
          <button onClick={() => window.location.reload()} className="text-purple-600 hover:underline">
            Retry
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-purple-100 shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
        <CardTitle className="text-gray-800">Your Reputation Scores</CardTitle>
        <CardDescription>View your current reputation in each category</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid gridType="polygon" stroke="#e9d5ff" />
              <PolarAngleAxis dataKey="category" tick={{ fill: "#6b21a8" }} />
              <PolarRadiusAxis domain={[0, maxScore]} tick={false} axisLine={false} tickCount={5} />
              <Radar
                dataKey="value"
                stroke="#d946ef"
                fill="#d946ef"
                fillOpacity={0.4}
                animationDuration={1000}
                animationEasing="ease-out"
              />
              <Tooltip
                formatter={(value) => [`${value}`, ""]}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderColor: "#d8b4fe",
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 p-4 border border-purple-100 shadow-sm">
            <h3 className="font-medium text-gray-800">DeFi</h3>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
              {scores.defi}
            </p>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 p-4 border border-purple-100 shadow-sm">
            <h3 className="font-medium text-gray-800">Governance</h3>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
              {scores.governance}
            </p>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 p-4 border border-purple-100 shadow-sm">
            <h3 className="font-medium text-gray-800">Social</h3>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
              {scores.social}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
