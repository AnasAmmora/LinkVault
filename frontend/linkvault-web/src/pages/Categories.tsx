import { useEffect, useState } from "react"
import { toast } from "sonner"

import AppShell from "@/components/layout/AppShell"
import { categoriesApi } from "@/api/categories"
import type { CategoryResponse } from "@/api/types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"

export default function Categories() {
  const [items, setItems] = useState<CategoryResponse[]>([])
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      setItems(await categoriesApi.list())
    } catch (ex: any) {
      toast.error(ex?.response?.data ?? "Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <AppShell title="Categories">
      <div className="flex items-end justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold">Categories</h2>
          <p className="text-sm text-muted-foreground">Use categories to filter links quickly.</p>
        </div>
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New category name"
            className="w-56"
          />
          <Button
            className="gap-2"
            onClick={async () => {
              const n = name.trim()
              if (!n) return toast.error("Name is required.")
              try {
                await categoriesApi.create(n)
                setName("")
                toast.success("Category created.")
                await load()
              } catch (ex: any) {
                toast.error(ex?.response?.data ?? "Create failed")
              }
            }}
          >
            <Plus className="size-4" />
            Add
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="w-40 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={2}>Loading...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={2}>No categories yet.</TableCell></TableRow>
              ) : (
                items.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const newN = prompt("New name:", c.name)?.trim()
                          if (!newN) return
                          try {
                            await categoriesApi.update(c.id, newN)
                            toast.success("Renamed.")
                            await load()
                          } catch (ex: any) {
                            toast.error(ex?.response?.data ?? "Rename failed")
                          }
                        }}
                      >
                        Rename
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                          if (!confirm("Delete category?")) return
                          try {
                            await categoriesApi.remove(c.id)
                            toast.success("Deleted.")
                            await load()
                          } catch (ex: any) {
                            toast.error(ex?.response?.data ?? "Delete failed")
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  )
}