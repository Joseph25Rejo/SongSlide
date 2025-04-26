import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { Slide } from "@/types"

interface SlideCustomizationProps {
  slides: Slide[]
  setSlides: React.Dispatch<React.SetStateAction<Slide[]>>
}

export default function SlideCustomization({ slides, setSlides }: SlideCustomizationProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const updateSlide = (updates: Partial<Slide>) => {
    setSlides((prevSlides) =>
      prevSlides.map((slide, index) => (index === currentSlide ? { ...slide, ...updates } : slide)),
    )
  }

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateSlide({ background: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateSlide({
          media: { type: file.type.startsWith("image") ? "image" : "video", url: reader.result as string },
        })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">Customize Slide {currentSlide + 1}</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="background">Background Color</Label>
          <Input
            id="background"
            type="text"
            value={slides[currentSlide]?.background || ""}
            onChange={(e) => updateSlide({ background: e.target.value })}
            placeholder="e.g. linear-gradient(45deg, #FF6B6B, #4ECDC4)"
          />
        </div>
        <div>
          <Label htmlFor="backgroundImage">Background Image</Label>
          <Input id="backgroundImage" type="file" accept="image/*" onChange={handleBackgroundUpload} />
        </div>
        <div>
          <Label htmlFor="fontColor">Font Color</Label>
          <Input
            id="fontColor"
            type="color"
            value={slides[currentSlide]?.fontColor || "#FFFFFF"}
            onChange={(e) => updateSlide({ fontColor: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="fontSize">Font Size</Label>
          <Input
            id="fontSize"
            type="number"
            value={slides[currentSlide]?.fontSize || 44}
            onChange={(e) => updateSlide({ fontSize: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="transition">Transition</Label>
          <select
            id="transition"
            value={slides[currentSlide]?.transition || "fade"}
            onChange={(e) => updateSlide({ transition: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="fade">Fade</option>
            <option value="slide">Slide</option>
            <option value="zoom">Zoom</option>
          </select>
        </div>
        <div>
          <Label htmlFor="media">Add Image or Video</Label>
          <Input id="media" type="file" accept="image/*,video/*" onChange={handleMediaUpload} />
        </div>
        <div className="flex justify-between">
          <Button onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}>Previous Slide</Button>
          <Button onClick={() => setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1))}>Next Slide</Button>
        </div>
      </div>
    </div>
  )
}

