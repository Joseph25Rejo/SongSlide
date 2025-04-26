export interface Slide {
  content: string;
  background: string;
  fontColor: string;
  fontSize: number;
  transition: string;
  title?: string; // Add optional title property
  media?: { type: "image" | "video"; url: string };
  notes?: string;
}

export interface SlideTemplate {
  name: string;
  background: string;
  fontColor: string;
  fontSize: number;
  transition: string;
}

export interface SavedPresentation {
  name: string;
  slides: Slide[];
  createdAt: string;
  lastModified: string;
}