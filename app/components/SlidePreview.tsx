import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Slide } from "../page"

interface SlidePreviewProps {
  slides: Slide[]
}

export default function SlidePreview({ slides }: SlidePreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [fontSize, setFontSize] = useState(44)
  const textRef = useRef<HTMLParagraphElement>(null)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  useEffect(() => {
    if (textRef.current) {
      const containerWidth = textRef.current.offsetWidth
      const containerHeight = textRef.current.offsetHeight
      let testSize = 44

      while (testSize > 12) {
        textRef.current.style.fontSize = `${testSize}px`
        if (textRef.current.scrollWidth <= containerWidth && textRef.current.scrollHeight <= containerHeight) {
          break
        }
        testSize -= 2
      }

      setFontSize(testSize)
    }
  }, [currentSlide]) // Removed unnecessary dependency: slides

  const slide = slides[currentSlide] || {
    content: "Your lyrics will appear here",
    background: "linear-gradient(45deg, #FF6B6B, #4ECDC4)",
    fontColor: "#FFFFFF",
    fontSize: 44,
    transition: "fade",
  }

  return (
    <div className="relative">
      <h2 className="text-xl font-semibold mb-2">Preview</h2>
      <div
        className="w-full aspect-video rounded-lg shadow-lg flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          background: slide.background,
        }}
      >
        {slide.media && slide.media.type === "image" && (
          <img
            src={slide.media.url || "/placeholder.svg"}
            alt="Slide background"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {slide.media && slide.media.type === "video" && (
          <video src={slide.media.url} className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted />
        )}
        <p
          ref={textRef}
          className="text-center font-bold z-10"
          style={{ color: slide.fontColor, fontSize: `${fontSize}px` }}
        >
          {slide.content}
        </p>
        <div className="absolute bottom-2 right-2 text-white text-sm opacity-50">IPC Gigal</div>
      </div>
      <div className="mt-2 flex justify-between">
        <Button onClick={prevSlide} disabled={slides.length <= 1}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button onClick={nextSlide} disabled={slides.length <= 1}>
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
      <p className="text-center mt-2">
        Slide {currentSlide + 1} of {slides.length || 1}
      </p>
    </div>
  )
}

