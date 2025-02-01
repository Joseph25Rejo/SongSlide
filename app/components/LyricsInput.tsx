import { Textarea } from "@/components/ui/textarea"

interface LyricsInputProps {
  lyrics: string
  setLyrics: (lyrics: string) => void
}

export default function LyricsInput({ lyrics, setLyrics }: LyricsInputProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Enter Lyrics</h2>
      <Textarea
        value={lyrics}
        onChange={(e) => setLyrics(e.target.value)}
        placeholder="Enter your lyrics here..."
        rows={10}
        className="w-full p-2 border rounded"
      />
    </div>
  )
}

