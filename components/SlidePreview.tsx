import React, { useEffect, useState } from "react"
import type { Slide } from "@/types"

interface SlidePreviewProps {
  slide: Slide;
  label?: string;
  isNextSlide?: boolean;
}

const SlidePreview: React.FC<SlidePreviewProps> = ({ slide, label, isNextSlide = false }) => {
  // Add a key to force re-render when slide changes
  const [slideKey, setSlideKey] = useState(0);
  
  useEffect(() => {
    // Update the key when slide changes to force re-render
    setSlideKey(prev => prev + 1);
  }, [slide]);

  return (
    <div className="relative">
      {label && <div className="text-sm font-medium mb-1">{label}</div>}
      <div 
        key={slideKey}
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
}

export default SlidePreview

