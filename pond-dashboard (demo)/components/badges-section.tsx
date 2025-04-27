"use client"

import { useState, useEffect } from "react"
import type { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Award, AlertCircle } from "lucide-react"
import { badgeMetadata, useReputationStore, checkNewBadgeEligibility, getCategoryName } from "@/lib/reputation-store"
import { Badge } from "@/components/ui/badge"

interface BadgesSectionProps {
  contract: ethers.Contract
  account: string
}

interface BadgeItem {
  id: number
  name: string
  category: number
  threshold: number
  description: string
  earned: boolean
  eligible: boolean
}

export default function BadgesSection({ contract, account }: BadgesSectionProps) {
  const [badges, setBadges] = useState<BadgeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [mintingBadgeId, setMintingBadgeId] = useState<number | null>(null)
  const { toast } = useToast()

  const reputationScores = useReputationStore((state) => state.reputationScores)
  const earnedBadges = useReputationStore((state) => state.earnedBadges)
  const mintBadge = useReputationStore((state) => state.mintBadge)
  const checkBadgeEligibility = useReputationStore((state) => state.checkBadgeEligibility)

  // Load badges and subscribe to changes
  useEffect(() => {
    try {
      // Create a complete list of all possible badges
      const allBadges: BadgeItem[] = Object.entries(badgeMetadata).map(([id, metadata]) => {
        const badgeId = Number(id)
        const isEarned = earnedBadges.includes(badgeId)
        const isEligible = checkBadgeEligibility(badgeId)

        return {
          id: badgeId,
          name: metadata.name,
          category: metadata.category,
          threshold: metadata.threshold,
          description: metadata.description,
          earned: isEarned,
          eligible: isEligible,
        }
      })

      setBadges(allBadges)
      setIsLoading(false)
    } catch (error) {
      console.error("Error processing badges:", error)
      setError("Failed to load badges. Please try again.")
      setIsLoading(false)
    }
  }, [earnedBadges, checkBadgeEligibility])

  // Check for badge eligibility changes when reputation scores change
  useEffect(() => {
    const { eligible, lost } = checkNewBadgeEligibility()

    // Notify about newly eligible badges
    eligible.forEach((badgeId) => {
      const badge = badgeMetadata[badgeId]
      if (badge) {
        toast({
          title: "Badge Available!",
          description: `You can now mint the ${badge.name} badge!`,
          variant: "default",
          className: "bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200",
        })
      }
    })

    // Notify about lost badge eligibility
    lost.forEach((badgeId) => {
      const badge = badgeMetadata[badgeId]
      if (badge) {
        toast({
          title: "Badge Eligibility Lost",
          description: `You no longer qualify for the ${badge.name} badge.`,
          variant: "destructive",
        })
      }
    })

    // Update badges list when reputation changes
    setBadges((currentBadges) =>
      currentBadges.map((badge) => {
        const isEligible = checkBadgeEligibility(badge.id)
        return {
          ...badge,
          eligible: isEligible,
        }
      }),
    )
  }, [reputationScores, toast, checkBadgeEligibility])

  const handleMintBadge = async (badgeId: number) => {
    try {
      setMintingBadgeId(badgeId)

      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mint the badge in our store
      const success = mintBadge(badgeId)

      if (success) {
        // Update the badge status
        setBadges(badges.map((badge) => (badge.id === badgeId ? { ...badge, earned: true } : badge)))

        toast({
          title: "Badge Minted Successfully",
          description: `You've successfully minted the ${badgeMetadata[badgeId].name} badge!`,
          className: "bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200",
        })
      } else {
        throw new Error("Not eligible for this badge")
      }
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

  const getCategoryColor = (categoryId: number) => {
    switch (categoryId) {
      case 0:
        return "from-pink-500 to-pink-600"
      case 1:
        return "from-purple-500 to-purple-600"
      case 2:
        return "from-fuchsia-500 to-fuchsia-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  const getCategoryBgColor = (categoryId: number, earned: boolean) => {
    if (!earned) return "bg-gray-100"

    switch (categoryId) {
      case 0:
        return "bg-pink-100"
      case 1:
        return "bg-purple-100"
      case 2:
        return "bg-fuchsia-100"
      default:
        return "bg-gray-100"
    }
  }

  const getCategoryTextColor = (categoryId: number, earned: boolean) => {
    if (!earned) return "text-gray-400"

    switch (categoryId) {
      case 0:
        return "text-pink-600"
      case 1:
        return "text-purple-600"
      case 2:
        return "text-fuchsia-600"
      default:
        return "text-gray-400"
    }
  }

  if (isLoading) {
    return (
      <Card className="border-purple-100 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
          <CardTitle className="text-gray-800">Your Badges</CardTitle>
          <CardDescription>Loading your earned badges...</CardDescription>
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
          <CardTitle className="text-gray-800">Your Badges</CardTitle>
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
        <CardTitle className="text-gray-800">Your Badges</CardTitle>
        <CardDescription>View and mint badges based on your reputation</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {badges.length === 0 ? (
          <div className="text-center py-12 bg-purple-50/50 rounded-lg">
            <AlertCircle className="mx-auto h-12 w-12 text-purple-300 mb-3" />
            <p className="text-gray-500">No badges available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-5 rounded-lg border ${badge.earned ? "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100 shadow-sm" : "bg-white border-gray-100"}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-full ${badge.earned ? "bg-gradient-to-r from-yellow-300 to-amber-500" : getCategoryBgColor(badge.category, badge.eligible)}`}
                  >
                    <Award
                      className={`h-6 w-6 ${badge.earned ? "text-yellow-700" : getCategoryTextColor(badge.category, badge.eligible)}`}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 text-lg">{badge.name}</h3>
                    <p className="text-sm text-gray-500">{getCategoryName(badge.category)} Category</p>
                    <p className="text-xs text-gray-400 mb-3">Required: {badge.threshold} reputation</p>

                    {badge.earned ? (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600">
                        Earned
                      </Badge>
                    ) : badge.eligible ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMintBadge(badge.id)}
                        disabled={mintingBadgeId === badge.id}
                        className="bg-white hover:bg-purple-50 border-purple-200 text-purple-600 hover:text-purple-700"
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
                    ) : (
                      <Badge variant="outline" className="text-gray-500 border-gray-300">
                        Not Eligible
                      </Badge>
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
