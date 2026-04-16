'use client'

import { useMemo } from 'react'
import { diffLines, Change } from 'diff'
import { SnippetVersion, Language } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

interface DiffViewerProps {
  oldVersion: SnippetVersion
  newVersion: SnippetVersion
  language: Language
}

export function DiffViewer({ oldVersion, newVersion, language }: DiffViewerProps) {
  // Ensure oldVersion is actually older
  const [older, newer] = useMemo(() => {
    if (oldVersion.version_number < newVersion.version_number) {
      return [oldVersion, newVersion]
    }
    return [newVersion, oldVersion]
  }, [oldVersion, newVersion])

  const diff = useMemo(() => {
    return diffLines(older.content, newer.content)
  }, [older.content, newer.content])

  const stats = useMemo(() => {
    let added = 0
    let removed = 0
    diff.forEach((change) => {
      const lines = change.value.split('\n').filter(Boolean).length
      if (change.added) added += lines
      if (change.removed) removed += lines
    })
    return { added, removed }
  }, [diff])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge variant="outline">v{older.version_number}</Badge>
          <span className="text-muted-foreground">→</span>
          <Badge variant="outline">v{newer.version_number}</Badge>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-green-500 font-bold">+{stats.added} added</span>
          <span className="text-red-500 font-medium">-{stats.removed} removed</span>
        </div>
      </div>

      {/* Version info */}
      <div className="grid gap-2 sm:grid-cols-2 text-xs text-muted-foreground">
        <div className="p-2 rounded bg-secondary">
          <span className="font-medium">Old:</span> {older.commit_message || `Version ${older.version_number}`}
          <br />
          {format(new Date(older.created_at), 'MMM d, yyyy h:mm a')}
        </div>
        <div className="p-2 rounded bg-secondary">
          <span className="font-medium">New:</span> {newer.commit_message || `Version ${newer.version_number}`}
          <br />
          {format(new Date(newer.created_at), 'MMM d, yyyy h:mm a')}
        </div>
      </div>

      {/* Diff view */}
      <div className="rounded-md border border-border bg-[#0d1117] overflow-hidden">
        <div className="overflow-x-auto">
          <pre className="p-4 text-sm font-mono">
            {diff.map((change, index) => (
              <DiffBlock key={index} change={change} />
            ))}
          </pre>
        </div>
      </div>
    </div>
  )
}

function DiffBlock({ change }: { change: Change }) {
  const lines = change.value.split('\n')
  // Remove last empty line if exists
  if (lines[lines.length - 1] === '') {
    lines.pop()
  }

  if (lines.length === 0) return null

  const bgColor = change.added
    ? 'bg-green-500/20'
    : change.removed
      ? 'bg-red-500/20'
      : ''

  const textColor = change.added
    ? 'text-green-400'
    : change.removed
      ? 'text-red-400'
      : 'text-slate-300'

  const prefix = change.added ? '+' : change.removed ? '-' : ' '

  return (
    <>
      {lines.map((line, lineIndex) => (
        <div
          key={lineIndex}
          className={`flex ${bgColor}`}
        >
          <span
            className={`select-none w-6 shrink-0 text-center ${textColor}`}
          >
            {prefix}
          </span>
          <span className={textColor}>{line || ' '}</span>
        </div>
      ))}
    </>
  )
}
