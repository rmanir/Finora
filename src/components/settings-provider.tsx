import { createContext, useContext, useEffect, useState } from "react"

type SettingsProviderState = {
  monthlySavingsGoal: number
  emergencyFundGoal: number
  setMonthlySavingsGoal: (val: number) => void
  setEmergencyFundGoal: (val: number) => void
}

const initialState: SettingsProviderState = {
  monthlySavingsGoal: 20000,
  emergencyFundGoal: 300000,
  setMonthlySavingsGoal: () => null,
  setEmergencyFundGoal: () => null,
}

const SettingsProviderContext = createContext<SettingsProviderState>(initialState)

export function SettingsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [monthlySavingsGoal, setMonthlySavingsGoal] = useState<number>(20000)
  const [emergencyFundGoal, setEmergencyFundGoal] = useState<number>(300000)

  useEffect(() => {
    const storedMonthly = localStorage.getItem("finora_monthly_savings_goal")
    const storedEmergency = localStorage.getItem("finora_emergency_fund_goal")
    
    if (storedMonthly) setMonthlySavingsGoal(Number(storedMonthly))
    if (storedEmergency) setEmergencyFundGoal(Number(storedEmergency))
  }, [])

  const handleSetMonthlySavingsGoal = (val: number) => {
    localStorage.setItem("finora_monthly_savings_goal", val.toString())
    setMonthlySavingsGoal(val)
  }

  const handleSetEmergencyFundGoal = (val: number) => {
    localStorage.setItem("finora_emergency_fund_goal", val.toString())
    setEmergencyFundGoal(val)
  }

  return (
    <SettingsProviderContext.Provider value={{
      monthlySavingsGoal,
      emergencyFundGoal,
      setMonthlySavingsGoal: handleSetMonthlySavingsGoal,
      setEmergencyFundGoal: handleSetEmergencyFundGoal
    }}>
      {children}
    </SettingsProviderContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsProviderContext)
  if (context === undefined)
    throw new Error("useSettings must be used within a SettingsProvider")
  return context
}
