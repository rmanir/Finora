import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: string
  description?: string
  icon?: React.ReactNode
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  className?: string
}

export function KPICard({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  className,
}: KPICardProps) {
  return (
    <Card className={cn("overflow-hidden backdrop-blur-sm bg-background/95 border-primary/10 hover:border-primary/20 transition-all", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {(description || trendValue) && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center space-x-1">
            {trendValue && (
              <span
                className={cn(
                  "font-medium",
                  trend === "up" && "text-emerald-500",
                  trend === "down" && "text-rose-500",
                  trend === "neutral" && "text-muted-foreground"
                )}
              >
                {trend === "up" ? "↑ " : trend === "down" ? "↓ " : ""}
                {trendValue}
              </span>
            )}
            {description && <span>{description}</span>}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
