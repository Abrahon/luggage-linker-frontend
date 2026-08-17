"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-green-400" />
        ),
        info: (
          <InfoIcon className="size-4 text-blue-400" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-yellow-400" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-red-400" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast !text-white !shadow-lg",

          success:
            "!bg-green-950 !border-green-500/50 !text-green-100",

          error:
            "!bg-red-950 !border-red-500/50 !text-red-100",

          warning:
            "!bg-yellow-950 !border-yellow-500/50 !text-yellow-100",

          info:
            "!bg-blue-950 !border-blue-500/50 !text-blue-100",

          loading:
            "!bg-gray-900 !border-gray-600 !text-gray-100",

          title: "!text-current font-semibold",

          description:
            "!text-current opacity-90",

          closeButton:
            "!bg-transparent !border-0 !text-current",
        },
      }}
      style={
        {
          "--normal-bg": "transparent",
          "--normal-text": "#ffffff",
          "--normal-border": "transparent",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }