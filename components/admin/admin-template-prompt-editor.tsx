"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, PencilLine } from "lucide-react";
import { updateTemplatePromptAction } from "@/app/admin/templates/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTemplateBySlug, getTemplateDisplayDescriptionBySlug } from "@/lib/templates";
import type { AITemplate } from "@/types/database";
import type { TemplatePromptEditorState } from "@/app/admin/templates/actions";

type AdminTemplatePromptEditorProps = {
  template: AITemplate;
};

const initialTemplatePromptEditorState: TemplatePromptEditorState = {
  success: false,
};

export function AdminTemplatePromptEditor({ template }: AdminTemplatePromptEditorProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    updateTemplatePromptAction,
    initialTemplatePromptEditorState,
  );
  const isCurrentSuccess = state.success && state.updatedTemplateId === template.id;
  const isCurrentError = !state.success && state.error;

  useEffect(() => {
    if (!isCurrentSuccess) return;

    router.refresh();
  }, [isCurrentSuccess, router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <PencilLine size={14} aria-hidden="true" />
          Edit prompt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92dvh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2 pr-8">
            <Badge variant={template.is_active ? "success" : "secondary"}>
              {template.is_active ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline">{template.slug}</Badge>
          </div>
          <DialogTitle>Edit template prompt</DialogTitle>
          <DialogDescription>
            Update only safe template fields. Slug, image requirements, output type, and review rules stay unchanged.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="grid gap-5">
          <input type="hidden" name="templateId" value={template.id} />
          <input type="hidden" name="titleMn" value={template.title_mn} />
          <input type="hidden" name="descriptionMn" value={template.description_mn ?? ""} />

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor={`template-title-en-${template.id}`}>Public title</Label>
              <Input
                id={`template-title-en-${template.id}`}
                name="titleEn"
                defaultValue={template.title_en ?? getTemplateBySlug(template.slug)?.titleEn ?? "Template"}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`template-slug-${template.id}`}>Slug</Label>
            <Input
              id={`template-slug-${template.id}`}
              value={template.slug}
              readOnly
              aria-readonly="true"
              className="bg-[var(--muted-surface)] font-mono text-xs"
            />
          </div>

          <div className="grid gap-2">
            <Label>Public description</Label>
            <p className="rounded-2xl border border-[var(--line)] bg-[var(--muted-surface)] px-4 py-3 text-sm font-medium leading-6 text-[var(--muted)]">
              {getTemplateBySlug(template.slug)?.descriptionEn ?? getTemplateDisplayDescriptionBySlug(template.slug)}
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`template-prompt-${template.id}`}>Prompt</Label>
            <Textarea
              id={`template-prompt-${template.id}`}
              name="prompt"
              defaultValue={template.prompt}
              required
              rows={9}
              className="min-h-[220px] font-mono text-xs leading-5"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`template-negative-prompt-${template.id}`}>Negative prompt</Label>
            <Textarea
              id={`template-negative-prompt-${template.id}`}
              name="negativePrompt"
              defaultValue={template.negative_prompt ?? ""}
              rows={4}
              className="min-h-28 font-mono text-xs leading-5"
            />
          </div>

          <Label className="flex min-h-12 cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-[var(--muted-surface)] px-4 py-3">
            <span>
              <span className="block text-sm font-extrabold">Active template</span>
              <span className="mt-1 block text-xs font-medium leading-5 text-[var(--muted)]">
                Controls whether this template appears in active template flows.
              </span>
            </span>
            <input
              name="isActive"
              type="checkbox"
              defaultChecked={template.is_active}
              className="size-5 shrink-0 accent-[var(--primary)]"
            />
          </Label>

          {isCurrentError ? (
            <p className="flex items-center gap-2 rounded-2xl border border-[#C84646]/25 bg-[#C84646]/10 px-4 py-3 text-sm font-bold text-[var(--danger)]">
              <AlertCircle size={15} aria-hidden="true" />
              {state.error}
            </p>
          ) : null}

          {isCurrentSuccess ? (
            <p className="flex items-center gap-2 rounded-2xl border border-[#4F8A66]/25 bg-[#E5F4EC] px-4 py-3 text-sm font-bold text-[var(--success)]">
              <CheckCircle2 size={15} aria-hidden="true" />
              Prompt saved.
            </p>
          ) : null}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
