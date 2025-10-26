"use client"

import * as React from "react"
import {
  ResponsiveContainer,
  Tooltip as RTooltip,
  Legend as RLegend,
} from "recharts"
import { cn } from "@/lib/utils"

export function ChartContainer({
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { children: React.ReactNode }) {
  return (
    <div
      className={cn("flex aspect-video justify-center text-xs", className)}
      {...props}
    >
      <ResponsiveContainer>{children as any}</ResponsiveContainer>
    </div>
  )
}

export const ChartTooltip = RTooltip
export const ChartLegend = RLegend

export const ChartStyle = () => null

export function ChartTooltipContent({
  active,
  payload,
  label,
  className,
}: any) {
  if (!active || !payload?.length) return null

  return (
    <div
      className={cn(
        "grid min-w-[8rem] gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {label !== undefined && (
        <div className="font-medium">{String(label)}</div>
      )}

      <div className="grid gap-1.5">
        {payload.map((item: any, i: number) => (
          <div
            key={i}
            className="flex items-center justify-between gap-2 leading-none"
          >
            <span className="text-muted-foreground">
              {item?.name ?? item?.dataKey ?? "value"}
            </span>
            <span className="font-mono font-medium tabular-nums">
              {typeof item?.value === "number"
                ? item.value.toLocaleString()
                : String(item?.value ?? "")}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChartLegendContent({ payload = [], className }: any) {
  if (!payload.length) return null
  return (
    <div className={cn("flex items-center justify-center gap-4 pt-3", className)}>
      {payload.map((item: any, i: number) => (
        <div key={i} className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 shrink-0 rounded-[2px]"
            style={{ backgroundColor: item?.color }}
          />
          <span>{item?.value}</span>
        </div>
      ))}
    </div>
  )
}
