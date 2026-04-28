import { Circle } from 'lucide-react'

interface SportFilterProps {
  selectedSport: 'basketball' | 'football'
  onSelect: (sport: 'basketball' | 'football') => void
}

export default function SportFilter({ selectedSport, onSelect }: SportFilterProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onSelect('basketball')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          selectedSport === 'basketball'
            ? 'bg-green-600 text-white'
            : 'bg-green-900/20 text-green-400 hover:bg-green-900/30'
        }`}
      >
        <Circle className="w-4 h-4" />
        Basketball
      </button>
      <button
        onClick={() => onSelect('football')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          selectedSport === 'football'
            ? 'bg-green-600 text-white'
            : 'bg-green-900/20 text-green-400 hover:bg-green-900/30'
        }`}
      >
        <Circle className="w-4 h-4" />
        Football
      </button>
    </div>
  )
}
