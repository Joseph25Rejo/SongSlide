"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Download, Plus, Copy, Trash2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Slide {
  content: string
  background: string
  fontColor: string
  fontSize: number
  transition: string
  media?: { type: "image" | "video"; url: string }
}

interface SlideTemplate {
  name: string
  background: string
  fontColor: string
  fontSize: number
  transition: string
}

interface SavedPresentation {
  name: string
  slides: Slide[]
  createdAt: string
  lastModified: string
}

const PreviewSlide = ({ slide, label, isNextSlide = false }: { 
  slide: Slide, 
  label: string,
  isNextSlide?: boolean 
}) => (
  <div
    className="rounded-lg shadow-lg flex items-center justify-center p-4 relative overflow-hidden"
    style={{
      background: slide.background,
      height: isNextSlide ? "150px" : "350px",
      width: "100%"
    }}
  >
    {slide.media?.type === "image" && (
      <img
        src={slide.media.url}
        alt="Slide background"
        className="absolute inset-0 w-full h-full object-cover"
      />
    )}
    {slide.media?.type === "video" && (
      <video
        src={slide.media.url}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
      />
    )}
    <p 
      className="text-center font-bold z-10" 
      style={{ 
        color: slide.fontColor, 
        fontSize: isNextSlide ? `${slide.fontSize * 0.5}px` : `${slide.fontSize}px` 
      }}
      dangerouslySetInnerHTML={{ __html: slide.content }}
    />
    <div className="absolute bottom-2 right-2 text-sm opacity-50"
         style={{ color: slide.fontColor }}>
      {label}
    </div>
    <div 
      className="absolute bottom-2 left-2 text-sm opacity-50"
      style={{ color: slide.fontColor }}
    >
      IPC Gilgal
    </div>
  </div>
);

