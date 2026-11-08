"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { track } from "./analytics";

export type CtaVariant = "primary" | "ghost" | "white" | "navy" | "outline";
type CtaSize = "sm" | "md" | "lg";

const variants: Record<CtaVariant, string> = {
  // Texto navy sobre laranja: contraste AA (5,7:1). Branco sobre laranja não passa.
  primary:
    "bg-sg-orange-500 text-sg-navy-900 shadow-[0_6px_20px_-6px_rgba(255,106,19,.7)] hover:bg-[#FF7D33] hover:-translate-y-0.5",
  ghost: "border-2 border-white/70 text-white hover:bg-white/10 hover:border-white",
  white: "bg-white text-sg-navy-900 hover:bg-sg-sand-100",
  navy: "bg-sg-navy-900 text-white hover:bg-sg-navy-700",
  outline: "border-2 border-sg-navy-900 text-sg-navy-900 hover:bg-sg-navy-900 hover:text-white",
};

const sizes: Record<CtaSize, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-base",
  lg: "h-14 px-7 text-lg",
};

export function ctaClasses(variant: CtaVariant = "primary", size: CtaSize = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sg-yellow-400/70",
    variants[variant],
    sizes[size],
    className,
  );
}

type CtaButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: CtaVariant;
  size?: CtaSize;
  className?: string;
  arrow?: boolean;
  /** Rótulo do evento GA4 (cta_click). */
  trackLabel?: string;
  icon?: React.ReactNode;
};

export function CtaButton({ href, children, variant = "primary", size = "md", className, arrow, trackLabel, icon }: CtaButtonProps) {
  const external = /^(https?:|mailto:|tel:)/.test(href);
  const newTab = /^https?:/.test(href);
  const content = (
    <>
      {icon}
      <span>{children}</span>
      {arrow ? <ArrowRight aria-hidden className="size-5" strokeWidth={2} /> : null}
    </>
  );
  const onClick = () => {
    const label = trackLabel ?? (typeof children === "string" ? children : href);
    if (href.includes("wa.me")) track("whatsapp_click", { label });
    else track("cta_click", { label, href });
  };
  if (external) {
    return (
      <a href={href} target={newTab ? "_blank" : undefined} rel={newTab ? "noopener noreferrer" : undefined} onClick={onClick} className={ctaClasses(variant, size, className)}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} onClick={onClick} className={ctaClasses(variant, size, className)}>
      {content}
    </Link>
  );
}
