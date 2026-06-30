import { useMemo } from "react"
import { KPICard } from "@/components/dashboard/kpi-card"
import { useSettings } from "@/components/settings-provider"
import { useCurrency } from "@/components/currency-provider"
import { useFinanceData } from "@/services/google-sheets"
import { Loader2 } from "lucide-react"

export default function Savings() {
  const { emergencyFundGoal } = useSettings()
  const { formatCurrency } = useCurrency()

  // We can fetch data for all months or just rely on the Category Total Sheet
  const { data, isLoading } = useFinanceData("August", "2025") // You might want to remove month dependency for savings

  const parsedSavings = useMemo(() => {
    let totalSavings = 0
    let totalInvestments = 0

    if (data && data.categoryTotalData.length > 0) {
      // Example parsing for Category Total Sheet
      // Assuming Column A is Category, and we sum up the rest of the columns
      data.categoryTotalData.forEach((row: any) => {
        const category = row[0]?.toString()
        if (category === 'Emergency Fund' || category === 'Investment') {
          // Sum columns B through Z for this category
          const sum = row.slice(1).reduce((acc: number, val: any) => {
            const num = parseFloat(val?.toString().replace(/[^0-9.-]+/g,"")) || 0
            return acc + num
          }, 0)

          if (category === 'Emergency Fund') totalSavings += sum
          if (category === 'Investment') totalInvestments += sum
        }
      })
    }

    return { totalSavings, totalInvestments }
  }, [data])

  const efProgress = ((parsedSavings.totalSavings / emergencyFundGoal) * 100).toFixed(1)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Savings & Goals</h1>
        <p className="text-muted-foreground mt-1">
          Track your emergency fund and savings goals across all months.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard title="Total Emergency Fund" value={formatCurrency(parsedSavings.totalSavings)} />
            <KPICard title="Total Investments" value={formatCurrency(parsedSavings.totalInvestments)} />
            <KPICard title="Emergency Fund Target" value={formatCurrency(emergencyFundGoal)} />
            <KPICard title="EF Progress" value={`${efProgress}%`} />
          </div>

          <div className="flex items-center justify-center h-64 border rounded-xl border-dashed bg-card mt-8">
            <p className="text-muted-foreground text-sm">Detailed goal tracking coming soon...</p>
          </div>
        </>
      )}
    </div>
  )
}
