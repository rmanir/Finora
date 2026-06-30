import { useState, useMemo, useEffect } from "react"
import { Search, Loader2, ArrowUpDown } from "lucide-react"

import { KPICard } from "@/components/dashboard/kpi-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { useCurrency } from "@/components/currency-provider"
import { useFinanceData, useSheetMetadata } from "@/services/google-sheets"

export default function Expenses() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  type SortKey = 'date' | 'description' | 'category' | 'amount'
  const [sortConfig, setSortConfig] = useState<{key: SortKey, direction: 'asc' | 'desc'} | null>(null)
  const { formatCurrency, symbol } = useCurrency()

  const [selectedMonth, setSelectedMonth] = useState(() => localStorage.getItem('finora_month') || "August")
  const [selectedYear, setSelectedYear] = useState(() => localStorage.getItem('finora_year') || "2025")

  useEffect(() => {
    localStorage.setItem('finora_month', selectedMonth)
    localStorage.setItem('finora_year', selectedYear)
  }, [selectedMonth, selectedYear])

  const { data: metadata } = useSheetMetadata()
  const { yearToMonthsMap, availableYears } = useMemo(() => {
    const map = new Map<string, Set<string>>()
    if (metadata) {
      const regex = /^(January|February|March|April|May|June|July|August|September|October|November|December)\s(\d{4})$/i
      metadata.forEach(sheetName => {
        const match = sheetName.match(regex)
        if (match) {
          const month = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase()
          const year = match[2]
          if (!map.has(year)) { map.set(year, new Set()) }
          map.get(year)!.add(month)
        }
      })
    }
    const finalYears = Array.from(map.keys()).sort()
    return { yearToMonthsMap: map, availableYears: finalYears.length > 0 ? finalYears : ["2024", "2025", "2026", "2027"] }
  }, [metadata])

  const defaultMonths = useMemo(() => ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], [])
  const availableMonths = useMemo(() => {
    if (yearToMonthsMap.has(selectedYear)) {
      return Array.from(yearToMonthsMap.get(selectedYear)!).sort((a, b) => defaultMonths.indexOf(a) - defaultMonths.indexOf(b))
    }
    return defaultMonths
  }, [selectedYear, yearToMonthsMap, defaultMonths])

  useEffect(() => {
    if (metadata && availableMonths.length > 0 && !availableMonths.includes(selectedMonth)) {
      setSelectedMonth(availableMonths[0])
    }
  }, [availableMonths, selectedMonth, metadata])

  const { data, isLoading, error } = useFinanceData(selectedMonth, selectedYear)

  const { transactions, totalExpenses, highestExpense, averageDaily, topCategory, categories } = useMemo(() => {
    const txs: any[] = []
    let total = 0
    let highest = { amount: 0, category: "" }
    const categoryTotals: Record<string, number> = {}

    if (data && data.monthlyData.length > 0) {
      const rows = data.monthlyData.slice(1)
      rows.forEach((row: any, index: number) => {
        const amountStr = row[0]?.toString() || ""
        const amount = parseFloat(amountStr.replace(/[^0-9.-]+/g, "")) || 0
        const date = row[1]?.toString() || ""
        const type = row[2]?.toString().toLowerCase().trim()
        const notes = row[3]?.toString() || ""
        const category = row[4]?.toString().trim() || "Others"

        if (type === 'debit' || (type !== 'credit' && category !== 'Income' && amount > 0)) {
          txs.push({
            id: index.toString(),
            date,
            description: notes,
            category,
            amount
          })
          total += amount
          if (amount > highest.amount) {
            highest = { amount, category }
          }
          categoryTotals[category] = (categoryTotals[category] || 0) + amount
        }
      })
    }

    let topCat = { name: "N/A", percentage: "0", total: 0 }
    let allCategories = new Set<string>()
    for (const [cat, amt] of Object.entries(categoryTotals)) {
      allCategories.add(cat)
      if (amt > topCat.total) {
        topCat = { name: cat, percentage: ((amt / total) * 100).toFixed(0), total: amt }
      }
    }

    const uniqueDays = new Set(txs.map(t => t.date)).size
    const avg = uniqueDays > 0 ? total / uniqueDays : 0

    return { 
      transactions: txs, 
      totalExpenses: total,
      highestExpense: highest,
      averageDaily: avg,
      topCategory: topCat,
      categories: Array.from(allCategories).sort()
    }
  }, [data])

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "All" || t.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const sortedTransactions = useMemo(() => {
    let sortableItems = [...filteredTransactions]
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]
        
        if (sortConfig.key === 'date') {
          aValue = new Date(aValue).getTime() || 0
          bValue = new Date(bValue).getTime() || 0
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return sortableItems
  }, [filteredTransactions, sortConfig])

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground mt-1">
            Track and analyze your spending habits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(y => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Fetching data...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
          Error fetching data.
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard title="Total Expenses" value={formatCurrency(totalExpenses)} />
            <KPICard title="Highest Expense" value={formatCurrency(highestExpense.amount)} description={highestExpense.category || "N/A"} />
            <KPICard title="Average Daily" value={formatCurrency(averageDaily)} />
            <KPICard title="Top Category" value={topCategory.name} description={`${topCategory.percentage}% of total`} />
          </div>

          <div className="bg-card rounded-xl border">
            <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search transactions..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    {categories.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-0 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('date')}>
                      <div className="flex items-center">Date <ArrowUpDown className="ml-2 h-4 w-4" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('description')}>
                      <div className="flex items-center">Description <ArrowUpDown className="ml-2 h-4 w-4" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('category')}>
                      <div className="flex items-center">Category <ArrowUpDown className="ml-2 h-4 w-4" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors text-right" onClick={() => handleSort('amount')}>
                      <div className="flex items-center justify-end">Amount <ArrowUpDown className="ml-2 h-4 w-4" /></div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTransactions.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{tx.date}</TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                          {tx.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">{symbol}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))}
                  {sortedTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

