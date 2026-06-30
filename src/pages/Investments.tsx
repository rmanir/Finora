import { useState, useEffect, useMemo } from "react"
import { KPICard } from "@/components/dashboard/kpi-card"
import { useCurrency } from "@/components/currency-provider"
import { useFinanceData, useAllInvestments } from "@/services/google-sheets"
import { Loader2 } from "lucide-react"

export default function Investments() {
  const { formatCurrency } = useCurrency()
  const [selectedMonth, setSelectedMonth] = useState(() => localStorage.getItem('finora_month') || "August")
  const [selectedYear, setSelectedYear] = useState(() => localStorage.getItem('finora_year') || "2025")

  useEffect(() => {
    const handleStorageChange = () => {
      setSelectedMonth(localStorage.getItem('finora_month') || "August")
      setSelectedYear(localStorage.getItem('finora_year') || "2025")
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const { data, isLoading: isFinanceDataLoading } = useFinanceData(selectedMonth, selectedYear)
  const { data: allInvestmentsData, isLoading: isAllInvestmentsLoading } = useAllInvestments()

  const isLoading = isFinanceDataLoading || isAllInvestmentsLoading
  const goldInvestment = allInvestmentsData?.goldInvestment || 0
  const stockInvestment = allInvestmentsData?.stockInvestment || 0

  const { totalInvestments } = useMemo(() => {
    let totalInvestments = 0

    if (data && data.categoryTotalData.length > 0) {
      data.categoryTotalData.forEach((row: any) => {
        const category = row[0]?.toString()
        if (category === 'Investment') {
          const sum = row.slice(1).reduce((acc: number, val: any) => {
            const num = parseFloat(val?.toString().replace(/[^0-9.-]+/g, "")) || 0
            return acc + num
          }, 0)
          totalInvestments += sum
        }
      })
    }

    return { totalInvestments }
  }, [data])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Investments</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your portfolio growth and asset allocation.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <KPICard title="Total Investment" value={formatCurrency(totalInvestments)} />
            <KPICard title="Gold Investment" value={formatCurrency(goldInvestment)} />
            <KPICard title="Stock Investment" value={formatCurrency(stockInvestment)} />
          </div>

          <div className="flex items-center justify-center h-64 border rounded-xl border-dashed bg-card mt-8">
            <p className="text-muted-foreground text-sm">Detailed charts and allocation coming soon...</p>
          </div>
        </>
      )}
    </div>
  )
}

