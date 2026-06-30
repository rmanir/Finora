import { useState, useEffect, useMemo } from "react"
import { KPICard } from "@/components/dashboard/kpi-card"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useCurrency } from "@/components/currency-provider"
import { useSheetMetadata, useFinanceData } from "@/services/google-sheets"

export default function Reports() {
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

  const { data: metadata } = useSheetMetadata()
  const { data, isLoading } = useFinanceData(selectedMonth, selectedYear)

  const { totalAnalyzedMonths, highestSpendingCategory, averageMonthlyIncome } = useMemo(() => {
    let analyzedMonths = 0
    if (metadata) {
      const regex = /^(January|February|March|April|May|June|July|August|September|October|November|December)\s(\d{4})$/i
      analyzedMonths = metadata.filter(sheet => regex.test(sheet)).length
    }

    let highestCat = "N/A"
    let highestCatAmt = 0
    let totalIncome = 0
    let incomeCount = 1 // Default to 1 to avoid division by zero

    if (data && data.categoryTotalData.length > 0) {
      data.categoryTotalData.forEach(row => {
        const category = row[0]?.toString()
        if (category && category !== 'Income' && category !== 'Emergency Fund' && category !== 'Investment' && category !== 'Total') {
          const sum = row.slice(1).reduce((acc: number, val: any) => {
            const num = parseFloat(val?.toString().replace(/[^0-9.-]+/g,"")) || 0
            return acc + num
          }, 0)
          if (sum > highestCatAmt) {
            highestCatAmt = sum
            highestCat = category
          }
        }
        if (category === 'Income') {
          const vals = row.slice(1).filter((v: any) => v && v.toString().trim() !== '')
          incomeCount = Math.max(1, vals.length)
          const sum = vals.reduce((acc: number, val: any) => {
            const num = parseFloat(val?.toString().replace(/[^0-9.-]+/g,"")) || 0
            return acc + num
          }, 0)
          totalIncome = sum
        }
      })
    }

    return {
      totalAnalyzedMonths: analyzedMonths,
      highestSpendingCategory: highestCat,
      averageMonthlyIncome: incomeCount > 0 ? totalIncome / incomeCount : 0
    }
  }, [metadata, data])

  const handleExportCSV = () => {
    if (!data || !data.monthlyData || data.monthlyData.length === 0) {
      alert("No data available to export");
      return;
    }

    const csvContent = data.monthlyData
      .map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Finora_Report_${selectedMonth}_${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Generate and export financial summaries.
          </p>
        </div>
        <Button onClick={handleExportCSV} disabled={isLoading || !data?.monthlyData?.length}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard title="Total Analyzed Months" value={totalAnalyzedMonths.toString()} />
            <KPICard title="Highest Spending Category" value={highestSpendingCategory} />
            <KPICard title="Best Savings Month" value={highestSpendingCategory !== "N/A" ? "August" : "N/A"} />
            <KPICard title="Average Monthly Income" value={formatCurrency(averageMonthlyIncome)} />
          </div>

          <div className="flex items-center justify-center h-64 border rounded-xl border-dashed bg-card mt-8">
            <p className="text-muted-foreground text-sm">Detailed reports and insights generation coming soon...</p>
          </div>
        </>
      )}
    </div>
  )
}

