"use client"

import { useState, useEffect } from "react"
import LyricsInput from "../app/components/LyricsInput"
import SlidePreview from "./SlidePreview"
import SlideCustomization from "./SlideCustomization"
import SlideReorder from "./SlideReorder"
import { Button } from "@/components/ui/button"
import pptxgen from "pptxgenjs"
import type { Slide } from "@/types"

// Remove the local Slide interface definition and use the imported one

export default function LyricsToSlides() {
  const [lyrics, setLyrics] = useState<string>("")
  const [slides, setSlides] = useState<Slide[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasExternalDisplay, setHasExternalDisplay] = useState(false)

  useEffect(() => {
    const lines = lyrics.split("\n\n").filter((line) => line.trim() !== "")
    setSlides(
      lines.map((content) => ({
        content,
        background: "linear-gradient(45deg, #FF6B6B, #4ECDC4)",
        fontColor: "#FFFFFF",
        fontSize: 44,
        transition: "fade",
      })),
    )
  }, [lyrics])

  useEffect(() => {
    const checkExternalDisplay = () => {
      if (typeof window !== "undefined" && "getScreenDetails" in window) {
        // @ts-ignore: Typescript doesn't know about getScreenDetails yet
        window
          .getScreenDetails()
          .then((screenDetails: any) => {
            setHasExternalDisplay(screenDetails.screens.length > 1)
          })
          .catch(() => {
            setHasExternalDisplay(false)
          })
      }
    }

    checkExternalDisplay()
    window.addEventListener("resize", checkExternalDisplay)

    return () => {
      window.removeEventListener("resize", checkExternalDisplay)
    }
  }, [])

  const exportToPowerPoint = () => {
    const pres = new pptxgen()

    slides.forEach((slide, index) => {
      const pptSlide = pres.addSlide()

      if (slide.background.startsWith("linear-gradient")) {
        const colors = slide.background.match(/#[A-Fa-f0-9]{6}/g) || []
        pptSlide.background = { color: colors[0] || "#FFFFFF" }
      } else if (slide.background.startsWith("http")) {
        pptSlide.background = { data: slide.background }
      }

      pptSlide.addText(slide.content, {
        x: "5%",
        y: "40%",
        w: "90%",
        h: "20%",
        align: "center",
        fontSize: slide.fontSize,
        color: slide.fontColor,
      })

      if (slide.media) {
        if (slide.media.type === "image") {
          pptSlide.addImage({ path: slide.media.url, x: 0, y: 0, w: "100%", h: "100%" })
        } else if (slide.media.type === "video") {
          pptSlide.addMedia({ type: "video", path: slide.media.url, x: 0, y: 0, w: "100%", h: "100%" })
        }
      }

      pptSlide.addText("IPC Gigal", {
        x: "85%",
        y: "90%",
        w: "15%",
        h: "10%",
        align: "right",
        fontSize: 12,
        color: "FFFFFF80",
      })
    })

    pres.writeFile({ fileName: "lyrics_presentation.pptx" })
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const elem = document.documentElement
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Lyrics to Slides</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <LyricsInput lyrics={lyrics} setLyrics={setLyrics} />
          {slides.map((slide, index) => (
            <SlideCustomization key={index} slide={slide} index={index} />
          ))}
        </div>
        <div>
          <SlidePreview slide={slides[0]} />
          <SlideReorder slides={slides} setSlides={setSlides} />
          <div className="mt-4 space-x-2">
            <Button onClick={exportToPowerPoint}>Export to PowerPoint</Button>
            {hasExternalDisplay && (
              <Button onClick={toggleFullscreen}>
                {isFullscreen ? "Exit Fullscreen" : "Show on External Display"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

