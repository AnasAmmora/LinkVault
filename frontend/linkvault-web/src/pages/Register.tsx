import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import AuthShell from "@/components/layout/AuthShell"
import { useAuth } from "@/auth/AuthContext"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Register() {
  const nav = useNavigate()
  const { register } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  return (
    <AuthShell
      title="Create account"
      subtitle="Start organizing your links in minutes."
      footer={
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link className="text-foreground underline underline-offset-4" to="/login">
            Login
          </Link>
        </p>
      }
    >
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault()

          // Email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address")
            return
          }

          // Password validation
          if (password.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
          }

          setLoading(true)
          try {
            await register({ name, email, password })
            toast.success("Account created.")
            nav("/dashboard")
          } catch (ex: any) {
            toast.error(ex?.response?.data ?? "Register failed")
          } finally {
            setLoading(false)
          }
        }}
      >
        <div className="space-y-2">
          <Label>Username</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Username" />
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>

        <div className="space-y-2">
          <Label>Password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 chars" />
        </div>

        <Button className="w-full" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </Button>
      </form>
    </AuthShell>
  )
}