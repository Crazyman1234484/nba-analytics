import { Game } from '@/types'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface GamesListProps {
  games: Game[]
  selectedGameId?: string
  onGameSelect: (gameId: string) => void
  loading: boolean
}

export default function GamesList({ games, selectedGameId, onGameSelect, loading }: GamesListProps) {
  if (loading) {
    return (
      <div className="p-4 text-green-700 text-sm">
        Loading games...
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="p-4 text-green-700 text-sm">
        No games available
      </div>
    )
  }

  return (
    <div className="p-2">
      <h2 className="text-xs font-bold text-green-700 mb-2 px-2">GAMES</h2>
      {games.map((game) => (
        <button
          key={game.id}
          onClick={() => onGameSelect(game.id)}
          className={cn(
            'w-full text-left p-3 mb-2 rounded border transition-colors',
            selectedGameId === game.id
              ? 'bg-green-900/40 border-green-500'
              : 'bg-green-900/10 border-green-900/30 hover:bg-green-900/20'
          )}
        >
          <div className="text-xs text-green-700 mb-1">{formatDate(game.game_time)}</div>
          <div className="text-sm font-medium mb-1">{game.away_team.name}</div>
          <div className="text-sm font-medium mb-1">@ {game.home_team.name}</div>
          <div className="text-xs text-green-600 mt-2">
            ELO: {game.away_team.elo_rating.toFixed(0)} @ {game.home_team.elo_rating.toFixed(0)}
          </div>
        </button>
      ))}
    </div>
  )
}
