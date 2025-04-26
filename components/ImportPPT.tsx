import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slide } from "@/types";
import { Upload } from "lucide-react";
import JSZip from "jszip";

interface ImportPPTProps {
  onImport: (slides: Slide[], title?: string) => void;
  onError: (message: string) => void;
}

const ImportPPT: React.FC<ImportPPTProps> = ({ onImport, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [songTitle, setSongTitle] = useState("");

  const extractTextFromXML = (content: string) => {
    // Simple regex to extract text from XML/HTML tags
    const textMatches = content.match(/<a:t>([^<]*)<\/a:t>/g) || [];
    return textMatches
      .map(match => match.replace(/<a:t>|<\/a:t>/g, ''))
      .filter(text => text.trim() !== '')
      .join('\n');
  };

  // New function to parse HTML presentations
  const parseHTMLPresentation = async (htmlContent: string): Promise<Slide[]> => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const slideElements = doc.querySelectorAll('div[style*="page-break-after: always"]');
    
    if (slideElements.length === 0) {
      throw new Error("No slides found in the HTML file");
    }
    
    const slides: Slide[] = [];
    
    slideElements.forEach((slideElement) => {
      // Extract background
      const slideStyle = slideElement.getAttribute('style') || '';
      const backgroundMatch = slideStyle.match(/background:\s*([^;]+);/);
      const background = backgroundMatch ? backgroundMatch[1] : "linear-gradient(45deg, #1C1C1C, #663399, #B06AB3)";
      
      // Extract content div
      const contentDiv = slideElement.querySelector('div[style*="color"]');
      if (!contentDiv) return;
      
      // Extract font color and size
      const contentStyle = contentDiv.getAttribute('style') || '';
      const colorMatch = contentStyle.match(/color:\s*([^;]+);/);
      const fontColor = colorMatch ? colorMatch[1] : "#FFFFFF";
      
      const fontSizeMatch = contentStyle.match(/font-size:\s*(\d+)px/);
      const fontSize = fontSizeMatch ? parseInt(fontSizeMatch[1]) : 30;
      
      // Extract content HTML
      const content = contentDiv.innerHTML.trim();
      
      slides.push({
        content,
        background,
        fontColor,
        fontSize,
        transition: "fade",
      });
    });
    
    return slides;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      // Extract filename without extension as potential title
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      if (!songTitle) {
        setSongTitle(fileNameWithoutExt);
      }

      // Check file type and process accordingly
      if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
        // Process HTML file
        const text = await file.text();
        const slides = await parseHTMLPresentation(text);
        
        if (slides.length > 0) {
          onImport(slides, songTitle || fileNameWithoutExt);
          onError(`Imported ${slides.length} slides from HTML presentation`);
        } else {
          onError("No slides found in the HTML file");
        }
      } else if (file.name.endsWith('.pptx') || file.name.endsWith('.ppt')) {
        // Process PowerPoint file
        const arrayBuffer = await file.arrayBuffer();
        
        // Use JSZip to extract content from the PPTX file
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(arrayBuffer);
        
        const slides: Slide[] = [];
        const slidePromises: Promise<void>[] = [];
        
        // Process each slide
        zipContent.folder("ppt/slides")?.forEach((relativePath, zipEntry) => {
          if (relativePath.startsWith("slide") && relativePath.endsWith(".xml")) {
            const slidePromise = zipEntry.async("string").then(content => {
              // Extract text content from the slide XML
              const slideText = extractTextFromXML(content);
              
              // Create a slide with the extracted content
              if (slideText.trim()) {
                slides.push({
                  content: slideText.replace(/\n/g, '<br/>'),
                  background: "linear-gradient(45deg, #1C1C1C, #663399, #B06AB3)",
                  fontColor: "#FFFFFF",
                  fontSize: 30,
                  transition: "fade",
                });
              }
            });
            
            slidePromises.push(slidePromise);
          }
        });
        
        // Wait for all slides to be processed
        await Promise.all(slidePromises);
        
        // If no slides were extracted, create a fallback slide
        if (slides.length === 0) {
          slides.push({
            content: `No text content found in ${file.name}`,
            background: "linear-gradient(45deg, #1C1C1C, #663399, #B06AB3)",
            fontColor: "#FFFFFF",
            fontSize: 30,
            transition: "fade",
          });
        }
        
        // Pass the title when importing
        onImport(slides, songTitle || fileNameWithoutExt);
      } else {
        onError("Please upload a PowerPoint file (.ppt or .pptx) or HTML file (.html or .htm)");
      }
    } catch (error) {
      console.error("Error importing file:", error);
      onError(`Failed to import file: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      
      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept=".ppt,.pptx,.html,.htm"
          onChange={handleFileUpload}
          className="max-w-xs"
          disabled={isLoading}
        />
        <Button disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
      </div>
    </div>
  );
};

export default ImportPPT;