import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-indigo-200/30 bg-indigo-950/44 px-2.5 py-1 text-base text-indigo-50 transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-indigo-200/55 focus-visible:border-indigo-100/72 focus-visible:ring-3 focus-visible:ring-indigo-300/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-indigo-950/28 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-indigo-950/44 dark:disabled:bg-indigo-900/40 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
