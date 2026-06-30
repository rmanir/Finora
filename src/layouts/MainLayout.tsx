import { useState } from "react"
import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { 
  LayoutDashboard, 
  Receipt, 
  TrendingUp, 
  PiggyBank, 
  BarChart3, 
  Settings,
  Menu,
  LogOut
} from "lucide-react"

import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Investments", href: "/investments", icon: TrendingUp },
  { name: "Savings", href: "/savings", icon: PiggyBank },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <div className="flex flex-col space-y-2 mt-4">
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          onClick={onClick}
          className={({ isActive }) =>
            cn(
              "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
              isActive 
                ? "bg-primary/10 text-primary font-medium" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )
          }
        >
          <item.icon className="w-5 h-5" />
          <span>{item.name}</span>
        </NavLink>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card px-4 py-6 sticky top-0 h-screen">
        <div className="flex items-center space-x-2 px-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">F</span>
          </div>
          <span className="text-xl font-bold tracking-tight">Finora</span>
        </div>
        <NavLinks />
        <div className="mt-auto px-4 py-4 border-t flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ModeToggle />
          </div>
          <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-4 border-b bg-card sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">F</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Finora</span>
          </div>
          <div className="flex items-center space-x-2">
            <ModeToggle />
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-6">
                <div className="flex items-center space-x-2 mb-8">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-xl">F</span>
                  </div>
                  <span className="text-xl font-bold tracking-tight">Finora</span>
                </div>
                <NavLinks onClick={() => setIsMobileMenuOpen(false)} />
                <div className="mt-8">
                  <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