const getContrastColor = (background: string): string => {
  const color = background.match(/#[a-fA-F0-9]{6}/)?.[0] || '#1C1C1C'
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

const defaultTemplates: SlideTemplate[] = [
  {
    name: "Gradient Purple",
    background: "linear-gradient(45deg, #1C1C1C, #663399, #B06AB3)",
    fontColor: "#FFFFFF",
    fontSize: 30,
    transition: "fade"
  },
  {
    name: "Dark Mode",
    background: "#121212",
    fontColor: "#FFFFFF",
    fontSize: 30,
    transition: "fade"
  },
  {
    name: "Light Mode",
    background: "#FFFFFF",
    fontColor: "#000000",
    fontSize: 30,
    transition: "fade"
  },
  {
    name: "Ocean",
    background: "linear-gradient(45deg, #1a4b6b, #2a9d8f)",
    fontColor: "#FFFFFF",
    fontSize: 30,
    transition: "fade"
  },
  {
    "name": "Sunset Glow",
    "background": "linear-gradient(45deg, #ff7e5f, #feb47b)",
    "fontColor": "#FFFFFF",
    "fontSize": 30,
    "transition": "fade"
  },
  {
    "name": "Cool Blues",
    "background": "linear-gradient(45deg, #2193b0, #6dd5ed)",
    "fontColor": "#FFFFFF",
    "fontSize": 30,
    "transition": "fade"
  },
  {
    "name": "Mojito",
    "background": "linear-gradient(45deg, #1d976c, #93f9b9)",
    "fontColor": "#FFFFFF",
    "fontSize": 30,
    "transition": "fade"
  },
  {
    "name": "Cherry Blossom",
    "background": "linear-gradient(45deg, #ff9a9e, #fad0c4)",
    "fontColor": "#FFFFFF",
    "fontSize": 30,
    "transition": "fade"
  },
  {
    "name": "Deep Space",
    "background": "linear-gradient(45deg, #000000, #434343)",
    "fontColor": "#FFFFFF",
    "fontSize": 30,
    "transition": "fade"
  },
  {
    "name": "Emerald Water",
    "background": "linear-gradient(45deg, #348F50, #56B4D3)",
    "fontColor": "#FFFFFF",
    "fontSize": 30,
    "transition": "fade"
  },
  {
    "name": "Bloody Mary",
    "background": "linear-gradient(45deg, #FF512F, #DD2476)",
    "fontColor": "#FFFFFF",
    "fontSize": 30,
    "transition": "fade"
  },
  {
    "name": "Aubergine",
    "background": "linear-gradient(45deg, #AA076B, #61045F)",
    "fontColor": "#FFFFFF",
    "fontSize": 30,
    "transition": "fade"
  },
  {
    "name": "Aqua Marine",
    "background": "linear-gradient(45deg, #1A2980, #26D0CE)",
    "fontColor": "#FFFFFF",
    "fontSize": 30,
    "transition": "fade"
  },
  {
    "name": "Sunrise",
    "background": "linear-gradient(45deg, #FF512F, #F09819)",
    "fontColor": "#FFFFFF",
    "fontSize": 30,
    "transition": "fade"
  },
  {
    "name": "Purple Paradise",
    "background": "linear-gradient(45deg, #1D2B64, #F8CDDA)",
    "fontColor": "#FFFFFF",
    "fontSize": 30,
    "transition": "fade"
  },
  {
    "name": "Sea Blizz",
    "background": "linear-gradient(45deg, #1CD8D2, #93EDC7)",
    "fontColor": "#FFFFFF",
    "fontSize": 30,
    "transition": "fade"
  },
  {
    "name": "Mango Pulp",
    "background": "linear-gradient(45deg, #F09819, #EDDE5D)",
    "fontColor": "#FFFFFF",
    "fontSize": 30,
    "transition": "fade"
  },
  {
    "name": "Royal Blue",
    "background": "linear-gradient(45deg, #536976, #292E49)",
    "fontColor": "#FFFFFF",
    "fontSize": 30,
    "transition": "fade"
  },
  {
    "name": "Frost",
    "background": "linear-gradient(45deg, #000428, #004e92)",
    "fontColor": "#FFFFFF",
    "fontSize": 30,
    "transition": "fade"
  },
  {
    "name": "Lush",
    "background": "linear-gradient(45deg, #56ab2f, #a8e063)",
    "fontColor": "#FFFFFF",
    "fontSize": 30,
    "transition": "fade"
  },
  {
    "name": "Firewatch",
    "background": "linear-gradient(45deg, #cb2d3e, #ef473a)",
    "fontColor": "#FFFFFF",
    "fontSize": 30,
    "transition": "fade"
  },
  {
    "name": "Sherbert",
    "background": "linear-gradient(45deg, #f79d00, #64f38c)",
    "fontColor": "#FFFFFF",
    "fontSize": 30,
    "transition": "fade"
  },
  {
    "name": "Blood Red",
    "background": "linear-gradient(45deg, #f85032, #e73827)",
    "fontColor": "#FFFFFF",
    "fontSize": 30,
    "transition": "fade"
  },
  {
    "name": "Sun on the Horizon",
    "background": "linear-gradient(45deg, #fceabb, #f8b500)",
    "fontColor": "#FFFFFF",
    "fontSize": 30,
    "transition": "fade"
  },
  {
    "name": "Dirty Fog",
    "background": "linear-gradient(45deg, #B993D6, #8CA6DB)",
    "fontColor": "#FFFFFF",
    "fontSize": 30,
    "transition": "fade"
  },
  {
    "name": "The Strain",
    "background": "linear-gradient(45deg, #870000, #190A05)",
    "fontColor": "#FFFFFF",
    "fontSize": 30,
    "transition": "fade"
  },
  {
    "name": "Cherry",
    "background": "linear-gradient(45deg, #EB3349, #F45C43)",
    "fontColor": "#FFFFFF",
    "fontSize": 30,
    "transition": "fade"
  },
  {
    "name": "Pink Flavour",
    "background": "linear-gradient(45deg, #800080, #ffc0cb)",
    "fontColor": "#FFFFFF",
    "fontSize": 30,
    "transition": "fade"
  },
  {
    "name": "Fly High",
    "background": "linear-gradient(45deg, #48C6EF, #6F86D6)",
    "fontColor": "#FFFFFF",
    "fontSize": 30,
    "transition": "fade"
  }
  // ... (include all your other templates here)
]

export default function Page() {
  const [lyrics, setLyrics] = useState<string>("")
  const [slides, setSlides] = useState<Slide[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [fontSize, setFontSize] = useState(30)
  const [globalBackground, setGlobalBackground] = useState("linear-gradient(45deg, #1C1C1C, #663399, #B06AB3)")
  const [applyToAll, setApplyToAll] = useState(true)
  const [templates] = useState<SlideTemplate[]>(defaultTemplates)
  const [savedPresentations, setSavedPresentations] = useState<SavedPresentation[]>([])
  const [presentationName, setPresentationName] = useState<string>("")
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [isPresenting, setIsPresenting] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [filteredTemplates, setFilteredTemplates] = useState(templates)
  const [applyFontToAll, setApplyFontToAll] = useState(true)
  const [globalFontSize, setGlobalFontSize] = useState(30)

  const textColor = getContrastColor(globalBackground)

  useEffect(() => {
    const verses = lyrics.split("\n\n").filter(verse => verse.trim() !== "")
    setSlides(
      verses.map((content) => ({
        content: content.split('\n').map((line, i, arr) => 
          i === arr.length - 1 ? line : line + '<br/>'
        ).join(''),
        background: globalBackground,
        fontColor: textColor,
        fontSize: 30,
        transition: "fade",
      }))
    )
  }, [lyrics, globalBackground, textColor])

  useEffect(() => {
    const saved = localStorage.getItem('saved_presentations')
    if (saved) {
      setSavedPresentations(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isPresenting) {
        switch (e.key) {
          case "ArrowRight":
          case "Space":
            nextSlide()
            break
          case "ArrowLeft":
            prevSlide()
            break
          case "Escape":
            setIsPresenting(false)
            document.exitFullscreen().catch(() => {})
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isPresenting, currentSlide])

  const showNotification = (message: string) => {
    setAlertMessage(message)
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  const updateSlide = (updates: Partial<Slide>) => {
    setSlides((prevSlides) =>
      prevSlides.map((slide, index) => {
        if ((applyToAll && 'background' in updates) || (applyFontToAll && 'fontSize' in updates)) {
          if ('background' in updates) setGlobalBackground(updates.background as string)
          if ('fontSize' in updates) setGlobalFontSize(updates.fontSize as number)
          return { ...slide, ...updates }
        }
        return index === currentSlide ? { ...slide, ...updates } : slide
      })
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
          media: {
            type: file.type.startsWith("image") ? "image" : "video",
            url: reader.result as string,
          },
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const exportToPPT = () => {
    const slidesHTML = slides.map(slide => `
      <!DOCTYPE html>
      <div style="
        page-break-after: always;
        height: 100vh;
        width: 100vw;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${slide.background};
        position: relative;
        padding: 40px;
      ">
        ${slide.media ? `<img src="${slide.media.url}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0;" />` : ''}
        <div style="
          color: ${slide.fontColor};
          font-size: ${slide.fontSize}px;
          text-align: center;
          z-index: 1;
          width: 100%;
        ">
          ${slide.content}
        </div>
        <div style="
          position: absolute;
          bottom: 20px;
          left: 20px;
          font-size: 14px;
          opacity: 0.5;
          color: ${slide.fontColor};
        ">
          IPC Gilgal
        </div>
      </div>
    `).join('')
  
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>LyricSlide Presentation</title>
        <style>
          body { margin: 0; padding: 0; }
          @media print {
            div { page-break-after: always; }
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        ${slidesHTML}
      </body>
      </html>
    `
  
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'lyrics_presentation.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showNotification("Presentation exported as HTML. Please open in a browser and use Print to save as PDF.")
  }

  const addNewSlide = () => {
    setSlides([...slides, {
      content: "New Slide",
      background: globalBackground,
      fontColor: textColor,
      fontSize: 30,
      transition: "fade"
    }])
    setCurrentSlide(slides.length)
    showNotification("New slide added!")
  }

  const duplicateSlide = (index: number) => {
    const newSlides = [...slides]
    newSlides.splice(index + 1, 0, { ...slides[index] })
    setSlides(newSlides)
    setCurrentSlide(index + 1)
    showNotification("Slide duplicated!")
  }

  const deleteSlide = (index: number) => {
    if (slides.length > 1) {
      const newSlides = slides.filter((_, i) => i !== index)
      setSlides(newSlides)
      setCurrentSlide(Math.min(currentSlide, newSlides.length - 1))
      showNotification("Slide deleted!")
    } else {
      showNotification("Cannot delete the last slide!")
    }
  }

  const savePresentation = () => {
    if (!presentationName) {
      showNotification("Please enter a presentation name!")
      return
    }
    
    const newPresentation: SavedPresentation = {
      name: presentationName,
      slides: slides,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }
    
    setSavedPresentations([...savedPresentations, newPresentation])
    localStorage.setItem('saved_presentations', JSON.stringify([...savedPresentations, newPresentation]))
    setShowSaveModal(false)
    setPresentationName("")
    showNotification("Presentation saved successfully!")
  }

  const loadPresentation = (presentation: SavedPresentation) => {
    setSlides(presentation.slides)
    setCurrentSlide(0)
    showNotification("Presentation loaded successfully!")
  }

  const applyTemplate = (template: SlideTemplate) => {
    updateSlide({
      background: template.background,
      fontColor: template.fontColor,
      fontSize: template.fontSize,
      transition: template.transition
    })
    setShowTemplateModal(false)
    showNotification("Template applied successfully!")
  }

  const startPresentation = () => {
    setIsPresenting(true)
    document.documentElement.requestFullscreen().catch(() => {
      showNotification("Fullscreen mode not available")
    })
  }

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  const getNextSlide = () => {
    if (slides.length <= 1) return null;
    const nextIndex = (currentSlide + 1) % slides.length;
    return slides[nextIndex];
  }

  const slide = slides[currentSlide] || {
    content: "Your lyrics will appear here",
    background: globalBackground,
    fontColor: textColor,
    fontSize: 30,
    transition: "fade",
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 p-4">
      {showAlert && (
        <Alert className="fixed top-4 right-4 z-50 bg-green-500 text-white">
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}

      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Lyrics to Slides
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <Card className={`bg-gray-800/50 border-gray-700 ${textColor === '#000000' ? 'text-black' : 'text-white'}`}>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Enter Lyrics</h2>
                <Textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="Enter your lyrics here..."
                  rows={10}
                  className={`bg-gray-700/50 border-gray-600 ${textColor === '#000000' ? 'text-black' : 'text-white'}placeholder-gray-400`}
                />
              </CardContent>
            </Card>

            <Card className={`bg-gray-800/50 border-gray-700 ${textColor === '#000000' ? 'text-black' : 'text-white'}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Customize Slide {currentSlide + 1}</h2>
                  <div className="flex gap-2">
                    <Button onClick={() => duplicateSlide(currentSlide)} className="bg-blue-600 hover:bg-blue-700">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => deleteSlide(currentSlide)} className="bg-red-600 hover:bg-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <Label htmlFor="applyToAll" className={textColor === '#000000' ? 'text-black' : 'text-white'}>
                    Apply background to all slides
                  </Label>
                  <Switch
                    id="applyToAll"
                    checked={applyToAll}
                    onCheckedChange={setApplyToAll}
                  />
                </div>
                <div className="flex items-center justify-between mb-4">
                  <Label htmlFor="applyFontToAll" className={textColor === '#000000' ? 'text-black' : 'text-white'}>
                    Apply font size to all slides
                  </Label>
                  <Switch
                    id="applyFontToAll"
                    checked={applyFontToAll}
                    onCheckedChange={setApplyFontToAll}
                  />
                </div>

                <Tabs defaultValue="background" className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="background" className="flex-1">Background</TabsTrigger>
                    <TabsTrigger value="text" className="flex-1">Text</TabsTrigger>
                    <TabsTrigger value="media" className="flex-1">Media</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="background" className="space-y-4">
                    <div>
                      <Label htmlFor="background" className={textColor === '#000000' ? 'text-black' : 'text-white'}>
                        Background Color/Gradient
                      </Label>
                      <Input
                        id="background"
                        type="text"
                        value={applyToAll ? globalBackground : (slide ? slide.background : '')}
                        onChange={(e) => updateSlide({ background: e.target.value })}
                        className={`bg-gray-700/50 border-gray-600 ${textColor === '#000000' ? 'text-black' : 'text-white'}`}
                        placeholder="e.g. linear-gradient(45deg, #1C1C1C, #663399, #B06AB3)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="backgroundImage" className={textColor === '#000000' ? 'text-black' : 'text-white'}>
                        Background Image
                      </Label>
                      <Input 
                        id="backgroundImage" 
                        type="file" 
                        accept="image/*" 
                        onChange={handleBackgroundUpload}
                        className={`bg-gray-700/50 border-gray-600 ${textColor === '#000000' ? 'text-black' : 'text-white'}`}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="text" className="space-y-4">
                    <div>
                      <Label htmlFor="fontColor" className={textColor === '#000000' ? 'text-black' : 'text-white'}>
                        Font Color
                      </Label>
                      <Input
                        id="fontColor"
                        type="color"
                        value={slide ? slide.fontColor : '#FFFFFF'}
                        onChange={(e) => updateSlide({ fontColor: e.target.value })}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fontSize" className={textColor === '#000000' ? 'text-black' : 'text-white'}>
                        Font Size
                      </Label>
                      <Input
                        id="fontSize"
                        type="number"
                        value={applyFontToAll ? globalFontSize : (slide ? slide.fontSize : 16)}
                        onChange={(e) => updateSlide({ fontSize: Number(e.target.value) })}
                        className={`bg-gray-700/50 border-gray-600 ${textColor === '#000000' ? 'text-black' : 'text-white'}`}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="media" className="space-y-4">
                    <div>
                      <Label htmlFor="media" className={textColor === '#000000' ? 'text-black' : 'text-white'}>
                        Add Image or Video
                      </Label>
                      <Input 
                        id="media" 
                        type="file" 
                        accept="image/*,video/*" 
                        onChange={handleMediaUpload}
                        className={`bg-gray-700/50 border-gray-600 ${textColor === '#000000' ? 'text-black' : 'text-white'}`}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card className={`bg-gray-800/50 border-gray-700 ${textColor === '#000000' ? 'text-black' : 'text-white'}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Preview</h2>
                  <div className="flex gap-2">
                    <Button onClick={startPresentation} className="bg-indigo-600 hover:bg-indigo-700">
                      Present
                    </Button>
                    <Button onClick={exportToPPT} className="bg-purple-600 hover:bg-purple-700">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                {/* Current Slide Preview */}
                <PreviewSlide 
                  slide={slide} 
                  label={`Current: ${currentSlide + 1}/${slides.length}`} 
                />

                {/* Next Slide Preview */}
                {getNextSlide() && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Next Slide Preview</h3>
                    <PreviewSlide 
                      slide={getNextSlide()} 
                      label={`Next: ${((currentSlide + 1) % slides.length) + 1}/${slides.length}`}
                      isNextSlide={true}
                    />
                  </div>
                )}
                
                <div className="mt-4 flex justify-between items-center">
                  <Button onClick={prevSlide} disabled={slides.length <= 1} className="bg-purple-600 hover:bg-purple-700">
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <div className="flex gap-2">
                    <Button onClick={addNewSlide} className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      New Slide
                    </Button>
                    <Button onClick={() => setShowTemplateModal(true)} className="bg-blue-600 hover:bg-blue-700">
                      Templates
                    </Button>
                    <Button onClick={() => setShowSaveModal(true)} className="bg-orange-600 hover:bg-orange-700">
                      Save
                    </Button>
                  </div>
                  <Button onClick={nextSlide} disabled={slides.length <= 1} className="bg-purple-600 hover:bg-purple-700">
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-gray-800/50 border-gray-700 ${textColor === '#000000' ? 'text-black' : 'text-white'}`}>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Saved Presentations</h2>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {savedPresentations.map((presentation, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                      <span>{presentation.name}</span>
                      <Button onClick={() => loadPresentation(presentation)} className="bg-blue-600 hover:bg-blue-700">
                        Load
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 max-w-md w-full ${
            textColor === '#000000' ? 'bg-white text-black' : 'bg-gray-800 text-white'
          }`}>
            <h3 className="text-xl font-bold mb-4">Choose Template</h3>
            <Input
              type="text"
              placeholder="Search templates..."
              className="mb-4"
              onChange={(e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filtered = templates.filter(t => 
                  t.name.toLowerCase().includes(searchTerm)
                );
                setFilteredTemplates(filtered);
              }}
            />
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {filteredTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => applyTemplate(template)}
                  className="w-full p-4 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
                >
                  <div 
                    className="w-6 h-6 rounded"
                    style={{ background: template.background }}
                  />
                  {template.name}
                </button>
              ))}
            </div>
            <Button onClick={() => setShowTemplateModal(false)} className="mt-4">
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 max-w-md w-full ${
            textColor === '#000000' ? 'bg-gray-800 text-white' : 'bg-gray-400 text-black'
          }`}>
            <h3 className="text-xl font-bold mb-4">Save Presentation</h3>
            <Input
              type="text"
              placeholder="Presentation Name"
              value={presentationName}
              onChange={(e) => setPresentationName(e.target.value)}
              className="mb-4"
            />
            <div className="flex gap-2">
              <Button onClick={savePresentation} className="bg-green-600 hover:bg-green-700">
                Save
              </Button>
              <Button onClick={() => setShowSaveModal(false)} variant="outline" className="bg-red-600 hover:bg-red-700">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Presentation Mode */}
      {isPresenting && (
        <div className="fixed inset-0 bg-black z-50">
          <div
            className="w-full h-full flex items-center justify-center p-8"
            style={{
              background: slides[currentSlide].background
            }}
          >
            {slides[currentSlide].media?.type === "image" && (
              <img
                src={slides[currentSlide].media.url}
                alt="Slide background"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            {slides[currentSlide].media?.type === "video" && (
              <video
                src={slides[currentSlide].media.url}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                loop
                muted
              />
            )}
            <p
              className="text-center font-bold z-10 max-w-4xl"
              style={{
                color: slides[currentSlide].fontColor,
                fontSize: `${slides[currentSlide].fontSize * 1.5}px`
              }}
              dangerouslySetInnerHTML={{ __html: slides[currentSlide].content }}
            />
            <div 
              className="absolute bottom-4 left-4 text-sm opacity-50"
              style={{ color: slides[currentSlide].fontColor }}
            >
              IPC Gilgal
            </div>
            <div 
              className="absolute bottom-4 right-4 text-sm opacity-50"
              style={{ color: slides[currentSlide].fontColor }}
            >
              Press Esc to exit | {currentSlide + 1}/{slides.length}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}