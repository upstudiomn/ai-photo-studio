import { ArrowRight, ImageIcon, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatMnt } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getTemplateDisplayDescription, getTemplateDisplayTitle } from "@/lib/templates";
import type { AITemplate } from "@/types/studio";

const categoryLabels: Record<string, string> = {
  Restoration: "Restoration",
  Repair: "Restoration",
  Portrait: "Portrait",
  Family: "Family",
  Business: "Business",
  Gift: "Gift",
  Kids: "Kids",
};

export function getTemplateCategoryLabel(category: string) {
  return categoryLabels[category] ?? category;
}

export function PublicTemplateCard({
  template,
  ctaHref,
  ctaLabel = "Upload with this template",
  selected = false,
  compact = false,
}: {
  template: AITemplate;
  ctaHref?: string;
  ctaLabel?: string;
  selected?: boolean;
  compact?: boolean;
}) {
  return (
    <Card
      className={cn(
        "group overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)]",
        selected && "border-[var(--primary)] bg-[var(--soft-accent)]",
      )}
    >
      <Link href={`/templates/${template.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--muted-surface)]">
          <Image
            src={template.previewImageUrl}
            alt={getTemplateDisplayTitle(template)}
            width={720}
            height={540}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(21,23,22,0.3)] via-transparent to-transparent" />
          <Badge variant="outline" className="absolute left-4 top-4 bg-white/95 text-[var(--primary-dark)]">
            {getTemplateCategoryLabel(template.category)}
          </Badge>
          {selected ? (
            <Badge className="absolute right-4 top-4 gap-1.5 bg-[var(--primary)] text-white">
              Selected
            </Badge>
          ) : null}
          {template.requiresAdminReview ? (
            <Badge className="absolute bottom-4 left-4 gap-1.5 bg-[var(--soft-accent)] text-[var(--primary-dark)]">
              <ShieldCheck size={14} aria-hidden="true" />
              Admin quality check
            </Badge>
          ) : null}
        </div>
      </Link>
      <CardContent className={cn("grid gap-4 p-5", compact && "p-4")}>
        <div>
          <h3 className={cn("font-extrabold leading-snug text-[var(--foreground)]", compact ? "text-lg" : "text-xl")}>
            {getTemplateDisplayTitle(template)}
          </h3>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--muted)]">{getTemplateDisplayDescription(template)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="gap-1.5 bg-white">
            <ImageIcon size={14} aria-hidden="true" />
            {template.requiredImagesMin}-{template.requiredImagesMax} photos
          </Badge>
          <Badge variant="outline">From {formatMnt(template.startingPriceMnt)}</Badge>
        </div>
      </CardContent>
      <CardFooter className={cn("flex flex-wrap items-center justify-between gap-3 p-5 pt-0", compact && "p-4 pt-0")}>
        {ctaHref ? (
          <ButtonLink href={ctaHref} size={compact ? "sm" : "default"} className="gap-2">
            {ctaLabel}
            <ArrowRight size={16} aria-hidden="true" />
          </ButtonLink>
        ) : null}
        <Link
          href={`/templates/${template.slug}`}
          className="text-sm font-extrabold text-[var(--primary-dark)] transition hover:text-[var(--primary)]"
        >
          View Details
        </Link>
      </CardFooter>
    </Card>
  );
}
