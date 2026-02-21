import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { toast } from "sonner"

import AppShell from "@/components/layout/AppShell"
import { linksApi } from "@/api/links"
import { categoriesApi } from "@/api/categories"
import { collectionsApi } from "@/api/collections"
import type { CategoryResponse, CollectionResponse, LinkResponse, PagedResult } from "@/api/types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Plus, MoreVertical, ExternalLink } from "lucide-react"

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString()
}

type LinkForm = {
  url: string
  title: string
  description: string
  categoryId: string // "" | "id"
}

export default function CollectionLinks() {
  const { id } = useParams()
  const collectionId = Number(id)

  const [cats, setCats] = useState<CategoryResponse[]>([])
  const [collections, setCollections] = useState<CollectionResponse[]>([])
  const [data, setData] = useState<PagedResult<LinkResponse> | null>(null)
  const [loading, setLoading] = useState(true)

  const [q, setQ] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const [openCreate, setOpenCreate] = useState(false)
  const [openMove, setOpenMove] = useState(false)
  const [movingLinkId, setMovingLinkId] = useState<number | null>(null)
  const [targetCollectionId, setTargetCollectionId] = useState<string>("")

  const [form, setForm] = useState<LinkForm>({
    url: "",
    title: "",
    description: "",
    categoryId: "none",
  })

  const catNameById = useMemo(() => {
    const m = new Map<number, string>()
    cats.forEach((c) => m.set(c.id, c.name))
    return m
  }, [cats])

  async function load() {
    setLoading(true)
    try {
      const res = await linksApi.listByCollection(collectionId, {
        q: q.trim() || undefined,
        categoryId: categoryFilter === "all" ? undefined : Number(categoryFilter),
        sort: "newest",
        page: 1,
        pageSize: 50,
      })
      setData(res)
    } catch (ex: any) {
      toast.error(ex?.response?.data ?? "Failed to load links")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      try {
        const [c1, c2] = await Promise.all([
          categoriesApi.list(),
          collectionsApi.list({ page: 1, pageSize: 200, sort: "name" }),
        ])
        setCats(c1)
        setCollections(c2.items)
      } catch {
        // تجاهل
      }
      await load()
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionId])

  return (
    <AppShell title={`Links • Collection #${collectionId}`}>
      {/* Top controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold">Links</h2>
          <p className="text-sm text-muted-foreground">
            Search, filter, add and manage links inside this collection.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by url/title/description..."
            className="w-full sm:w-72"
          />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {cats.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={load}>
            Apply
          </Button>

          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="size-4" />
                Add link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a new link</DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
                <Input
                  value={form.url}
                  onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
                  placeholder="https://..."
                />
                <Input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Title (optional)"
                />
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Description (optional)"
                />
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => setForm((p) => ({ ...p, categoryId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {cats.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  className="w-full"
                  onClick={async () => {
                    const url = form.url.trim()
                    if (!url) return toast.error("Url is required.")
                    try {
                      await linksApi.create(collectionId, {
                        url,
                        title: form.title.trim() || undefined,
                        description: form.description.trim() || undefined,
                        categoryId:
                          form.categoryId === "none" ? undefined : Number(form.categoryId),
                      })
                      toast.success("Link added.")
                      setForm({ url: "", title: "", description: "", categoryId: "none" })
                      setOpenCreate(false)
                      await load()
                    } catch (ex: any) {
                      toast.error(ex?.response?.data ?? "Create failed")
                    }
                  }}
                >
                  Save
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Move dialog */}
      <Dialog open={openMove} onOpenChange={setOpenMove}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move link</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Select value={targetCollectionId} onValueChange={setTargetCollectionId}>
              <SelectTrigger>
                <SelectValue placeholder="Select target collection" />
              </SelectTrigger>
              <SelectContent>
                {collections
                  .filter((c) => c.id !== collectionId)
                  .map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Button
              className="w-full"
              onClick={async () => {
                if (!movingLinkId) return
                const target = Number(targetCollectionId)
                if (!target) return toast.error("Pick a target collection.")
                try {
                  await linksApi.move(movingLinkId, target)
                  toast.success("Moved.")
                  setOpenMove(false)
                  setMovingLinkId(null)
                  setTargetCollectionId("")
                  await load()
                } catch (ex: any) {
                  toast.error(ex?.response?.data ?? "Move failed")
                }
              }}
            >
              Move
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Link</TableHead>
                <TableHead className="w-40">Category</TableHead>
                <TableHead className="w-36">Created</TableHead>
                <TableHead className="w-14 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>
              ) : (data?.items?.length ?? 0) === 0 ? (
                <TableRow><TableCell colSpan={4}>No links found.</TableCell></TableRow>
              ) : (
                data!.items.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <ExternalLink className="size-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <a
                            href={l.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium hover:underline underline-offset-4 block truncate"
                          >
                            {l.title ?? l.url}
                          </a>
                          {l.description && (
                            <p className="text-xs text-muted-foreground truncate">{l.description}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {l.categoryId ? (
                        <Badge variant="secondary">{catNameById.get(l.categoryId) ?? `#${l.categoryId}`}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(l.createdAt)}
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.open(l.url, "_blank")}>
                            Open
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={async () => {
                              const newUrl = prompt("Url:", l.url)?.trim()
                              if (!newUrl) return
                              try {
                                await linksApi.update(l.id, {
                                  url: newUrl,
                                  title: l.title,
                                  description: l.description,
                                  categoryId: l.categoryId ?? null,
                                })
                                toast.success("Updated.")
                                await load()
                              } catch (ex: any) {
                                toast.error(ex?.response?.data ?? "Update failed")
                              }
                            }}
                          >
                            Quick edit (url)
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => {
                              setMovingLinkId(l.id)
                              setOpenMove(true)
                            }}
                          >
                            Move…
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={async () => {
                              if (!confirm("Delete this link?")) return
                              try {
                                await linksApi.remove(l.id)
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