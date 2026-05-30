import { ArrowRight, CheckCircle2, ImagePlus, LockKeyhole, Sparkles } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { UploadDropzone } from "@/components/upload-dropzone";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createGenerationSessionUploadAction } from "@/app/create/actions";
import { getTemplateBySlug, getTemplateDisplayTitle } from "@/lib/templates";

const steps = ["Upload photo", "Choose template", "Generate preview", "View results"];

const errorMessages: Record<string, string> = {
  "no-file": "Please upload an image first.",
  consent: "Consent is required to process with AI.",
  "invalid-file": "Please upload a JPG, PNG, or WEBP image under 10MB.",
  upload: "We could not save this upload. Please try again.",
  session: "Upload a photo first, then choose a template.",
};

const noticeMessages: Record<string, string> = {
  template: "Template selected. Upload your photo to continue.",
};

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; upload?: string; template?: string }>;
}) {
  const { error, upload, template } = await searchParams;
  const selectedTemplate = template ? getTemplateBySlug(template) : null;
  const errorMessage = error ? errorMessages[error] : null;
  const noticeMessage = selectedTemplate ? noticeMessages.template : upload ? noticeMessages[upload] : null;

  return (
    <>
      <SiteHeader />
      <main className="shell py-8 sm:py-12">
        <section className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <Card className="rounded-[28px]">
            <CardHeader className="p-6 sm:p-8">
              <Badge className="w-fit">Start AI preview</Badge>
              <h1 className="mt-3 text-4xl font-extrabold leading-[1.04] text-[var(--foreground)] sm:text-5xl">
                Upload Photo
              </h1>
              <p className="text-lg leading-8 text-[var(--muted)]">
                Upload your photo first, then choose your template in the next step.
              </p>
            </CardHeader>

            <CardContent className="grid gap-8 p-6 pt-0 sm:p-8 sm:pt-0">
            <div className="grid gap-3">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--muted-surface)] px-4 py-3"
                >
                  <span className="grid size-9 place-items-center rounded-full bg-[var(--soft-accent)] text-sm font-extrabold text-[var(--primary-dark)]">
                    {index + 1}
                  </span>
                  <span className="font-extrabold text-[var(--foreground)]">{step}</span>
                </div>
              ))}
            </div>

            <div className="rounded-[22px] border border-[var(--line)] bg-[var(--soft-accent)] p-5">
              <div className="flex gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-[var(--primary-dark)]">
                  <LockKeyhole size={20} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-extrabold text-[var(--foreground)]">Private photo handling</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Your photo is used only for the specific AI preview being generated.
                  </p>
                </div>
              </div>
            </div>
            </CardContent>
          </Card>

          <section className="grid gap-5">
            <form action={createGenerationSessionUploadAction} className="grid gap-5">
              {selectedTemplate ? <input type="hidden" name="templateSlug" value={selectedTemplate.slug} /> : null}
              <Card className="rounded-[28px]">
                <CardHeader className="flex-row items-center gap-3 space-y-0 p-5 sm:p-6">
                  <span className="grid size-12 place-items-center rounded-2xl bg-[var(--soft-accent)] text-[var(--primary-dark)]">
                    <ImagePlus size={24} aria-hidden="true" />
                  </span>
                  <div>
                    <CardTitle>Image file</CardTitle>
                    <p className="text-sm leading-6 text-[var(--muted)]">Upload 1-5 images.</p>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
                  <UploadDropzone min={1} max={5} helperText="Upload JPG, PNG, or WEBP files." />
                </CardContent>
              </Card>

              <Label className="flex cursor-pointer gap-3 rounded-[24px] border border-[var(--line)] bg-white p-5 text-sm leading-6 shadow-[0_12px_35px_var(--shadow-soft)] transition hover:bg-[var(--soft-accent)]/35">
                <input name="consent" type="checkbox" className="mt-1 size-4 accent-[var(--primary)]" />
                <span>
                  I am uploading my own photo or one I have permission to use, and I consent to AI processing.
                </span>
              </Label>

              {errorMessage ? (
                <p className="rounded-2xl border border-[#C84646]/25 bg-[#C84646]/10 px-4 py-3 text-sm font-bold text-[#9F3333]">
                  {errorMessage}
                </p>
              ) : null}

              {noticeMessage ? (
                <p className="rounded-2xl border border-[var(--line)] bg-[var(--soft-accent)] px-4 py-3 text-sm font-bold text-[var(--primary-dark)]">
                  {selectedTemplate ? `${noticeMessage} ${getTemplateDisplayTitle(selectedTemplate)}` : noticeMessage}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Button type="submit" className="gap-2 px-6">
                  Next step
                  <ArrowRight size={17} aria-hidden="true" />
                </Button>
                <ButtonLink href="/templates" variant="ghost">
                  Browse templates
                </ButtonLink>
              </div>
            </form>

            <div className="flex items-start gap-3 rounded-[24px] border border-[var(--line)] bg-[var(--soft-accent)] p-5">
              <Sparkles className="mt-0.5 text-[var(--primary-dark)]" size={20} aria-hidden="true" />
              <p className="text-sm font-bold leading-6 text-[var(--foreground)]">
                After preview is generated, confirm your digital file or A4/A3 print order.
              </p>
            </div>
          </section>
        </section>

        <Card className="mt-10 rounded-[28px]">
          <CardContent className="grid gap-4 p-6 sm:grid-cols-3">
          {["No prompt writing needed", "Watermark preview", "Final file after payment"].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <CheckCircle2 className="text-[var(--primary-dark)]" size={20} aria-hidden="true" />
              <p className="font-extrabold text-[var(--foreground)]">{item}</p>
            </div>
          ))}
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
