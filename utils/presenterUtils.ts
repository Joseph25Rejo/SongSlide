import React from "react";
import { Slide } from "@/types";

export const setupExternalWindow = (
  setExternalWindow: React.Dispatch<React.SetStateAction<Window | null>>,
  showNotification: (message: string) => void,
  setPresenterView: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  // Open a new window for the external display
  const newWindow = window.open('', '_blank', 'fullscreen=yes');
  if (newWindow) {
    setExternalWindow(newWindow);
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>LyricSlide Presentation</title>
        <style>
          body { margin: 0; padding: 0; overflow: hidden; }
        </style>
      </head>
      <body>
        <div id="slide-container"></div>
      </body>
      </html>
    `);
    newWindow.document.close();
  } else {
    showNotification("Could not open external window. Check popup blocker.");
    setPresenterView(false);
  }
};

export const updateExternalWindow = (
  externalWindow: Window | null,
  currentSlide: number,
  slides: Slide[]
): void => {
  if (externalWindow && !externalWindow.closed && slides.length > 0 && currentSlide < slides.length) {
    const currentSlideData = slides[currentSlide];
    if (!currentSlideData) return;
    
    const slideHTML = `
      <div style="
        height: 100vh;
        width: 100vw;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${currentSlideData.background};
        position: relative;
        padding: 40px;
        margin: 0;
        overflow: hidden;
      ">
        ${currentSlideData.media ? 
          `<${currentSlideData.media.type === 'image' ? 'img' : 'video'} 
            src="${currentSlideData.media.url}" 
            style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0;" 
            ${currentSlideData.media.type === 'video' ? 'autoplay loop muted' : ''}
          />` : ''}
        <div style="
          color: ${currentSlideData.fontColor};
          font-size: ${currentSlideData.fontSize * 1.5}px;
          text-align: center;
          z-index: 1;
          width: 100%;
        ">
          ${currentSlideData.content}
        </div>
        <div style="
          position: absolute;
          bottom: 20px;
          left: 20px;
          font-size: 14px;
          opacity: 0.5;
          color: ${currentSlideData.fontColor};
        ">
          IPC Gilgal
        </div>
      </div>
    `;
    
    externalWindow.document.body.innerHTML = slideHTML;
  }
};