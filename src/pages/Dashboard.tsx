import { useState, useMemo, useEffect } from "react"
import { 
  Cell, 
  Legend, 
  Pie, 
  PieChart, 
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer, 
  Tooltip 
} from "recharts"
import { 
  DollarSign, 
  TrendingDown, 
  Wallet,
  Activity,
  Loader2
} from "lucide-react"

import { KPICard } from "@/components/dashboard/kpi-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCurrency } from "@/components/currency-provider"
import { useFinanceData, useSheetMetadata } from "@/services/google-sheets"

export default function Dashboard() {
  const { formatCurrency } = useCurrency()

  const [selectedMonth, setSelectedMonth] = useState(() => localStorage.getItem('finora_month') || "August")
  const [selectedYear, setSelectedYear] = useState(() => localStorage.getItem('finora_year') || "2025")

  useEffect(() => {
    localStorage.setItem('finora_month', selectedMonth)
    localStorage.setItem('finora_year', selectedYear)
  }, [selectedMonth, selectedYear])

  const { data: metadata } = useSheetMetadata()
  
  // Extract unique months and years from sheet names
  const { yearToMonthsMap, availableYears } = useMemo(() => {
    const map = new Map<string, Set<string>>()
    
    if (metadata) {
      const regex = /^(January|February|March|April|May|June|July|August|September|October|November|December)\s(\d{4})$/i
      metadata.forEach(sheetName => {
        const match = sheetName.match(regex)
        if (match) {
          const month = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase()
          const year = match[2]
          if (!map.has(year)) {
            map.set(year, new Set())
          }
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

  // Automatically adjust month if the newly selected year doesn't contain the current month
  useEffect(() => {
    if (metadata && availableMonths.length > 0 && !availableMonths.includes(selectedMonth)) {
      setSelectedMonth(availableMonths[0])
    }
  }, [availableMonths, selectedMonth, metadata])

  // Fetch live data from Google Sheets!
  const { data, isLoading, error } = useFinanceData(selectedMonth, selectedYear)

  // Parse the data safely
  const parsedData = useMemo(() => {
    let monthlyIncome = 0
    let monthlyExpense = 0
    let emergencyFund = 0
    let investments = 0
    const expenseBreakdown: any[] = []

    if (data && data.monthlyData.length > 0) {
      // monthlyData: [Amount, Date, Credit/Debit, Notes, Category]
      // Skip header row if it exists
      const rows = data.monthlyData.slice(1)
      
      rows.forEach((row: any) => {
        const amount = parseFloat(row[0]?.toString().replace(/[^0-9.-]+/g,"")) || 0
        const type = row[2]?.toString().toLowerCase().trim()
        const category = row[4]?.toString().trim()

        if (type === 'credit' || category === 'Income') {
          monthlyIncome += amount
        } else if (type === 'debit' || amount > 0) {
          monthlyExpense += amount
          
          if (category === 'Emergency Fund') emergencyFund += amount
          else if (category === 'Investment') investments += amount
          else {
            // Group expenses by category
            const existing = expenseBreakdown.find(e => e.name === category)
            if (existing) existing.value += amount
            else if (category) expenseBreakdown.push({ name: category, value: amount, fill: `hsl(var(--chart-${(expenseBreakdown.length % 5) + 1}))` })
          }
        }
      })
    }

    const remainingBalance = monthlyIncome - monthlyExpense
    const savingsRate = monthlyIncome > 0 ? ((remainingBalance / monthlyIncome) * 100).toFixed(1) : 0

    return {
      monthlyIncome,
      monthlyExpense,
      remainingBalance,
      savingsRate,
      emergencyFund,
      investments,
      expenseBreakdown
    }
  }, [data])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Your personal financial overview.
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
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Fetching data from Google Sheets...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
          Error fetching data. Make sure your Sheet is accessible and the tab "{selectedMonth} {selectedYear}" exists!
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* KPI Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Monthly Income"
              value={formatCurrency(parsedData.monthlyIncome)}
              icon={<DollarSign className="h-4 w-4 text-emerald-500" />}
            />
            <KPICard
              title="Monthly Expense"
              value={formatCurrency(parsedData.monthlyExpense)}
              icon={<TrendingDown className="h-4 w-4 text-rose-500" />}
            />
            <KPICard
              title="Remaining Balance"
              value={formatCurrency(parsedData.remainingBalance)}
              icon={<Wallet className="h-4 w-4 text-blue-500" />}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Investments"
              value={formatCurrency(parsedData.investments)}
              icon={<Activity className="h-4 w-4 text-orange-500" />}
            />
            <KPICard
              title="Emergency Fund"
              value={formatCurrency(parsedData.emergencyFund)}
              icon={<Wallet className="h-4 w-4 text-teal-500" />}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
            {/* Income vs Expense Bar Chart */}
            <Card className="col-span-full lg:col-span-4 bg-background/40 backdrop-blur-xl border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle>Income vs Expense</CardTitle>
                <CardDescription>
                  Comparison for {selectedMonth} {selectedYear}.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Summary', Income: parsedData.monthlyIncome, Expense: parsedData.monthlyExpense }
                  ]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(val) => `$${val}`} />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(value: any) => [formatCurrency(value as number), undefined]}
                    />
                    <Legend />
                    <Bar dataKey="Income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={80} />
                    <Bar dataKey="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={80} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Expense Breakdown Donut Chart */}
            <Card className="col-span-full lg:col-span-3 bg-background/40 backdrop-blur-xl border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>
                  Where your money is going this month.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[450px]">
                {parsedData.expenseBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={parsedData.expenseBreakdown}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {parsedData.expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                        formatter={(value: any) => [formatCurrency(value as number), undefined]}
                      />
                      <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: "10px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No expense data found for {selectedMonth} {selectedYear}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
