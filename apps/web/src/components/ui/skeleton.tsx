import { cn } from "@/lib/utils"

function Skeleton({ className, shape = "row", ...props }: React.ComponentProps<"div"> & { shape?: "row" | "card" }) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse bg-muted", shape === "card" ? "rounded-3xl" : "rounded-2xl", className)}
      {...props}
    />
  )
}

export { Skeleton }
