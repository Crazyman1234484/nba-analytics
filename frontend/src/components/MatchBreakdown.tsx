import { GameWithOdds } from '@/types'
import { formatDate } from '@/lib/utils'

interface MatchBreakdownProps {
  game: GameWithOdds
}

export default function MatchBreakdown({ game }: MatchBreakdownProps) {
  return (
    <div className="p-4">
      <h2 className="text-xs font-bold text-green-700 mb-4">MATCH BREAKDOWN</h2>
      
      <div className="mb-6">
        <div className="text-xs text-green-700 mb-2">{formatDate(game.game_time)}</div>
        <div className="text-2xl font-bold mb-4">
          {game.away_team.name} @ {game.home_team.name}
        </div>
        <div className="text-xs text-green-600 mb-4">STATUS: {game.status.toUpperCase()}</div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-900/10 border border-green-900/30 p-3 rounded">
          <div className="text-xs text-green-700 mb-1">AWAY TEAM</div>
          <div className="text-lg font-bold">{game.away_team.name}</div>
          <div className="text-xs text-green-600 mt-2">ELO: {game.away_team.elo_rating.toFixed(0)}</div>
        </div>
        <div className="bg-green-900/10 border border-green-900/30 p-3 rounded">
          <div className="text-xs text-green-700 mb-1">HOME TEAM</div>
          <div className="text-lg font-bold">{game.home_team.name}</div>
          <div className="text-xs text-green-600 mt-2">ELO: {game.home_team.elo_rating.toFixed(0)}</div>
        </div>
      </div>

      {game.model_probability && (
        <div className="bg-green-900/10 border border-green-900/30 p-4 rounded mb-6">
          <div className="text-xs font-bold text-green-700 mb-3">MODEL PROBABILITY</div>
          <div className="flex justify-between mb-2">
            <span className="text-sm">{game.away_team.name}</span>
            <span className="text-sm font-bold">{(game.model_probability.away * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-green-900/30 h-2 mb-4">
            <div 
              className="bg-green-500 h-2" 
              style={{ width: `${game.model_probability.away * 100}%` }}
            />
          </div>
          <div className="flex justify-between">
            <span className="text-sm">{game.home_team.name}</span>
            <span className="text-sm font-bold">{(game.model_probability.home * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-green-900/30 h-2">
            <div 
              className="bg-green-500 h-2" 
              style={{ width: `${game.model_probability.home * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="bg-green-900/10 border border-green-900/30 p-4 rounded">
        <div className="text-xs font-bold text-green-700 mb-3">TEAM STATS</div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-green-600">Home Court Advantage:</span>
            <span>{game.home_team.home_court_advantage.toFixed(1)} pts</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-600">ELO Difference:</span>
            <span>{(game.home_team.elo_rating - game.away_team.elo_rating).toFixed(0)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
