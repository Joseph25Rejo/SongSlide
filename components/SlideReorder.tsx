import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { Slide } from "@/types"

interface SlideReorderProps {
  slides: Slide[]
  setSlides: React.Dispatch<React.SetStateAction<Slide[]>>
}

const SlideReorder: React.FC<SlideReorderProps> = ({ slides, setSlides }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  
  const moveSlide = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= slides.length) return
    
    const newSlides = [...slides]
    const [movedSlide] = newSlides.splice(fromIndex, 1)
    newSlides.splice(toIndex, 0, movedSlide)
    setSlides(newSlides)
  }

  const searchLyrics = async () => {
    if (!searchTerm) return
    
    setIsSearching(true)
    try {
      const response = await fetch(`http://localhost:5000/api/lyrics?song=${encodeURIComponent(searchTerm)}`)
      const data = await response.json()
      
      if (data.lyrics) {
        let cleanLyrics = data.lyrics
          .replace(/\[.*?\]/g, '')
          .replace(/\d+Embed$/, '')
        
        // Add type annotations to the parameters
        const verses = cleanLyrics.split("\n\n")
          .filter((verse: string) => verse.trim() !== "")
          .map((verse: string) => verse.trim())
        
        const newSlides = verses.map((content: string) => ({
          content,
          background: "linear-gradient(45deg, #FF6B6B, #4ECDC4)",
          fontColor: "#FFFFFF",
          fontSize: 44,
          transition: "fade",
        }))
        
        setSlides(newSlides)
      }
    } catch (error) {
      console.error("Error fetching lyrics:", error)
      alert("Failed to fetch lyrics. Please make sure the backend server is running.")
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">Reorder Slides</h2>
      
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Search for song lyrics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
          onKeyDown={(e) => e.key === 'Enter' && searchLyrics()}
        />
        <Button 
          onClick={searchLyrics}
          disabled={isSearching || !searchTerm}
        >
          <Search className="h-4 w-4 mr-2" />
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </div>
      
      <div className="space-y-2">
        {slides.map((slide, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded">
            <span>Slide {index + 1}</span>
            <div className="flex space-x-2">
              <Button 
                onClick={() => moveSlide(index, index - 1)}
                disabled={index === 0}
                size="sm"
                variant="outline"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button 
                onClick={() => moveSlide(index, index + 1)}
                disabled={index === slides.length - 1}
                size="sm"
                variant="outline"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SlideReorder

