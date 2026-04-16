'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CodeEditor } from './code-editor'
import { VersionHistory } from './version-history'
import { DiffViewer } from './diff-viewer'
import { SnippetWithTags, SnippetVersion, Language } from '@/lib/types'
import { Copy, Edit, Trash2, Check, Clock, X, Link2, ImageDown } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { ExportImageModal } from './export-image-modal'

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface SnippetDetailPanelProps {
  snippet: SnippetWithTags | null
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onShareToggle?: (updated: SnippetWithTags) => void
}

export function SnippetDetailPanel({
  snippet,
  onClose,
  onEdit,
  onDelete,
  onShareToggle,
}: SnippetDetailPanelProps) {
  const [copied, setCopied] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [selectedVersions, setSelectedVersions] = useState<[SnippetVersion | null, SnippetVersion | null]>([null, null])
  const [activeTab, setActiveTab] = useState('code')

  // Reset all state when a different snippet is opened
  useEffect(() => {
    setSelectedVersions([null, null])
    setActiveTab('code')
  }, [snippet?.id])

  // Auto-navigate to diff tab when 2 versions are selected
  useEffect(() => {
    if (selectedVersions[0] && selectedVersions[1]) {
      setActiveTab('diff')
    } else if (activeTab === 'diff') {
      setActiveTab('history')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVersions[0]?.id, selectedVersions[1]?.id])

  const { data: versionsData } = useSWR<{ versions: SnippetVersion[] }>(
    snippet ? `/api/snippets/${snippet.id}/versions` : null,
    fetcher
  )

  const versions = versionsData?.versions || []

  const handleCopy = async () => {
    if (snippet) {
      await navigator.clipboard.writeText(snippet.current_content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDelete = () => {
    onDelete()
    setShowDeleteDialog(false)
    onClose()
  }

  const handleSelectVersion = (version: SnippetVersion) => {
    setSelectedVersions(prev => {
      if (!prev[0]) return [version, null]
      if (prev[0].id === version.id) return [null, null]
      if (prev[1]?.id === version.id) return [prev[0], null]
      if (!prev[1]) return [prev[0], version]
      return [version, null]
    })
  }

  const clearDiffSelection = () => setSelectedVersions([null, null])

  const handleToggleShare = async () => {
    if (!snippet) return
    const res = await fetch(`/api/snippets/${snippet.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_public: !snippet.is_public }),
    })
    if (res.ok) {
      const { snippet: updated } = await res.json()
      toast.success(updated.is_public ? 'Snippet is now public' : 'Snippet is now private')
      onShareToggle?.(updated)
    } else {
      toast.error('Failed to update sharing')
    }
  }

  const shareUrl = snippet?.share_slug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/s/${snippet.share_slug}`
    : null

  return (
    <>
      <Sheet open={!!snippet} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-card border-border">
          {snippet && (
            <>
              <SheetHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <SheetTitle className="text-xl font-semibold text-foreground truncate">
                      {snippet.title}
                    </SheetTitle>
                    {snippet.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {snippet.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 flex-wrap mt-2">
                  <Badge variant="secondary">{snippet.language}</Badge>
                  {(snippet.tags ?? []).map((tag) => (
                    <Badge key={tag.id} variant="outline">
                      {tag.name}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Button onClick={handleCopy} variant="outline" size="sm" className="hover:border-primary/50 transition-colors">
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button onClick={onEdit} variant="outline" size="sm" className="hover:border-primary/50 transition-colors">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button onClick={() => setShowExport(true)} variant="outline" size="sm" className="hover:border-primary/50 transition-colors">
                    <ImageDown className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button
                    onClick={() => setShowDeleteDialog(true)}
                    variant="outline" size="sm"
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Updated {formatDistanceToNow(new Date(snippet.updated_at), { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {snippet.is_public ? 'Public' : 'Private'}
                    </span>
                    <button
                      onClick={handleToggleShare}
                      className={['relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 cursor-pointer',
                        snippet.is_public ? 'bg-primary' : 'bg-muted'].join(' ')}
                      role="switch" aria-checked={snippet.is_public}
                    >
                      <span className={['pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg transition-transform duration-200',
                        snippet.is_public ? 'translate-x-4' : 'translate-x-0'].join(' ')} />
                    </button>
                    {snippet.is_public && shareUrl && (
                      <button onClick={async () => { await navigator.clipboard.writeText(shareUrl); toast.success('Link copied!') }}
                        className="text-xs text-primary hover:underline flex items-center gap-1">
                        <Link2 className="h-3 w-3" />
                        Copy link
                      </button>
                    )}
                  </div>
                </div>
              </SheetHeader>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-1">
                  <TabsTrigger value="code">Code</TabsTrigger>
                  <TabsTrigger value="history">History ({versions.length})</TabsTrigger>
                  {selectedVersions[0] && selectedVersions[1] && (
                    <TabsTrigger value="diff">Diff</TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="code" className="mt-4">
                  <CodeEditor
                    value={snippet.current_content}
                    language={snippet.language as Language}
                    readOnly
                    className="min-h-[400px]"
                  />
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                  <VersionHistory
                    versions={versions}
                    selectedVersions={selectedVersions}
                    onSelectVersion={handleSelectVersion}
                    onClearSelection={clearDiffSelection}
                  />
                </TabsContent>

                {selectedVersions[0] && selectedVersions[1] && (
                  <TabsContent value="diff" className="mt-4">
                    <DiffViewer
                      oldVersion={selectedVersions[0]}
                      newVersion={selectedVersions[1]}
                      language={snippet.language as Language}
                    />
                  </TabsContent>
                )}
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-card-foreground">Delete snippet?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this snippet and all its version history.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {snippet && (
        <ExportImageModal open={showExport} onOpenChange={setShowExport} snippet={snippet} />
      )}
    </>
  )
}
