import { useState, useRef, type DragEvent } from "react"
import type { Slide } from "../components/LyricsToSlides"

interface SlideReorderProps {
  slides: Slide[]
  onReorder: (newSlides: Slide[]) => void
}

const SlideReorder: React.FC<SlideReorderProps> = ({ slides, onReorder }) => {
  const [list, setList] = useState(slides)
  const listRef = useRef<HTMLDivElement>(null)

  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData("index", index.toString())
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault()
    const draggedIndex = Number.parseInt(e.dataTransfer.getData("index"), 10)
    const newList = [...list]
    const [draggedItem] = newList.splice(draggedIndex, 1)
    newList.splice(index, 0, draggedItem)
    setList(newList)
    onReorder(newList)
  }

  return (
    <div ref={listRef} className="slide-reorder">
      {list.map((slide, index) => (
        <div
          key={slide.id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
          className="slide-reorder-item"
        >
          <p>{slide.text}</p>
        </div>
      ))}
    </div>
  )
}

export default SlideReorder

