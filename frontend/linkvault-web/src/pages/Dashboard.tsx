import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import AppShell from "@/components/layout/AppShell"
import { collectionsApi } from "@/api/collections"
import type { CollectionResponse, PagedResult } from "@/api/types"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Plus, MoreVertical, Folder } from "lucide-react"

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString()
}

export default function Dashboard() {
  const [data, setData] = useState<PagedResult<CollectionResponse> | null>(null)
  const [loading, setLoading] = useState(true)

  const [openCreate, setOpenCreate] = useState(false)
  const [newName, setNewName] = useState("")

  async function load() {
    setLoading(true)
    try {
      const res = await collectionsApi.list({ page: 1, pageSize: 50, sort: "newest" })
      setData(res)
    } catch (ex: any) {
      toast.error(ex?.response?.data ?? "Failed to load collections")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <AppShell title="Collections">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold">Your collections</h2>
          <p className="text-sm text-muted-foreground">Create folders and keep links organized.</p>
        </div>

        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              New collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create collection</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Unity Resources"
              />
              <Button
                className="w-full"
                onClick={async () => {
                  const name = newName.trim()
                  if (!name) return toast.error("Name is required.")
                  try {
                    await collectionsApi.create(name)
                    toast.success("Collection created.")
                    setNewName("")
                    setOpenCreate(false)
                    await load()
                  } catch (ex: any) {
                    toast.error(ex?.response?.data ?? "Create failed")
                  }
                }}
              >
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && data?.items?.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Folder className="mx-auto size-7 text-muted-foreground" />
            <h3 className="mt-3 font-semibold">No collections yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first collection to start saving links.
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && data?.items?.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((c) => (
            <Card key={c.id} className="hover:shadow-sm transition">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      to={`/collections/${c.id}`}
                      className="font-semibold hover:underline underline-offset-4 block truncate"
                    >
                      {c.name}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created {formatDate(c.createdAt)}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={async () => {
                          const newN = prompt("New name:", c.name)?.trim()
                          if (!newN) return
                          try {
                            await collectionsApi.update(c.id, newN)
                            toast.success("Renamed.")
                            await load()
                          } catch (ex: any) {
                            toast.error(ex?.response?.data ?? "Rename failed")
                          }
                        }}
                      >
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={async () => {
                          if (!confirm("Delete this collection?")) return
                          try {
                            await collectionsApi.remove(c.id)
                            toast.success("Deleted.")
                            await load()
                          } catch (ex: any) {
                            toast.error(ex?.response?.data ?? "Delete failed")
                          }
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </AppShell>
  )
}