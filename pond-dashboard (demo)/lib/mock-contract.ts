import type { ethers } from "ethers"
import { create } from "zustand"
import { persist } from "zustand/middleware"

// Badge metadata with reputation thresholds
export const badgeMetadata: Record<number, { name: string; category: number; threshold: number; description: string }> =
  {
    1: { name: "DeFi Pioneer", category: 0, threshold: 25, description: "Achieved 25 reputation in DeFi" },
    2: { name: "Governance Voter", category: 1, threshold: 25, description: "Achieved 25 reputation in Governance" },
    3: { name: "Social Contributor", category: 2, threshold: 25, description: "Achieved 25 reputation in Social" },
    4: { name: "DeFi Expert", category: 0, threshold: 50, description: "Achieved 50 reputation in DeFi" },
    5: { name: "Governance Leader", category: 1, threshold: 50, description: "Achieved 50 reputation in Governance" },
    6: { name: "Community Builder", category: 2, threshold: 50, description: "Achieved 50 reputation in Social" },
  }

// Store interface
interface PondStore {
  // Reputation scores
  reputationScores: {
    0: number // DeFi
    1: number // Governance
    2: number // Social
  }
  // Earned badges
  earnedBadges: number[]
  // Methods
  updateReputation: (category: number, amount: number) => void
  decayReputation: (category: number, amount: number) => void
  multiBoostReputation: (amounts: number) => void
  mintBadge: (badgeId: number) => Promise<boolean>
  checkBadgeEligibility: (badgeId: number) => boolean
  getReputation: (category: number) => number
  getBadges: () => number[]
}

// Create the store with persistence
export const usePondStore = create<PondStore>()(
  persist(
    (set, get) => ({
      reputationScores: {
        0: 0, // DeFi
        1: 0, // Governance
        2: 0, // Social
      },
      earnedBadges: [],

      updateReputation: (category, amount) => {
        set((state) => {
          const newScores = { ...state.reputationScores }
          newScores[category] = Math.max(0, newScores[category] + amount)
          return { reputationScores: newScores }
        })
      },

      decayReputation: (category, amount) => {
        set((state) => {
          const newScores = { ...state.reputationScores }
          newScores[category] = Math.max(0, newScores[category] - amount)
          return { reputationScores: newScores }
        })
      },

      multiBoostReputation: (amount) => {
        set((state) => {
          const newScores = { ...state.reputationScores }
          newScores[0] = Math.max(0, newScores[0] + amount)
          newScores[1] = Math.max(0, newScores[1] + amount)
          newScores[2] = Math.max(0, newScores[2] + amount)
          return { reputationScores: newScores }
        })
      },

      mintBadge: async (badgeId) => {
        const isEligible = get().checkBadgeEligibility(badgeId)
        if (isEligible) {
          set((state) => ({
            earnedBadges: [...state.earnedBadges, badgeId],
          }))
          return true
        }
        return false
      },

      checkBadgeEligibility: (badgeId) => {
        const badge = badgeMetadata[badgeId]
        if (!badge) return false

        const currentScore = get().reputationScores[badge.category]
        return currentScore >= badge.threshold
      },

      getReputation: (category) => {
        return get().reputationScores[category] || 0
      },

      getBadges: () => {
        return get().earnedBadges
      },
    }),
    {
      name: "pond-reputation-storage",
    },
  ),
)

// Mock contract class that mimics ethers.Contract
export class MockContract {
  async getReputation(user: string, category: number): Promise<ethers.BigNumberish> {
    return usePondStore.getState().getReputation(category)
  }

  async getBadges(user: string): Promise<number[]> {
    return usePondStore.getState().getBadges()
  }

  async updateReputation(user: string, category: number, amount: ethers.BigNumberish): Promise<any> {
    // Simulate transaction delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    usePondStore.getState().updateReputation(Number(category), Number(amount))
    return { wait: async () => {} }
  }

  async decayReputation(user: string, category: number, amount: ethers.BigNumberish): Promise<any> {
    // Simulate transaction delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    usePondStore.getState().decayReputation(Number(category), Number(amount))
    return { wait: async () => {} }
  }

  async multiBoostReputation(user: string, categories: number[], amounts: ethers.BigNumberish[]): Promise<any> {
    // Simulate transaction delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    usePondStore.getState().multiBoostReputation(Number(amounts[0]))
    return { wait: async () => {} }
  }

  async mintBadge(badgeId: number): Promise<any> {
    // Simulate transaction delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const success = await usePondStore.getState().mintBadge(badgeId)
    if (!success) {
      throw new Error("Not eligible for this badge")
    }
    return { wait: async () => {} }
  }
}

// Helper function to check if a user is eligible for any new badges
export function checkNewBadgeEligibility(): { eligible: number[]; lost: number[] } {
  const store = usePondStore.getState()
  const earnedBadges = store.getBadges()

  const eligible: number[] = []
  const lost: number[] = []

  // Check all badges
  Object.entries(badgeMetadata).forEach(([idStr, badge]) => {
    const id = Number(idStr)
    const isEligible = store.checkBadgeEligibility(id)
    const isEarned = earnedBadges.includes(id)

    if (isEligible && !isEarned) {
      eligible.push(id)
    } else if (!isEligible && isEarned) {
      lost.push(id)
    }
  })

  return { eligible, lost }
}

// Helper to get category name
export function getCategoryName(categoryId: number): string {
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
