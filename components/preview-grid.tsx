import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { GeneratedOutput } from "@/types/studio";

export function PreviewGrid({
  outputs,
  getSelectHref,
}: {
  outputs: GeneratedOutput[];
  getSelectHref?: (output: GeneratedOutput) => string;
}) {
  if (outputs.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center text-sm leading-6 text-[var(--muted)]">
          Preview is not ready yet. Check back soon to see your results.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {outputs.map((output, index) => (
        <Card
          key={output.id}
          className={cn("relative overflow-hidden rounded-[24px]", output.isSelected && "border-[var(--primary)]")}
        >
          <div className="relative">
            <Image
              src={output.watermarkedUrl}
              alt={`AI preview ${index + 1}`}
              width={900}
              height={675}
              className="aspect-[4/3] w-full object-cover"
            />
            <Badge variant="outline" className="absolute left-4 top-4 bg-white/95">
              Preview
            </Badge>
            <Badge variant="outline" className="absolute right-4 top-4 border-white/65 bg-[rgba(21,23,22,0.58)] text-white">
              {output.watermarkLabel ?? "Watermark"}
            </Badge>
          </div>
          <CardFooter className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-extrabold text-[var(--foreground)]">{output.title ?? `Version ${index + 1}`}</span>
            {output.isSelected ? (
              <Badge className="gap-2 px-4 py-2 text-sm">
                <CheckCircle2 size={16} aria-hidden="true" />
                Selected
              </Badge>
            ) : getSelectHref ? (
              <Link
                href={getSelectHref(output)}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Select this version
              </Link>
            ) : (
              <button className={buttonVariants({ variant: "outline", size: "sm" })}>
                Select this version
              </button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
