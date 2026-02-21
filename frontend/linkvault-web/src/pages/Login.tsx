import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import AuthShell from "@/components/layout/AuthShell"
import { useAuth } from "@/auth/AuthContext"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Login() {
  const nav = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to manage your collections and links."
      footer={
        <p className="text-sm text-muted-foreground">
          No account?{" "}
          <Link className="text-foreground underline underline-offset-4" to="/register">
            Register
          </Link>
        </p>
      }
    >
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault()
          setLoading(true)
          try {
            await login({ email, password })
            toast.success("Logged in successfully.")
            nav("/dashboard")
          } catch (ex: any) {
            toast.error(ex?.response?.data ?? "Login failed")
          } finally {
            setLoading(false)
          }
        }}
      >
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>

        <div className="space-y-2">
          <Label>Password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>

        <Button className="w-full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </AuthShell>
  )
}