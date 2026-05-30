import { AdminDataTable, TableCell, TableRow } from "@/components/admin/admin-data-table";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { AdminTemplatePromptEditor } from "@/components/admin/admin-template-prompt-editor";
import { Badge } from "@/components/ui/badge";
import {
  aiTemplates,
  getTemplateBySlug,
  getTemplateDisplayDescription,
  getTemplateDisplayDescriptionBySlug,
  getTemplateDisplayTitle,
} from "@/lib/templates";
import { formatDateTime } from "@/lib/utils";
import { listAdminTemplates } from "@/server/admin";

async function getTemplates() {
  try {
    const templates = await listAdminTemplates();
    return { templates, source: "database" as const };
  } catch (error) {
    console.error("Failed to load admin templates.", error);
    return { templates: [], source: "fallback" as const };
  }
}

function getPromptPreview(prompt?: string | null) {
  if (!prompt) return "No prompt saved.";

  return prompt.length > 180 ? `${prompt.slice(0, 180).trim()}...` : prompt;
}

export default async function AdminTemplatesPage() {
  const { templates, source } = await getTemplates();

  return (
    <section className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge>Template management</Badge>
          <h1 className="mt-2 text-4xl font-extrabold text-[var(--foreground)]">Templates</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Review template prompts and safely edit existing fields without changing slugs or generation flow.
          </p>
        </div>
        <AdminStatusBadge status={source === "database" ? "preview_ready" : "draft"} />
      </div>

      {templates.length > 0 ? (
        <AdminDataTable
          columns={["Template", "Category", "Status", "Prompt preview", "Review", "Updated", "Action"]}
          minWidth="980px"
        >
          {templates.map((template) => (
            <TableRow key={template.id} className="align-top">
              <TableCell>
                <div className="font-extrabold">{template.title_en ?? "Untitled template"}</div>
                <div className="mt-1 font-mono text-xs font-bold text-[var(--muted)]">{template.slug}</div>
                <div className="mt-2 text-xs text-[var(--muted)]">
                  {getTemplateBySlug(template.slug)?.descriptionEn ?? getTemplateDisplayDescriptionBySlug(template.slug)}
                </div>
              </TableCell>
              <TableCell>{template.category ?? "-"}</TableCell>
              <TableCell><AdminStatusBadge status={template.is_active ? "paid" : "failed"} /></TableCell>
              <TableCell>
                <p className="max-w-[360px] text-xs font-medium leading-5 text-[var(--muted)]">
                  {getPromptPreview(template.prompt)}
                </p>
                {template.negative_prompt ? (
                  <p className="mt-2 max-w-[360px] text-xs font-bold leading-5 text-[var(--foreground)]">
                    Negative: {getPromptPreview(template.negative_prompt)}
                  </p>
                ) : null}
              </TableCell>
              <TableCell>
                <div className="font-bold">{template.requires_admin_review ? "Required" : "Standard"}</div>
                <div className="mt-1 text-xs text-[var(--muted)]">
                  {template.required_images_min}-{template.required_images_max} images · {template.output_type}
                </div>
              </TableCell>
              <TableCell className="text-xs font-bold text-[var(--muted)]">{formatDateTime(template.updated_at)}</TableCell>
              <TableCell>
                <AdminTemplatePromptEditor template={template} />
              </TableCell>
            </TableRow>
          ))}
        </AdminDataTable>
      ) : (
        <AdminDataTable columns={["Template", "Category", "Status", "Prompt preview", "Review", "Output"]}>
          {aiTemplates.map((template) => (
            <TableRow key={template.id} className="align-top">
              <TableCell>
                <div className="font-extrabold">{getTemplateDisplayTitle(template)}</div>
                <div className="mt-1 font-mono text-xs font-bold text-[var(--muted)]">{template.slug}</div>
                <div className="mt-2 text-xs text-[var(--muted)]">
                  {getTemplateDisplayDescription(template)}
                </div>
              </TableCell>
              <TableCell>{template.category}</TableCell>
              <TableCell><AdminStatusBadge status={template.isActive ? "paid" : "failed"} /></TableCell>
              <TableCell>
                <p className="max-w-[360px] text-xs font-medium leading-5 text-[var(--muted)]">
                  {getPromptPreview(template.prompt)}
                </p>
              </TableCell>
              <TableCell>
                <div className="font-bold">{template.requiresAdminReview ? "Required" : "Standard"}</div>
                <div className="mt-1 text-xs text-[var(--muted)]">
                  {template.requiredImagesMin}-{template.requiredImagesMax} images
                </div>
              </TableCell>
              <TableCell>{template.outputType}</TableCell>
            </TableRow>
          ))}
        </AdminDataTable>
      )}
    </section>
  );
}
