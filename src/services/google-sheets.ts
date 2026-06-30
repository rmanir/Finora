import { useQuery } from '@tanstack/react-query'

export const fetchSheetData = async (range: string) => {
  const url = `/api/google-sheets?range=${encodeURIComponent(range)}`
  const response = await fetch(url)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`API Error: ${errorData.error || response.statusText}`)
  }
  const data = await response.json()
  return data.values as any[][] // Returns a 2D array
}
export const fetchBatchSheetData = async (ranges: string[]) => {
  if (!ranges.length) return [];
  const query = ranges.map(r => `ranges=${encodeURIComponent(r)}`).join('&')
  const url = `/api/google-sheets?${query}`
  const response = await fetch(url)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`API Error: ${errorData.error || response.statusText}`)
  }
  const data = await response.json()
  return data.valueRanges?.map((vr: any) => vr.values || []) || [] // Returns array of 2D arrays
}

// Custom hook to fetch all necessary data
export const useFinanceData = (selectedMonth: string, selectedYear: string) => {
  return useQuery({
    queryKey: ['financeData', selectedMonth, selectedYear],
    queryFn: async () => {
      // 1. Fetch the Monthly transactions sheet (e.g., "August 2025")
      const monthSheetName = `${selectedMonth} ${selectedYear}`

      const ranges = [
        `'${monthSheetName}'!A:E`,
        "'Budget'!A:Z",
        "'category total'!A:Z"
      ];

      const [monthlyData, budgetData, categoryTotalData] = await fetchBatchSheetData(ranges).catch(() => [[], [], []]);

      return {
        monthlyData: monthlyData || [],
        budgetData: budgetData || [],
        categoryTotalData: categoryTotalData || []
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes in the frontend
  })
}

export const useSheetMetadata = () => {
  return useQuery({
    queryKey: ['sheetMetadata'],
    queryFn: async () => {
      const response = await fetch('/api/google-sheets-metadata')
      if (!response.ok) throw new Error('Failed to fetch metadata')
      const data = await response.json()
      return data.sheetNames as string[]
    },
    staleTime: 1000 * 60 * 60 // 1 hour
  })
}

export const useAllInvestments = () => {
  const { data: sheetNames } = useSheetMetadata()

  return useQuery({
    queryKey: ['allInvestments', sheetNames],
    queryFn: async () => {
      if (!sheetNames) return { goldInvestment: 0, stockInvestment: 0 }

      const regex = /^[a-zA-Z]+ \d{4}$/; // matches "August 2025"
      const validMonthSheets = sheetNames.filter(name => regex.test(name));

      if (validMonthSheets.length === 0) return { goldInvestment: 0, stockInvestment: 0 }

      const ranges = validMonthSheets.map(sheet => `'${sheet}'!A:E`);

      // Fetch all months in one batch request
      const allMonthsData = await fetchBatchSheetData(ranges).catch(() => []);

      let goldInvestment = 0;
      let stockInvestment = 0;

      allMonthsData.forEach(monthlyData => {
        if (!monthlyData) return;
        monthlyData.forEach((row: any[]) => {
          const category = row[4]?.toString().trim()
          if (category === 'Investment') {
            const amount = parseFloat(row[0]?.toString().replace(/[^0-9.-]+/g, "")) || 0
            const notes = row[3]?.toString().toLowerCase() || ""

            if (notes.includes('gold')) {
              goldInvestment += amount
            } else if (notes.includes('stock')) {
              stockInvestment += amount
            }
          }
        })
      })

      return { goldInvestment, stockInvestment }
    },
    enabled: !!sheetNames, // only run if sheetNames are loaded
    staleTime: 1000 * 60 * 5,
  })
}
