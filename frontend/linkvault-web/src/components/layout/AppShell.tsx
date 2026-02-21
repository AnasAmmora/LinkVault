import type { ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/auth/AuthContext"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { Bookmark, Folder, Tags, Menu, LogOut } from "lucide-react"

function NavItem({
  to,
  icon,
  label,
}: {
  to: string
  icon: ReactNode
  label: string
}) {
  const { pathname } = useLocation()
  const active = pathname === to || (to !== "/dashboard" && pathname.startsWith(to))

  return (
    <Link
      to={to}
      className={[
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      ].join(" ")}
    >
      <span className="size-4">{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  )
}

function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-background md:block">
      <div className="p-4">
        <div className="flex items-center gap-2 font-semibold">
          <Bookmark className="size-5" />
          <span>LinkVault</span>
        </div>
      </div>
      <Separator />
      <nav className="p-3 space-y-1">
        <NavItem to="/dashboard" icon={<Folder className="size-4" />} label="Collections" />
        <NavItem to="/categories" icon={<Tags className="size-4" />} label="Categories" />
      </nav>
      <div className="p-3 text-xs text-muted-foreground">
        Organize your links. Fast.
      </div>
    </aside>
  )
}

export default function AppShell({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  const { me, logout } = useAuth()

  const initials =
    (me?.name || me?.email || "U")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "U"

  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="flex">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-2">
                {/* Mobile menu */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="size-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0">
                    <div className="p-4">
                      <div className="flex items-center gap-2 font-semibold">
                        <Bookmark className="size-5" />
                        <span>LinkVault</span>
                      </div>
                    </div>
                    <Separator />
                    <nav className="p-3 space-y-1">
                      <NavItem to="/dashboard" icon={<Folder className="size-4" />} label="Collections" />
                      <NavItem to="/categories" icon={<Tags className="size-4" />} label="Categories" />
                    </nav>
                  </SheetContent>
                </Sheet>

                <div>
                  <h1 className="text-base font-semibold leading-none">{title}</h1>
                  <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    {me?.email}
                  </p>
                </div>
              </div>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 gap-2 px-2">
                    <Avatar className="size-7">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm">{me?.name ?? "Account"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="gap-2">
                    <LogOut className="size-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-4 md:p-6">
            <div className="mx-auto w-full max-w-5xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}