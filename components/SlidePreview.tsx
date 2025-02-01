import type { Slide } from "../components/LyricsToSlides"

interface SlidePreviewProps {
  slide: Slide
}

const SlidePreview: React.FC<SlidePreviewProps> = ({ slide }) => {
  return (
    <div>
      <h2>{slide.title}</h2>
      <p>{slide.content}</p>
    </div>
  )
}

export default SlidePreview

