import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/components/theme-provider"
import { CurrencyProvider } from "@/components/currency-provider"
import { SettingsProvider } from "@/components/settings-provider"
import { MainLayout } from "@/layouts/MainLayout"
import { Toaster } from "sonner"
// Pages
import Dashboard from "@/pages/Dashboard"
import Expenses from "@/pages/Expenses"
import Investments from "@/pages/Investments"
import Savings from "@/pages/Savings"
import Reports from "@/pages/Reports"
import Settings from "@/pages/Settings"
import Login from "@/pages/Login"
import { ProtectedRoute } from "@/components/ProtectedRoute"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="finora-theme">
        <SettingsProvider>
          <CurrencyProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<MainLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="expenses" element={<Expenses />} />
                    <Route path="investments" element={<Investments />} />
                    <Route path="savings" element={<Savings />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Route>
              </Routes>
          </BrowserRouter>
        </CurrencyProvider>
        </SettingsProvider>
      </ThemeProvider>
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  )
}

export default App
