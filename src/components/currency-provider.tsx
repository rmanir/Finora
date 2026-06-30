import { createContext, useContext, useEffect, useState } from "react"

type Currency = "usd" | "eur" | "gbp" | "inr"

const currencySymbols: Record<Currency, string> = {
  usd: "$",
  eur: "€",
  gbp: "£",
  inr: "₹",
}

type CurrencyProviderState = {
  currency: Currency
  symbol: string
  setCurrency: (currency: Currency) => void
  formatCurrency: (value: number) => string
}

const initialState: CurrencyProviderState = {
  currency: "usd",
  symbol: "$",
  setCurrency: () => null,
  formatCurrency: (val: number) => `$${val.toLocaleString()}`,
}

const CurrencyProviderContext = createContext<CurrencyProviderState>(initialState)

export function CurrencyProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [currency, setCurrencyState] = useState<Currency>("usd")

  useEffect(() => {
    const stored = localStorage.getItem("finora_currency") as Currency
    if (stored && currencySymbols[stored]) {
      setCurrencyState(stored)
    }
  }, [])

  const setCurrency = (newCurrency: Currency) => {
    localStorage.setItem("finora_currency", newCurrency)
    setCurrencyState(newCurrency)
  }

  const symbol = currencySymbols[currency]

  const formatCurrency = (val: number) => {
    return `${symbol}${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
  }

  return (
    <CurrencyProviderContext.Provider value={{ currency, symbol, setCurrency, formatCurrency }}>
      {children}
    </CurrencyProviderContext.Provider>
  )
}

export const useCurrency = () => {
  const context = useContext(CurrencyProviderContext)
  if (context === undefined)
    throw new Error("useCurrency must be used within a CurrencyProvider")
  return context
}
