import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { Slide } from "@/types"

interface SlideReorderProps {
  slides: Slide[]
  setSlides: React.Dispatch<React.SetStateAction<Slide[]>>
}

export default function SlideReorder({ slides, setSlides }: SlideReorderProps) {
  const [selectedSlide, setSelectedSlide] = useState<number | null>(null)

  const moveSlide = (from: number, to: number) => {
    setSlides((prevSlides) => {
      const newSlides = [...prevSlides]
      const [removed] = newSlides.splice(from, 1)
      newSlides.splice(to, 0, removed)
      return newSlides
    })
  }

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">Reorder Slides</h2>
      <div className="space-y-2">
        {slides.map((slide, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Button
              variant="outline"
              className={`flex-grow ${selectedSlide === index ? "border-blue-500" : ""}`}
              onClick={() => setSelectedSlide(index)}
            >
              Slide {index + 1}
            </Button>
            <Button onClick={() => moveSlide(index, Math.max(0, index - 1))} disabled={index === 0}>
              ↑
            </Button>
            <Button
              onClick={() => moveSlide(index, Math.min(slides.length - 1, index + 1))}
              disabled={index === slides.length - 1}
            >
              ↓
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

