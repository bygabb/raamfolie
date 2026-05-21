import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 rounded-full border border-brand-border bg-white px-6 py-3.5 text-base text-ink transition-colors outline-none file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink placeholder:text-meta focus:border-ink disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
