import type { Slide } from "@/types"

const SlideCustomization = ({ slide, index }: { slide: Slide; index: number }) => {
  return (
    <div>
      <h2>Slide {index + 1}</h2>
      <p>Title: {slide.title}</p>
      <p>Content: {slide.content}</p>
      {/* Add more customization options here */}
    </div>
  )
}

export default SlideCustomization

