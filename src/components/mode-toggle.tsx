import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center space-x-1 rounded-full border bg-muted/30 p-1 w-fit shadow-sm">
      <button
        onClick={() => setTheme("system")}
        className={cn(
          "flex items-center justify-center rounded-full p-2.5 transition-all duration-300",
          theme === "system" ? "bg-background shadow-md scale-100 text-foreground" : "text-muted-foreground hover:text-foreground scale-95 hover:bg-muted"
        )}
      >
        <Monitor className="h-4 w-4" />
        <span className="sr-only">System</span>
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={cn(
          "flex items-center justify-center rounded-full p-2.5 transition-all duration-300",
          theme === "dark" ? "bg-background shadow-md scale-100 text-foreground" : "text-muted-foreground hover:text-foreground scale-95 hover:bg-muted"
        )}
      >
        <Moon className="h-4 w-4" />
        <span className="sr-only">Dark</span>
      </button>
      <button
        onClick={() => setTheme("light")}
        className={cn(
          "flex items-center justify-center rounded-full p-2.5 transition-all duration-300",
          theme === "light" ? "bg-background shadow-md scale-100 text-foreground" : "text-muted-foreground hover:text-foreground scale-95 hover:bg-muted"
        )}
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">Light</span>
      </button>
    </div>
  )
}
