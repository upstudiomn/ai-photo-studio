import { ImageIcon, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getTemplateDisplayDescription, getTemplateDisplayTitle } from "@/lib/templates";
import { formatMnt } from "@/lib/utils";
import type { AITemplate } from "@/types/studio";

export function TemplateCard({ template }: { template: AITemplate }) {
  return (
    <Card className="overflow-hidden rounded-[20px]">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={template.previewImageUrl}
          alt={getTemplateDisplayTitle(template)}
          width={900}
          height={675}
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
        />
        <Badge variant="outline" className="absolute left-3 top-3 bg-[var(--surface)]/90">
          {template.badge}
        </Badge>
      </div>
      <CardContent className="grid gap-4 p-5">
        <div>
          <p className="font-sans text-xs font-bold uppercase text-[var(--primary-dark)]">
            {template.category}
          </p>
          <h3 className="mt-1 text-2xl font-bold leading-tight">{getTemplateDisplayTitle(template)}</h3>
          <p className="mt-2 font-sans text-sm leading-6 text-[var(--muted)]">
            {getTemplateDisplayDescription(template)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 font-sans text-xs font-bold text-[var(--muted)]">
          <Badge variant="secondary" className="gap-1">
            <ImageIcon size={14} aria-hidden="true" />
            {template.requiredImagesMin}-{template.requiredImagesMax} photos
          </Badge>
          {template.requiresAdminReview ? (
            <Badge variant="default" className="gap-1">
              <ShieldCheck size={14} aria-hidden="true" />
              Admin review
            </Badge>
          ) : null}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-3 p-5 pt-0">
          <span className="font-sans text-sm font-bold">From {formatMnt(template.startingPriceMnt)}</span>
          <ButtonLink href={`/templates/${template.slug}`} variant="primary">
            View Details
          </ButtonLink>
      </CardFooter>
    </Card>
  );
}
