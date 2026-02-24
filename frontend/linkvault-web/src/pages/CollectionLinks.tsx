import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { toast } from "sonner"

import AppShell from "@/components/layout/AppShell"
import { linksApi } from "@/api/links"
import { categoriesApi } from "@/api/categories"
import { collectionsApi } from "@/api/collections"
import type {
  CategoryResponse,
  CollectionResponse,
  LinkResponse,
  PagedResult,
} from "@/api/types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

import { Plus, MoreVertical } from "lucide-react"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString()
}

type LinkForm = {
  url: string
  title: string
  description: string
  categoryId: string
}

export default function CollectionLinks() {
  const { id } = useParams()
  const collectionId = Number(id)

  const [cats, setCats] = useState<CategoryResponse[]>([])
  const [, setCollections] = useState<CollectionResponse[]>([])
  const [data, setData] = useState<PagedResult<LinkResponse> | null>(null)
  const [loading, setLoading] = useState(true)

  const [q, setQ] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const [openCreate, setOpenCreate] = useState(false)


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
        categoryId:
          categoryFilter === "all" ? undefined : Number(categoryFilter),
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

  // تحميل categories + collections مرة واحدة عند تغيير الكولكشن
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
        //
      }
    })()
  }, [collectionId])

  // 🔥 Auto apply عند تغيير البحث أو الفلتر
  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionId, q, categoryFilter])

  return (
    <AppShell title={`Links • Collection #${collectionId}`}>
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
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
                  onChange={(e) =>
                    setForm((p) => ({ ...p, url: e.target.value }))
                  }
                  placeholder="https://..."
                />

                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="Title (optional)"
                />

                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Description (optional)"
                />

                <Select
                  value={form.categoryId}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, categoryId: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {cats.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  className="w-full"
                  onClick={async () => {
                    if (!form.url.trim())
                      return toast.error("Url is required.")

                    try {
                      await linksApi.create(collectionId, {
                        url: form.url.trim(),
                        title: form.title.trim() || undefined,
                        description: form.description.trim() || undefined,
                        categoryId:
                          form.categoryId === "none"
                            ? undefined
                            : Number(form.categoryId),
                      })

                      toast.success("Link added.")
                      setForm({
                        url: "",
                        title: "",
                        description: "",
                        categoryId: "none",
                      })
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
                <TableRow>
                  <TableCell colSpan={4}>Loading...</TableCell>
                </TableRow>
              ) : (data?.items?.length ?? 0) === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>No links found.</TableCell>
                </TableRow>
              ) : (
                data!.items.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium hover:underline"
                      >
                        {l.title ?? l.url}
                      </a>
                    </TableCell>

                    <TableCell>
                      {l.categoryId ? (
                        <Badge variant="secondary">
                          {catNameById.get(l.categoryId)}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          —
                        </span>
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
                          <DropdownMenuItem
                            onClick={() => window.open(l.url, "_blank")}
                          >
                            Open
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={async () => {
                              if (!confirm("Delete this link?")) return
                              await linksApi.remove(l.id)
                              toast.success("Deleted.")
                              await load()
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