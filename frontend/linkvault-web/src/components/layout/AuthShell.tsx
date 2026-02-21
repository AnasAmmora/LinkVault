import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="min-h-svh bg-gradient-to-b from-background to-muted/60 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">{title}</CardTitle>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </CardHeader>
          <CardContent className="space-y-4">
            {children}
            {footer}
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          LinkVault • Simple & fast link organizer
        </p>
      </div>
    </div>
  )
}