import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";

export function Testimonial({
  quote,
  author,
  role,
  placeholder,
  youtubeId,
  className,
}: {
  quote: string;
  author: string;
  role: string;
  /** Marca o depoimento como espaço reservado (ainda não real). */
  placeholder?: boolean;
  youtubeId?: string;
  className?: string;
}) {
  return (
    <figure className={cn("rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sg-navy-900/5 md:p-8", className)}>
      {youtubeId ? (
        <div className="mb-6 aspect-video overflow-hidden rounded-xl bg-sg-navy-900">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?rel=0&modestbranding=1`}
            title={`Depoimento de ${author}`}
            loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : null}
      <Quote aria-hidden className="size-8 text-sg-orange-500" strokeWidth={2} />
      <blockquote className={cn("mt-3 font-display text-xl leading-8 font-bold text-sg-navy-900", placeholder && "text-sg-gray-600 italic")}>
        “{quote}”
      </blockquote>
      <figcaption className="mt-4 text-sm">
        <span className="font-semibold text-sg-navy-900">{author}</span>
        <span className="text-sg-gray-600"> · {role}</span>
      </figcaption>
    </figure>
  );
}
