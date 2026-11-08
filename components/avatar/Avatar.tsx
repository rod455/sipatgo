import { renderAvatarSvg } from "@/lib/avatar";
import type { AvatarConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Avatar({ config, seed, size = 40, className, ring }: {
  config: unknown; seed?: string; size?: number; className?: string; ring?: boolean;
}) {
  const svg = renderAvatarSvg(config as AvatarConfig | null, seed);
  return (
    <span
      aria-hidden
      className={cn("inline-block shrink-0 overflow-hidden rounded-full bg-brand-50 [&>svg]:h-full [&>svg]:w-full", ring && "ring-2 ring-brand ring-offset-2", className)}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
