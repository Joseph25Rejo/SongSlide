"use client"

import { useState, useEffect } from "react"
import Button from "@/components/CustomButton"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronLeft, ChevronRight, Copy, Download, Plus, Trash2 } from "lucide-react"
import { getContrastColor } from "@/lib/utils"
import { defaultTemplates } from "@/lib/templates"
import { Slide, SlideTemplate, SavedPresentation } from "@/types"
import PresenterView from "@/components/PresenterView"
import { setupExternalWindow, updateExternalWindow } from "@/utils/presenterUtils"
import ImportPPT from "@/components/ImportPPT";

const PreviewSlide = ({ slide, label, isNextSlide = false }: { slide: Slide, label: string, isNextSlide?: boolean }) => (
  <div className="relative">
    <div className="text-sm font-medium mb-1">{label}</div>
    <div 
      className={`aspect-video rounded-lg overflow-hidden flex items-center justify-center p-4 ${isNextSlide ? 'opacity-80' : ''}`}
      style={{ background: slide.background }}
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
        className="text-center font-bold z-10 max-w-full"
        style={{
          color: slide.fontColor,
          fontSize: `${slide.fontSize}px`
        }}
        dangerouslySetInnerHTML={{ __html: slide.content }}
      />
    </div>
  </div>
)

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
  const [presenterView, setPresenterView] = useState(false)
  const [externalWindow, setExternalWindow] = useState<Window | null>(null)

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
            exitPresentation()
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isPresenting, currentSlide])

  // Add effect to update external window when slide changes
  useEffect(() => {
    if (presenterView && isPresenting) {
      updateExternalWindow(externalWindow, currentSlide, slides);
    }
  }, [currentSlide, slides, externalWindow, presenterView, isPresenting]);

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

  const updateSlideNotes = (notes: string) => {
    setSlides((prevSlides) =>
      prevSlides.map((slide, index) => {
        return index === currentSlide ? { ...slide, notes } : slide;
      })
    );
  };

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

  // Add this to your state variables near the top of the component
    const [songTitle, setSongTitle] = useState<string>("")
    
    useEffect(() => {
      const verses = lyrics.split("\n\n").filter(verse => verse.trim() !== "")
      
      // Extract song title from first line if not already set
      if (lyrics.trim() && !songTitle) {
        const firstLine = lyrics.trim().split('\n')[0];
        setSongTitle(firstLine);
      }
      
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
    }, [lyrics, globalBackground, textColor, songTitle])

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
    
    if (presenterView) {
      setupExternalWindow(setExternalWindow, showNotification, setPresenterView);
    } else {
      // Regular fullscreen presentation
      document.documentElement.requestFullscreen().catch(() => {
        showNotification("Fullscreen mode not available")
      })
    }
  }

  const exitPresentation = () => {
    setIsPresenting(false);
    if (externalWindow && !externalWindow.closed) {
      externalWindow.close();
      setExternalWindow(null);
    }
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  const getNextSlide = () => {
    if (slides.length <= 1) return null;
    const nextIndex = (currentSlide + 1) % slides.length;
    return slides[nextIndex];
  }
  
  // Add the handleImportPPT function here
  const handleImportPPT = (importedSlides: Slide[], title?: string) => {
    setSlides(importedSlides);
    setCurrentSlide(0);
    if (title) {
      setSongTitle(title);
    }
    showNotification("Presentation imported successfully!");
  };

  // Update the exportToPPT function to use the song title
  const exportToPPT = () => {
    if (slides.length === 0) {
      showNotification("No slides to export");
      return;
    }
    
    // Create HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${songTitle || "Presentation"}</title>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
          .slide { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; page-break-after: always; position: relative; }
          @media print {
            .slide { page-break-after: always; }
          }
        </style>
      </head>
      <body>
        ${slides.map(slide => `
          <div class="slide" style="background: ${slide.background};">
            ${slide.media?.type === "image" ? `<img src="${slide.media.url}" alt="Slide background" style="position: absolute; width: 100%; height: 100%; object-fit: cover;">` : ''}
            ${slide.media?.type === "video" ? `<video src="${slide.media.url}" style="position: absolute; width: 100%; height: 100%; object-fit: cover;" autoplay loop muted></video>` : ''}
            <div style="color: ${slide.fontColor}; font-size: ${slide.fontSize}px; text-align: center; max-width: 80%; z-index: 10; font-weight: bold;">
              ${slide.content}
            </div>
            <div style="position: absolute; bottom: 20px; left: 20px; font-size: 14px; opacity: 0.5; color: ${slide.fontColor};">
              IPC Gilgal
            </div>
          </div>
        `).join('')}
      </body>
      </html>
    `;
    
    // Create a blob and download link
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${songTitle || "presentation"}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification("Presentation exported successfully!");
  };

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

                {/* Import/Export Card */}
                <Card className={`bg-gray-800/50 border-gray-700 ${textColor === '#000000' ? 'text-black' : 'text-white'}`}>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Import/Export</h2>
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="presentationTitle" className={textColor === '#000000' ? 'text-black' : 'text-white'}>
                          Song Title
                        </Label>
                        <Input
                          id="presentationTitle"
                          placeholder="Enter song title"
                          value={songTitle}
                          onChange={(e) => setSongTitle(e.target.value)}
                          className={`bg-gray-700/50 border-gray-600 ${textColor === '#000000' ? 'text-black' : 'text-white'}`}
                        />
                      </div>
                      <ImportPPT 
                        onImport={handleImportPPT} 
                        onError={(message) => showNotification(message)} 
                      />
                    </div>
                  </CardContent>
                </Card>

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
                    <TabsTrigger value="notes" className="flex-1">Notes</TabsTrigger>
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
                  
                  <TabsContent value="notes" className="space-y-4">
                    <div>
                      <Label htmlFor="presenterNotes" className={textColor === '#000000' ? 'text-black' : 'text-white'}>
                        Presenter Notes
                      </Label>
                      <Textarea
                        id="presenterNotes"
                        value={slides[currentSlide]?.notes || ""}
                        onChange={(e) => updateSlideNotes(e.target.value)}
                        placeholder="Add notes for the presenter view..."
                        rows={5}
                        className={`bg-gray-700/50 border-gray-600 ${textColor === '#000000' ? 'text-black' : 'text-white'} placeholder-gray-400`}
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
                    <div className="flex items-center mr-2">
                      <Switch
                        id="presenterView"
                        checked={presenterView}
                        onCheckedChange={setPresenterView}
                        className="mr-2"
                      />
                      <Label htmlFor="presenterView" className={textColor === '#000000' ? 'text-black' : 'text-white'}>
                        Presenter View
                      </Label>
                    </div>
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
                      slide={getNextSlide()!} 
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

      {/* Presenter View Mode */}
      {isPresenting && presenterView && slides.length > 0 && (
        <PresenterView
          slides={slides}
          currentSlide={currentSlide}
          nextSlide={nextSlide}
          prevSlide={prevSlide}
          exitPresentation={exitPresentation}
          externalWindow={externalWindow}
        />
      )}

      {/* Regular Presentation Mode (keep this for non-presenter view) */}
      {isPresenting && !presenterView && slides.length > 0 && currentSlide < slides.length && (
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