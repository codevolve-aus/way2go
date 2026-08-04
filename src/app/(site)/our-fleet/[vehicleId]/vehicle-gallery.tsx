"use client"

import { useState } from "react"
import Image from "next/image"
import { ImageOff } from "lucide-react"
import { cn } from "@/lib/utils"

export function VehicleGallery({
  photos,
  title,
}: {
  photos: { id: string; url: string }[]
  title: string
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selected = photos[selectedIndex]

  return (
    <div>
      <div className="relative aspect-4/3 sm:aspect-16/9 w-full overflow-hidden rounded-2xl bg-muted ring-1 ring-foreground/10">
        {selected ? (
          <Image
            src={selected.url}
            alt={title}
            fill
            sizes="(min-width: 1024px) 66vw, 100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageOff className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
      </div>

      {photos.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setSelectedIndex(i)}
              aria-label={`Show photo ${i + 1} of ${photos.length}`}
              aria-current={i === selectedIndex}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg bg-muted ring-2 transition-opacity",
                i === selectedIndex
                  ? "ring-primary"
                  : "ring-foreground/10 opacity-75 hover:opacity-100"
              )}
            >
              <Image src={photo.url} alt="" fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
