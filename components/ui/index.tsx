import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export function buttonClass(variant: ButtonProps["variant"] = "primary", size: ButtonProps["size"] = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand",
    size === "sm" && "h-9 px-3 text-sm",
    size === "md" && "h-11 px-4 text-[15px]",
    size === "lg" && "h-14 px-6 text-base",
    variant === "primary" && "bg-brand text-brand-fg hover:brightness-110 shadow-sm",
    variant === "secondary" && "bg-brand-2 text-brand-2-fg hover:brightness-110",
    variant === "accent" && "bg-brand-accent text-brand-accent-fg hover:brightness-105 shadow-sm",
    variant === "outline" && "border border-brand-200 bg-white text-brand-ink hover:bg-brand-50",
    variant === "ghost" && "text-brand-ink hover:bg-brand-50",
    variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
    className,
  );
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, className, ...props }, ref,
) {
  return <button ref={ref} className={buttonClass(variant, size, className)} {...props} />;
});

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-brand-100 bg-white p-4 shadow-sm", className)} {...props} />;
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props }, ref,
) {
  return (
    <input
      ref={ref}
      className={cn("h-11 w-full rounded-xl border border-brand-200 bg-white px-3 text-[15px] text-brand-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30 disabled:bg-brand-50", className)}
      {...props}
    />
  );
});

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...props }, ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn("w-full rounded-xl border border-brand-200 bg-white px-3 py-2 text-[15px] text-brand-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30", className)}
      {...props}
    />
  );
});

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, ...props }, ref,
) {
  return (
    <select
      ref={ref}
      className={cn("h-11 w-full rounded-xl border border-brand-200 bg-white px-3 text-[15px] text-brand-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30", className)}
      {...props}
    />
  );
});

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1 block text-sm font-medium text-brand-ink", className)} {...props} />;
}

export function Field({ label, hint, children, className }: { label: string; hint?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      {children}
      {hint && <p className="mt-1 text-xs text-brand-muted">{hint}</p>}
    </div>
  );
}

export function Pill({ className, tone = "slate", ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: "slate" | "green" | "amber" | "red" | "brand" | "blue" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        tone === "slate" && "bg-brand-50 text-brand-ink",
        tone === "green" && "bg-green-100 text-green-800",
        tone === "amber" && "bg-amber-100 text-amber-800",
        tone === "red" && "bg-red-100 text-red-700",
        tone === "blue" && "bg-blue-100 text-blue-800",
        tone === "brand" && "bg-brand text-brand-fg",
        className,
      )}
      {...props}
    />
  );
}

export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-ink">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-brand-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-brand-200 p-8 text-center text-sm text-brand-muted">{children}</div>;
}

export function Alert({ tone = "red", children }: { tone?: "red" | "green" | "amber" | "blue"; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-xl px-3 py-2 text-sm",
      tone === "red" && "bg-red-50 text-red-700", tone === "green" && "bg-green-50 text-green-800",
      tone === "amber" && "bg-amber-50 text-amber-800", tone === "blue" && "bg-blue-50 text-blue-800")}>
      {children}
    </div>
  );
}
