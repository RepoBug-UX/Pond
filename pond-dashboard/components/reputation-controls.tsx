"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, TrendingUp, TrendingDown } from "lucide-react"

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

      // Call the updateReputation function on the contract
      const tx = await contract.updateReputation(account, selectedCategory, ethers.parseUnits(amount, 0))

      toast({
        title: "Transaction Submitted",
        description: "Your reputation boost transaction has been submitted.",
      })

      // Wait for the transaction to be mined
      await tx.wait()

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

      // Call the decayReputation function on the contract
      const tx = await contract.decayReputation(account, selectedCategory, ethers.parseUnits(amount, 0))

      toast({
        title: "Transaction Submitted",
        description: "Your reputation decay transaction has been submitted.",
      })

      // Wait for the transaction to be mined
      await tx.wait()

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

      // Boost all three categories at once
      const categories = [0, 1, 2]
      const amounts = categories.map(() => ethers.parseUnits(amount, 0))

      // Call the multiBoostReputation function on the contract
      const tx = await contract.multiBoostReputation(account, categories, amounts)

      toast({
        title: "Transaction Submitted",
        description: "Your multi-boost transaction has been submitted.",
      })

      // Wait for the transaction to be mined
      await tx.wait()

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Reputation</CardTitle>
        <CardDescription>Boost or decay your reputation scores (for demo purposes)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="category">Select Category</Label>
            <RadioGroup
              id="category"
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              className="flex space-x-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0" id="defi" />
                <Label htmlFor="defi" className="cursor-pointer">
                  DeFi
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="governance" />
                <Label htmlFor="governance" className="cursor-pointer">
                  Governance
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="social" />
                <Label htmlFor="social" className="cursor-pointer">
                  Social
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1"
              min="1"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleBoostReputation} disabled={isBoostLoading} className="flex-1">
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

          <Button onClick={handleDecayReputation} disabled={isDecayLoading} variant="outline" className="flex-1">
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
            className="w-full"
          >
            {isMultiBoostLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Boosting All Categories...
              </>
            ) : (
              "Boost All Categories"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
