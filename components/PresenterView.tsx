import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  content: string;
  background: string;
  fontColor: string;
  fontSize: number;
  transition: string;
  media?: { type: "image" | "video"; url: string };
  notes?: string;
}

interface PresenterViewProps {
  slides: Slide[];
  currentSlide: number;
  nextSlide: () => void;
  prevSlide: () => void;
  exitPresentation: () => void;
  externalWindow: Window | null;
}

const PresenterView: React.FC<PresenterViewProps> = ({
  slides,
  currentSlide,
  nextSlide,
  prevSlide,
  exitPresentation,
  externalWindow
}) => {
  const getNextSlide = (): Slide | null => {
    if (slides.length <= 1) return null;
    const nextIndex = (currentSlide + 1) % slides.length;
    return slides[nextIndex];
  };

  // Get the next slide safely
  const nextSlideData = getNextSlide();

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 p-4">
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Presenter View</h2>
          <div className="text-white">Slide {currentSlide + 1} of {slides.length}</div>
          <Button 
            onClick={exitPresentation}
            className="bg-red-600 hover:bg-red-700"
          >
            Exit Presentation
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 flex-grow">
          {/* Current Slide */}
          <div className="bg-gray-800 rounded-lg p-4 flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-2">Current Slide</h3>
            <div className="flex-grow relative overflow-hidden rounded-lg">
              <div
                className="absolute inset-0 flex items-center justify-center p-4"
                style={{
                  background: slides[currentSlide]?.background || "#000000"
                }}
              >
                {slides[currentSlide]?.media?.type === "image" && (
                  <img
                    src={slides[currentSlide]?.media?.url}
                    alt="Slide background"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                {slides[currentSlide]?.media?.type === "video" && (
                  <video
                    src={slides[currentSlide]?.media?.url}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                  />
                )}
                <p
                  className="text-center font-bold z-10"
                  style={{
                    color: slides[currentSlide]?.fontColor || "#FFFFFF",
                    fontSize: `${slides[currentSlide]?.fontSize || 30}px`
                  }}
                  dangerouslySetInnerHTML={{ __html: slides[currentSlide]?.content || "" }}
                />
              </div>
            </div>
          </div>
          
          {/* Next Slide */}
          <div className="bg-gray-800 rounded-lg p-4 flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-2">Next Slide</h3>
            {nextSlideData ? (
              <div className="flex-grow relative overflow-hidden rounded-lg">
                <div
                  className="absolute inset-0 flex items-center justify-center p-4"
                  style={{
                    background: nextSlideData.background
                  }}
                >
                  {nextSlideData.media?.type === "image" && (
                    <img
                      src={nextSlideData.media.url}
                      alt="Next slide background"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  {nextSlideData.media?.type === "video" && (
                    <video
                      src={nextSlideData.media.url}
                      className="absolute inset-0 w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                    />
                  )}
                  <p
                    className="text-center font-bold z-10"
                    style={{
                      color: nextSlideData.fontColor,
                      fontSize: `${nextSlideData.fontSize}px`
                    }}
                    dangerouslySetInnerHTML={{ __html: nextSlideData.content }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-grow flex items-center justify-center bg-gray-700 rounded-lg">
                <p className="text-gray-400">No next slide</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Notes Section */}
        <div className="mt-4 bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-2">Notes</h3>
          <div className="bg-gray-700 rounded p-3 text-white min-h-[100px] max-h-[200px] overflow-y-auto">
            {slides[currentSlide]?.notes || "No notes for this slide"}
          </div>
        </div>
        
        {/* Controls */}
        <div className="mt-4 flex justify-between">
          <Button onClick={prevSlide} disabled={slides.length <= 1} className="bg-purple-600 hover:bg-purple-700">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <div className="text-white">
            Press <kbd className="px-2 py-1 bg-gray-700 rounded">←</kbd> or <kbd className="px-2 py-1 bg-gray-700 rounded">→</kbd> to navigate slides
          </div>
          <Button onClick={nextSlide} disabled={slides.length <= 1} className="bg-purple-600 hover:bg-purple-700">
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PresenterView;