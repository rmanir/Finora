import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCurrency } from "@/components/currency-provider"
import { useSettings } from "@/components/settings-provider"
import { toast } from "sonner"

export default function Settings() {
  const { currency, setCurrency } = useCurrency()
  const { monthlySavingsGoal, setMonthlySavingsGoal, emergencyFundGoal, setEmergencyFundGoal } = useSettings()
  
  const [localMonthlySavings, setLocalMonthlySavings] = useState(monthlySavingsGoal.toString())
  const [localEmergencyFund, setLocalEmergencyFund] = useState(emergencyFundGoal.toString())

  useEffect(() => {
    setLocalMonthlySavings(monthlySavingsGoal.toString())
    setLocalEmergencyFund(emergencyFundGoal.toString())
  }, [monthlySavingsGoal, emergencyFundGoal])

  const handleSave = () => {
    setMonthlySavingsGoal(Number(localMonthlySavings))
    setEmergencyFundGoal(Number(localEmergencyFund))
    toast.success("Settings saved successfully!")
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your personal preferences.
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <div className="bg-card rounded-xl border p-6">
          <h2 className="text-xl font-semibold mb-4">Preferences</h2>
          
          <div className="space-y-6">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Currency</label>
            <Select value={currency} onValueChange={(val: any) => setCurrency(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usd" disabled>USD ($)</SelectItem>
                <SelectItem value="eur" disabled>EUR (€)</SelectItem>
                <SelectItem value="gbp" disabled>GBP (£)</SelectItem>
                <SelectItem value="inr">INR (₹)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Monthly Savings Goal</label>
            <Input 
              type="number" 
              value={localMonthlySavings} 
              onChange={(e) => setLocalMonthlySavings(e.target.value)} 
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Emergency Fund Goal</label>
            <Input 
              type="number" 
              value={localEmergencyFund} 
              onChange={(e) => setLocalEmergencyFund(e.target.value)} 
            />
          </div>

          </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} size="lg">Save</Button>
      </div>
    </div>
  )
}
