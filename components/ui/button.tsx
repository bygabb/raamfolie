import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "rounded-full bg-ink text-white font-display font-semibold hover:opacity-90",
        outline:
          "rounded-full border-2 border-ink bg-transparent text-ink font-display font-semibold hover:bg-ink hover:text-white",
        secondary:
          "rounded-full bg-surface-2 text-ink font-display font-semibold hover:bg-surface-2/70",
        ghost:
          "rounded-full hover:bg-surface-2 hover:text-ink aria-expanded:bg-surface-2",
        destructive:
          "rounded-full border-2 border-destructive/40 bg-destructive/5 text-destructive font-display font-semibold hover:bg-destructive hover:text-white",
        link: "text-link underline-offset-4 hover:text-link-hover hover:underline",
      },
      size: {
        default: "gap-2 px-7 py-3.5",
        xs: "h-6 gap-1 rounded-full px-3 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "gap-1.5 rounded-full px-4 py-2 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "gap-2 px-8 py-4 text-base",
        icon: "size-9 rounded-full",
        "icon-xs": "size-6 rounded-full [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-full",
        "icon-lg": "size-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
