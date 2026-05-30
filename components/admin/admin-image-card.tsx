import Image from "next/image";
import { Card } from "@/components/ui/card";

export function AdminImageCard({
  src,
  title,
  meta,
}: {
  src: string;
  title: string;
  meta?: string;
}) {
  return (
    <Card className="overflow-hidden rounded-[20px] shadow-[0_10px_30px_var(--shadow-soft)]">
    <figure>
      <Image src={src} alt={title} width={720} height={540} className="aspect-[4/3] w-full object-cover" />
      <figcaption className="border-t border-[var(--line)] px-4 py-3">
        <p className="truncate text-sm font-extrabold text-[var(--foreground)]">{title}</p>
        {meta ? <p className="mt-1 truncate text-xs font-bold text-[var(--muted)]">{meta}</p> : null}
      </figcaption>
    </figure>
    </Card>
  );
}
