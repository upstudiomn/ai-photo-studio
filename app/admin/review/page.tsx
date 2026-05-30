import { CheckCircle2 } from "lucide-react";
import { AdminImageCard } from "@/components/admin/admin-image-card";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime, shortId } from "@/lib/utils";
import { listAdminReviewOutputs } from "@/server/admin";
import { GENERATED_PREVIEWS_BUCKET, getStoredImageDisplayUrl } from "@/server/storage";

const checklist = [
  "Face identity preserved?",
  "Eyes/teeth/hands normal?",
  "No unwanted text/logo?",
  "Skin tone natural?",
  "Background realistic?",
  "Print resolution OK?",
  "Customer request followed?",
];

async function getReviewOutputs() {
  try {
    const outputs = await listAdminReviewOutputs(24);
    return Promise.all(
      outputs.map(async (output, index) => ({
        output,
        imageUrl: output.watermarked_url
          ? await getStoredImageDisplayUrl(GENERATED_PREVIEWS_BUCKET, output.watermarked_url)
          : output.preview_url
            ? await getStoredImageDisplayUrl(GENERATED_PREVIEWS_BUCKET, output.preview_url)
            : "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
        title: output.is_selected ? "Selected output" : `Preview ${index + 1}`,
      })),
    );
  } catch (error) {
    console.error("Failed to load review outputs.", error);
    return [];
  }
}

export default async function AdminReviewPage() {
  const outputs = await getReviewOutputs();

  return (
    <section className="grid gap-6">
      <div>
        <Badge>Review queue</Badge>
        <h1 className="mt-2 text-4xl font-extrabold text-[var(--foreground)]">AI quality review</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Admin workspace for reviewing generated outputs and face-sensitive templates.
        </p>
      </div>

      {outputs.length === 0 ? (
        <Card className="rounded-[24px]">
          <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-extrabold text-[var(--foreground)]">No previews to review</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
            Preview outputs will appear here with a quality checklist after generation.
          </p>
          <ButtonLink href="/admin/sessions" variant="ghost" className="mt-5">View sessions</ButtonLink>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {outputs.map(({ output, imageUrl, title }) => (
            <Card
              key={output.id}
              className="rounded-[24px]"
            >
              <CardContent className="grid gap-5 p-5 md:grid-cols-[260px_1fr]">
              <AdminImageCard src={imageUrl} title={title} meta={`${output.provider} · ${output.model ?? "model"}`} />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <AdminStatusBadge status={output.generation_sessions?.status} />
                  {output.generation_sessions?.ai_templates?.requires_admin_review ? (
                    <Badge>
                      Admin review required
                    </Badge>
                  ) : null}
                  <Badge variant="outline">Read-only MVP</Badge>
                </div>
                <h2 className="mt-4 text-xl font-extrabold text-[var(--foreground)]">
                  {output.generation_sessions?.ai_templates?.title_en ?? "Template"}
                </h2>
                <p className="mt-1 text-xs font-bold text-[var(--muted)]">
                  Session {shortId(output.session_id)} · {formatDateTime(output.created_at)}
                </p>
                <Card className="mt-5 rounded-2xl bg-[var(--muted-surface)] shadow-none">
                  <CardHeader className="p-4 pb-0">
                    <CardTitle className="text-base">Quality checklist</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-2 p-4">
                  {checklist.map((item) => (
                    <div key={item} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold">
                      <CheckCircle2 size={14} className="text-[var(--primary-dark)]" aria-hidden="true" />
                      {item}
                    </div>
                  ))}
                  </CardContent>
                </Card>
              </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
