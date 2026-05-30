"use client";

import { useState } from "react";
import { MessageSquare, Plus, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/utils";

interface AdminNote {
  id: string;
  note: string;
  created_at: string;
}

interface AdminOrderNotesProps {
  orderId: string;
  sessionId?: string;
  initialNotes?: AdminNote[];
}

export function AdminOrderNotes({ orderId, sessionId, initialNotes = [] }: AdminOrderNotesProps) {
  const [notes, setNotes] = useState<AdminNote[]>(initialNotes);
  const [isPending, setIsPending] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleAddNote() {
    if (!noteText.trim()) return;

    setError(null);
    setSuccess(false);
    setIsPending(true);

    try {
      const response = await fetch("/api/admin/add-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          note: noteText,
          sessionId,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error ?? "Failed to add note");
        return;
      }

      // Add the new note to the list
      const newNote: AdminNote = {
        id: result.noteId,
        note: noteText.trim(),
        created_at: new Date().toISOString(),
      };

      setNotes([newNote, ...notes]);
      setNoteText("");
      setSuccess(true);

      setTimeout(() => setSuccess(false), 2000);
    } catch {
      setError("Failed to add note. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card className="rounded-[24px]">
      <CardHeader className="flex-row items-center gap-2 space-y-0 p-5 pb-0">
        <MessageSquare className="text-[var(--primary-dark)]" size={20} aria-hidden="true" />
        <CardTitle>Admin notes</CardTitle>
      </CardHeader>

      {/* Add note form */}
      <CardContent className="p-5">
      <div className="space-y-3">
        <Label htmlFor="admin-note">Add note</Label>
        <Textarea
          id="admin-note"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Add admin note..."
          rows={3}
          disabled={isPending}
          className="resize-none bg-[var(--muted-surface)]"
        />
        {error && (
          <p className="flex items-center gap-1.5 text-xs font-bold text-[var(--danger)]">
            <AlertCircle size={13} aria-hidden="true" />
            {error}
          </p>
        )}
        <Button
          type="button"
          onClick={handleAddNote}
          disabled={isPending || !noteText.trim()}
        >
          {isPending ? (
            "Adding..."
          ) : (
            <>
              <Plus size={15} aria-hidden="true" />
              Add note
            </>
          )}
        </Button>
        {success && (
          <p className="flex items-center gap-1 text-xs font-bold text-[var(--success)]">
            <Check size={13} aria-hidden="true" /> Note added!
          </p>
        )}
      </div>

      {/* Notes list */}
      {notes.length > 0 ? (
        <div className="mt-5 space-y-3">
          {notes.map((note) => (
            <Card key={note.id} className="rounded-xl bg-[var(--muted-surface)] shadow-none">
              <CardContent className="p-4">
              <p className="text-sm leading-relaxed text-[var(--foreground)]">{note.note}</p>
              <p className="mt-2 text-xs text-[var(--muted)]">{formatDateTime(note.created_at)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-[var(--muted)]">No notes yet.</p>
      )}
      </CardContent>
    </Card>
  );
}
