"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, TrendingUp, TrendingDown, Zap } from "lucide-react"
import { useReputationStore, getCategoryName } from "@/lib/reputation-store"
import type { ethers } from "ethers"

interface ReputationControlsProps {
  contract: ethers.Contract
  account: string
}

export default function ReputationControls({ contract, account }: ReputationControlsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("0")
  const [amount, setAmount] = useState<string>("10")
  const [isBoostLoading, setIsBoostLoading] = useState(false)
  const [isDecayLoading, setIsDecayLoading] = useState(false)
  const [isMultiBoostLoading, setIsMultiBoostLoading] = useState(false)
  const { toast } = useToast()

  const updateReputation = useReputationStore((state) => state.updateReputation)
  const decayReputation = useReputationStore((state) => state.decayReputation)
  const multiBoostReputation = useReputationStore((state) => state.multiBoostReputation)

  const handleBoostReputation = async () => {
    if (!amount || isNaN(Number(amount))) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid number for the reputation amount.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsBoostLoading(true)

      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update reputation in our store
      updateReputation(Number(selectedCategory), Number(amount))

      toast({
        title: "Reputation Boosted",
        description: `Successfully boosted your ${getCategoryName(Number(selectedCategory))} reputation by ${amount} points.`,
      })
    } catch (error) {
      console.error("Error boosting reputation:", error)
      toast({
        title: "Transaction Failed",
        description: "Failed to boost reputation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsBoostLoading(false)
    }
  }

  const handleDecayReputation = async () => {
    if (!amount || isNaN(Number(amount))) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid number for the reputation amount.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsDecayLoading(true)

      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Decay reputation in our store
      decayReputation(Number(selectedCategory), Number(amount))

      toast({
        title: "Reputation Decayed",
        description: `Successfully decayed your ${getCategoryName(Number(selectedCategory))} reputation by ${amount} points.`,
      })
    } catch (error) {
      console.error("Error decaying reputation:", error)
      toast({
        title: "Transaction Failed",
        description: "Failed to decay reputation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDecayLoading(false)
    }
  }

  const handleMultiBoostReputation = async () => {
    if (!amount || isNaN(Number(amount))) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid number for the reputation amount.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsMultiBoostLoading(true)

      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Boost all categories in our store
      multiBoostReputation(Number(amount))

      toast({
        title: "All Reputations Boosted",
        description: `Successfully boosted all reputation categories by ${amount} points.`,
      })
    } catch (error) {
      console.error("Error multi-boosting reputation:", error)
      toast({
        title: "Transaction Failed",
        description: "Failed to boost all reputations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsMultiBoostLoading(false)
    }
  }

  return (
    <Card className="border-purple-100 shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
        <CardTitle className="text-gray-800">Manage Reputation</CardTitle>
        <CardDescription>Boost or decay your reputation scores (for demo purposes)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-5">
          <div>
            <Label htmlFor="category" className="text-gray-700">
              Select Category
            </Label>
            <RadioGroup
              id="category"
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              className="flex flex-wrap gap-4 mt-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0" id="defi" className="text-pink-600 border-pink-400 focus:ring-pink-400" />
                <Label htmlFor="defi" className="cursor-pointer text-gray-700 font-medium">
                  DeFi
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="1"
                  id="governance"
                  className="text-purple-600 border-purple-400 focus:ring-purple-400"
                />
                <Label htmlFor="governance" className="cursor-pointer text-gray-700 font-medium">
                  Governance
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="2"
                  id="social"
                  className="text-fuchsia-600 border-fuchsia-400 focus:ring-fuchsia-400"
                />
                <Label htmlFor="social" className="cursor-pointer text-gray-700 font-medium">
                  Social
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="amount" className="text-gray-700">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-2 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
              min="1"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleBoostReputation}
            disabled={isBoostLoading}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            {isBoostLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Boosting...
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                Boost Reputation
              </>
            )}
          </Button>

          <Button
            onClick={handleDecayReputation}
            disabled={isDecayLoading}
            variant="outline"
            className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            {isDecayLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Decaying...
              </>
            ) : (
              <>
                <TrendingDown className="mr-2 h-4 w-4" />
                Decay Reputation
              </>
            )}
          </Button>
        </div>

        <div className="pt-2">
          <Button
            onClick={handleMultiBoostReputation}
            disabled={isMultiBoostLoading}
            variant="secondary"
            className="w-full bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700"
          >
            {isMultiBoostLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Boosting All Categories...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Boost All Categories
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
