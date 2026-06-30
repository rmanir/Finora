export const mockKPIs = {
  monthlyIncome: 82280,
  monthlyExpense: 81817,
  remainingBalance: -23815,
  savingsRate: 29.5,
  investmentAmount: 24278,
  emergencyFundContribution: 0,
  netCashFlow: -23815,
}

export const mockMonthlyTrends = [
  { month: "Mar", income: 113000, expense: 66000, balance: 22000, investment: 25000 },
  { month: "Apr", income: 113000, expense: 67000, balance: 21000, investment: 25000 },
  { month: "May", income: 113000, expense: 65000, balance: 23000, investment: 25000 },
  { month: "Jun", income: 113000, expense: 68000, balance: 20000, investment: 25000 },
  { month: "Jul", income: 113000, expense: 69000, balance: 19000, investment: 25000 },
  { month: "Aug", income: 82280, expense: 81817, balance: -23815, investment: 24278 },
]

export const mockExpenseBreakdown = [
  { name: "Rent", value: 16430, fill: "hsl(var(--chart-1))" },
  { name: "Grocery", value: 3142, fill: "hsl(var(--chart-2))" },
  { name: "Travel", value: 5720, fill: "hsl(var(--chart-3))" },
  { name: "Entertainment", value: 7378, fill: "hsl(var(--chart-4))" },
  { name: "Petrol", value: 8566, fill: "hsl(var(--chart-5))" },
  { name: "Others", value: 39276, fill: "hsl(var(--chart-1))" },
]

export const mockBudgetVsActual = [
  { category: "Rent", budget: 17000, actual: 16430 },
  { category: "Grocery", budget: 9000, actual: 3142 },
  { category: "Travel", budget: 8000, actual: 5720 },
  { category: "Entertainment", budget: 10000, actual: 7378 },
  { category: "Investment", budget: 25000, actual: 24278 },
  { category: "Petrol", budget: 2000, actual: 8566 },
  { category: "Gas & Water", budget: 1000, actual: 0 },
  { category: "Medicine", budget: 3000, actual: 0 },
  { category: "EB & EC", budget: 3000, actual: 1305 },
  { category: "Others", budget: 15000, actual: 39276 },
  { category: "Emergency Fund", budget: 20000, actual: 0 },
]

export const mockEmergencyFund = {
  current: 12500,
  target: 30000,
}
