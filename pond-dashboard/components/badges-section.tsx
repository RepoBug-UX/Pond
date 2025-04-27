"use client"

import { useState, useEffect } from "react"
import type { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Award, AlertCircle } from "lucide-react"

interface BadgesSectionProps {
  contract: ethers.Contract
  account: string
}

interface Badge {
  id: number
  name: string
  category: number
  earned: boolean
}

// Sample badge data - in a real app, this would come from the contract or an API
const badgeMetadata: Record<number, { name: string; category: number }> = {
  1: { name: "DeFi Pioneer", category: 0 },
  2: { name: "Governance Voter", category: 1 },
  3: { name: "Social Contributor", category: 2 },
  4: { name: "DeFi Expert", category: 0 },
  5: { name: "Governance Leader", category: 1 },
  6: { name: "Community Builder", category: 2 },
}

export default function BadgesSection({ contract, account }: BadgesSectionProps) {
  const [badges, setBadges] = useState<Badge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [mintingBadgeId, setMintingBadgeId] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setIsLoading(true)
        setError("")

        // Get user's badges from the contract
        const userBadges = await contract.getBadges(account)

        // Create a complete list of all possible badges
        const allBadges: Badge[] = Object.entries(badgeMetadata).map(([id, metadata]) => ({
          id: Number(id),
          name: metadata.name,
          category: metadata.category,
          earned: userBadges.includes(Number(id)),
        }))

        setBadges(allBadges)
      } catch (error) {
        console.error("Error fetching badges:", error)
        setError("Failed to load badges. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (contract && account) {
      fetchBadges()
    }
  }, [contract, account])

  const mintBadge = async (badgeId: number) => {
    try {
      setMintingBadgeId(badgeId)

      // Call the mintBadge function on the contract
      const tx = await contract.mintBadge(badgeId)

      toast({
        title: "Transaction Submitted",
        description: "Your badge minting transaction has been submitted.",
      })

      // Wait for the transaction to be mined
      await tx.wait()

      // Update the badge status
      setBadges(badges.map((badge) => (badge.id === badgeId ? { ...badge, earned: true } : badge)))

      toast({
        title: "Badge Minted Successfully",
        description: `You've successfully minted the ${badgeMetadata[badgeId].name} badge!`,
      })
    } catch (error) {
      console.error("Error minting badge:", error)
      toast({
        title: "Minting Failed",
        description: "Failed to mint badge. You may not be eligible yet.",
        variant: "destructive",
      })
    } finally {
      setMintingBadgeId(null)
    }
  }

  const getCategoryName = (categoryId: number) => {
    switch (categoryId) {
      case 0:
        return "DeFi"
      case 1:
        return "Governance"
      case 2:
        return "Social"
      default:
        return "Unknown"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Badges</CardTitle>
          <CardDescription>Loading your earned badges...</CardDescription>
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
          <CardTitle>Your Badges</CardTitle>
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
        <CardTitle>Your Badges</CardTitle>
        <CardDescription>View and mint badges based on your reputation</CardDescription>
      </CardHeader>
      <CardContent>
        {badges.length === 0 ? (
          <div className="text-center py-6">
            <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-gray-500">No badges available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <div key={badge.id} className={`p-4 rounded-lg border ${badge.earned ? "bg-gray-50" : "bg-white"}`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${badge.earned ? "bg-green-100" : "bg-gray-100"}`}>
                    <Award className={`h-5 w-5 ${badge.earned ? "text-green-600" : "text-gray-400"}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{badge.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{getCategoryName(badge.category)} Category</p>
                    {badge.earned ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Earned
                      </span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => mintBadge(badge.id)}
                        disabled={mintingBadgeId === badge.id}
                      >
                        {mintingBadgeId === badge.id ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Minting...
                          </>
                        ) : (
                          "Mint Badge"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
