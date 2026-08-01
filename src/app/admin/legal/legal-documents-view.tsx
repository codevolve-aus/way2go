"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { diffWords } from "diff"
import { PenLine, History, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { updateLegalDocument } from "./actions"

type SectionInput = { heading: string; body: string }

interface LegalDocument {
  id: string
  slug: string
  title: string
  updatedAt: Date
  updatedBy: string | null
  sections: { id: string; order: number; heading: string; body: string }[]
  revisions: { id: string; editedBy: string | null; editedAt: Date; snapshot: unknown }[]
}

function formatDateTime(d: Date) {
  return new Date(d).toLocaleString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function SectionEditor({
  sections,
  onChange,
}: {
  sections: SectionInput[]
  onChange: (sections: SectionInput[]) => void
}) {
  function update(index: number, patch: Partial<SectionInput>) {
    onChange(sections.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  }

  function remove(index: number) {
    onChange(sections.filter((_, i) => i !== index))
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= sections.length) return
    const next = [...sections]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  function add() {
    onChange([...sections, { heading: "", body: "" }])
  }

  return (
    <div className="space-y-4">
      {sections.map((section, i) => (
        <div key={i} className="rounded-lg border border-border p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Input
              value={section.heading}
              onChange={(e) => update(i, { heading: e.target.value })}
              placeholder="Section heading"
              className="font-medium"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={i === 0}
              onClick={() => move(i, -1)}
              aria-label="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={i === sections.length - 1}
              onClick={() => move(i, 1)}
              aria-label="Move down"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              onClick={() => remove(i)}
              aria-label="Remove section"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            value={section.body}
            onChange={(e) => update(i, { body: e.target.value })}
            rows={5}
            placeholder="Section text"
            required
          />
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="h-4 w-4" />
        Add Section
      </Button>
    </div>
  )
}

function EditSheet({
  doc,
  open,
  onOpenChange,
}: {
  doc: LegalDocument
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [title, setTitle] = useState(doc.title)
  const [sections, setSections] = useState<SectionInput[]>(
    doc.sections.map((s) => ({ heading: s.heading, body: s.body }))
  )
  const [isPending, startTransition] = useTransition()

  function handleOpenChange(next: boolean) {
    if (next) {
      setTitle(doc.title)
      setSections(doc.sections.map((s) => ({ heading: s.heading, body: s.body })))
    }
    onOpenChange(next)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (sections.length === 0) {
      toast.error("Add at least one section")
      return
    }
    if (sections.some((s) => !s.heading.trim() || !s.body.trim())) {
      toast.error("Every section needs a heading and body")
      return
    }
    startTransition(async () => {
      try {
        await updateLegalDocument({ documentId: doc.id, slug: doc.slug, title, sections })
        toast.success(`${title} updated`)
        onOpenChange(false)
      } catch {
        toast.error("Failed to save changes")
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit {doc.title}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4 px-4">
          <div className="space-y-1.5">
            <Label>Page Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <Separator />
          <SectionEditor sections={sections} onChange={setSections} />
          <SheetFooter className="px-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

type SectionDiff =
  | { type: "added"; heading: string; body: string }
  | { type: "removed"; heading: string; body: string }
  | { type: "changed"; heading: string; oldHeading: string; oldBody: string; body: string }
  | { type: "unchanged"; heading: string; body: string }

function diffSections(
  oldSections: SectionInput[] | undefined,
  newSections: SectionInput[]
): SectionDiff[] {
  const oldPool = [...(oldSections ?? [])]
  const diffs: SectionDiff[] = []

  for (const section of newSections) {
    const matchIndex = oldPool.findIndex((s) => s.heading === section.heading)
    if (matchIndex === -1) {
      diffs.push({ type: "added", heading: section.heading, body: section.body })
    } else {
      const [old] = oldPool.splice(matchIndex, 1)
      if (old.body === section.body) {
        diffs.push({ type: "unchanged", heading: section.heading, body: section.body })
      } else {
        diffs.push({
          type: "changed",
          heading: section.heading,
          oldHeading: old.heading,
          oldBody: old.body,
          body: section.body,
        })
      }
    }
  }

  for (const leftover of oldPool) {
    diffs.push({ type: "removed", heading: leftover.heading, body: leftover.body })
  }

  return diffs
}

function DiffBadge({ type }: { type: SectionDiff["type"] }) {
  switch (type) {
    case "added":
      return <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border-0">Added</Badge>
    case "removed":
      return <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border-0">Removed</Badge>
    case "changed":
      return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-0">Changed</Badge>
    case "unchanged":
      return null
  }
}

function WordDiff({ oldText, newText }: { oldText: string; newText: string }) {
  const parts = diffWords(oldText, newText)
  return (
    <p className="text-xs whitespace-pre-line leading-relaxed">
      {parts.map((part, i) => {
        if (part.added) {
          return (
            <span key={i} className="bg-green-500/20 text-green-700 dark:text-green-400">
              {part.value}
            </span>
          )
        }
        if (part.removed) {
          return (
            <span
              key={i}
              className="bg-red-500/20 text-red-700 dark:text-red-400 line-through"
            >
              {part.value}
            </span>
          )
        }
        return (
          <span key={i} className="text-muted-foreground">
            {part.value}
          </span>
        )
      })}
    </p>
  )
}

function RevisionDiff({ diffs }: { diffs: SectionDiff[] }) {
  const changed = diffs.filter((d) => d.type !== "unchanged")
  const unchanged = diffs.filter((d) => d.type === "unchanged")

  if (changed.length === 0) {
    return <p className="text-xs text-muted-foreground">No content changes.</p>
  }

  return (
    <div className="space-y-3">
      {changed.map((d, i) => (
        <div key={i} className="rounded-md border border-border p-2.5">
          <div className="flex items-center gap-2 mb-1.5">
            <DiffBadge type={d.type} />
            <p className="text-xs font-semibold">
              {d.type === "changed" && d.oldHeading !== d.heading
                ? `${d.oldHeading} → ${d.heading}`
                : d.heading}
            </p>
          </div>
          {d.type === "changed" ? (
            <WordDiff oldText={d.oldBody} newText={d.body} />
          ) : (
            <p
              className={
                d.type === "removed"
                  ? "text-xs text-red-600 dark:text-red-400 line-through whitespace-pre-line"
                  : "text-xs text-green-700 dark:text-green-400 whitespace-pre-line"
              }
            >
              {d.body}
            </p>
          )}
        </div>
      ))}
      {unchanged.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {unchanged.length} other section{unchanged.length === 1 ? "" : "s"} unchanged.
        </p>
      )}
    </div>
  )
}

function HistorySheet({
  doc,
  open,
  onOpenChange,
}: {
  doc: LegalDocument
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{doc.title} — History</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-3 py-4 px-4">
          {doc.revisions.length === 0 && (
            <p className="text-sm text-muted-foreground">No changes recorded yet.</p>
          )}
          {doc.revisions.map((rev, i) => {
            const snapshot = rev.snapshot as { title: string; sections: SectionInput[] } | null
            const previousSnapshot = doc.revisions[i + 1]?.snapshot as
              | { title: string; sections: SectionInput[] }
              | undefined
            const isExpanded = expandedId === rev.id
            const isInitial = i === doc.revisions.length - 1
            return (
              <div key={rev.id} className="rounded-lg border border-border p-3">
                <button
                  type="button"
                  className="flex w-full items-center justify-between text-left"
                  onClick={() => setExpandedId(isExpanded ? null : rev.id)}
                >
                  <div>
                    <p className="text-sm font-medium">
                      {rev.editedBy ?? "Unknown"}
                      {isInitial && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          (initial version)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(rev.editedAt)}</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {isExpanded && snapshot && (
                  <div className="mt-3 border-t border-border pt-3">
                    {isInitial ? (
                      <div className="space-y-3">
                        {snapshot.sections.map((s, si) => (
                          <div key={si}>
                            <p className="text-xs font-semibold">{s.heading}</p>
                            <p className="text-xs text-muted-foreground whitespace-pre-line mt-0.5">
                              {s.body}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <RevisionDiff diffs={diffSections(previousSnapshot?.sections, snapshot.sections)} />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function LegalDocumentsView({ documents }: { documents: LegalDocument[] }) {
  const [editingDoc, setEditingDoc] = useState<LegalDocument | null>(null)
  const [historyDoc, setHistoryDoc] = useState<LegalDocument | null>(null)

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {documents.map((doc) => (
        <Card key={doc.id}>
          <CardHeader>
            <CardTitle className="text-base">{doc.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {doc.sections.length} section{doc.sections.length === 1 ? "" : "s"} &middot; last
              updated {formatDateTime(doc.updatedAt)}
              {doc.updatedBy ? ` by ${doc.updatedBy}` : ""}
            </p>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button size="sm" onClick={() => setEditingDoc(doc)}>
              <PenLine className="h-4 w-4" />
              Edit
            </Button>
            <Button size="sm" variant="outline" onClick={() => setHistoryDoc(doc)}>
              <History className="h-4 w-4" />
              History ({doc.revisions.length})
            </Button>
          </CardContent>
        </Card>
      ))}

      {editingDoc && (
        <EditSheet
          key={editingDoc.id}
          doc={editingDoc}
          open={!!editingDoc}
          onOpenChange={(open) => !open && setEditingDoc(null)}
        />
      )}
      {historyDoc && (
        <HistorySheet
          key={historyDoc.id}
          doc={historyDoc}
          open={!!historyDoc}
          onOpenChange={(open) => !open && setHistoryDoc(null)}
        />
      )}
    </div>
  )
}
