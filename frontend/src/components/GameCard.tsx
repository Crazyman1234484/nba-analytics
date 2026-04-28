import { GameWithOdds } from '@/types'
import { formatOdds, calculateImpliedProbability, findBestOdds } from '@/lib/utils'
import { Calendar, Clock, TrendingUp, Sparkles } from 'lucide-react'
import { useState } from 'react'

interface GameCardProps {
  game: GameWithOdds
}

export default function GameCard({ game }: GameCardProps) {
  const [activeTab, setActiveTab] = useState<'moneyline' | 'spread' | 'total'>('moneyline')

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const getBestOdds = () => {
    if (activeTab === 'moneyline' && game.current_odds.length > 0) {
      const homeOdds = game.current_odds.filter(o => o.moneyline_home !== null).map(o => ({ sportsbook: o.sportsbook, odds: o.moneyline_home! }))
      const awayOdds = game.current_odds.filter(o => o.moneyline_away !== null).map(o => ({ sportsbook: o.sportsbook, odds: o.moneyline_away! }))
      return {
        home: findBestOdds(homeOdds),
        away: findBestOdds(awayOdds)
      }
    } else if (activeTab === 'spread' && game.current_odds.length > 0) {
      const homeOdds = game.current_odds.filter(o => o.spread_home_odds !== null).map(o => ({ sportsbook: o.sportsbook, odds: o.spread_home_odds! }))
      const awayOdds = game.current_odds.filter(o => o.spread_away_odds !== null).map(o => ({ sportsbook: o.sportsbook, odds: o.spread_away_odds! }))
      return {
        home: findBestOdds(homeOdds),
        away: findBestOdds(awayOdds)
      }
    } else if (activeTab === 'total' && game.current_odds.length > 0) {
      const overOdds = game.current_odds.filter(o => o.total_over_odds !== null).map(o => ({ sportsbook: o.sportsbook, odds: o.total_over_odds! }))
      const underOdds = game.current_odds.filter(o => o.total_under_odds !== null).map(o => ({ sportsbook: o.sportsbook, odds: o.total_under_odds! }))
      return {
        over: findBestOdds(overOdds),
        under: findBestOdds(underOdds)
      }
    }
    return null
  }

  const bestOdds = getBestOdds()

  return (
    <div className="bg-green-900/10 border border-green-900/30 rounded-xl overflow-hidden">
      <div className="bg-green-900/20 px-4 py-3 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 text-xs text-green-700 mb-1">
            <Calendar className="w-3 h-3" />
            {formatDate(game.game_time)}
          </div>
          <div className="flex items-center gap-2 text-xs text-green-700">
            <Clock className="w-3 h-3" />
            {game.status.toUpperCase()}
          </div>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 bg-green-900/30 text-green-400 rounded-full text-xs">
          <Sparkles className="w-3 h-3" />
          {game.current_odds.length} Sportsbooks
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-center flex-1">
            <div className="text-lg font-bold text-green-500 mb-1">{game.away_team.name}</div>
            <div className="text-xs text-green-700">Away</div>
          </div>
          <div className="text-xl font-bold text-green-800 px-3">@</div>
          <div className="text-center flex-1">
            <div className="text-lg font-bold text-green-500 mb-1">{game.home_team.name}</div>
            <div className="text-xs text-green-700">Home</div>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('moneyline')}
            className={`flex-1 py-1 px-3 rounded transition-colors text-xs ${
              activeTab === 'moneyline'
                ? 'bg-green-600 text-white'
                : 'bg-green-900/20 text-green-400 hover:bg-green-900/30'
            }`}
          >
            Moneyline
          </button>
          <button
            onClick={() => setActiveTab('spread')}
            className={`flex-1 py-1 px-3 rounded transition-colors text-xs ${
              activeTab === 'spread'
                ? 'bg-green-600 text-white'
                : 'bg-green-900/20 text-green-400 hover:bg-green-900/30'
            }`}
          >
            Spread
          </button>
          <button
            onClick={() => setActiveTab('total')}
            className={`flex-1 py-1 px-3 rounded transition-colors text-xs ${
              activeTab === 'total'
                ? 'bg-green-600 text-white'
                : 'bg-green-900/20 text-green-400 hover:bg-green-900/30'
            }`}
          >
            Total
          </button>
        </div>

        {game.current_odds.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-green-700 border-b border-green-900/30">
                  <th className="pb-2 font-medium">Sportsbook</th>
                  <th className="pb-2 font-medium text-center">{game.away_team.name}</th>
                  <th className="pb-2 font-medium text-center">{game.home_team.name}</th>
                </tr>
              </thead>
              <tbody>
                {game.current_odds.slice(0, 3).map((odds, index) => (
                  <tr key={index} className="border-b border-green-900/20 last:border-0">
                    <td className="py-2 text-green-500 font-medium">{odds.sportsbook}</td>
                    {activeTab === 'moneyline' && (
                      <>
                        <td className="py-2 text-center">
                          <span className={`px-2 py-1 rounded ${
                            bestOdds?.away?.sportsbook === odds.sportsbook
                              ? 'bg-green-600/30 text-green-400 font-bold'
                              : 'bg-green-900/20 text-green-600'
                          }`}>
                            {formatOdds(odds.moneyline_away || 0)}
                          </span>
                        </td>
                        <td className="py-2 text-center">
                          <span className={`px-2 py-1 rounded ${
                            bestOdds?.home?.sportsbook === odds.sportsbook
                              ? 'bg-green-600/30 text-green-400 font-bold'
                              : 'bg-green-900/20 text-green-600'
                          }`}>
                            {formatOdds(odds.moneyline_home || 0)}
                          </span>
                        </td>
                      </>
                    )}
                    {activeTab === 'spread' && (
                      <>
                        <td className="py-2 text-center">
                          <span className={`px-2 py-1 rounded ${
                            bestOdds?.away?.sportsbook === odds.sportsbook
                              ? 'bg-green-600/30 text-green-400 font-bold'
                              : 'bg-green-900/20 text-green-600'
                          }`}>
                            {odds.spread_away !== null && odds.spread_away > 0 ? '+' : ''}{odds.spread_away ?? 'N/A'} ({odds.spread_away_odds !== null ? formatOdds(odds.spread_away_odds) : 'N/A'})
                          </span>
                        </td>
                        <td className="py-2 text-center">
                          <span className={`px-2 py-1 rounded ${
                            bestOdds?.home?.sportsbook === odds.sportsbook
                              ? 'bg-green-600/30 text-green-400 font-bold'
                              : 'bg-green-900/20 text-green-600'
                          }`}>
                            {odds.spread_home !== null && odds.spread_home > 0 ? '+' : ''}{odds.spread_home ?? 'N/A'} ({odds.spread_home_odds !== null ? formatOdds(odds.spread_home_odds) : 'N/A'})
                          </span>
                        </td>
                      </>
                    )}
                    {activeTab === 'total' && (
                      <td className="py-2 text-center" colSpan={2}>
                        <div className="flex justify-center gap-3">
                          <span className={`px-2 py-1 rounded ${
                            bestOdds?.over?.sportsbook === odds.sportsbook
                              ? 'bg-green-600/30 text-green-400 font-bold'
                              : 'bg-green-900/20 text-green-600'
                          }`}>
                            O {odds.total_line} ({odds.total_over_odds !== null ? formatOdds(odds.total_over_odds) : 'N/A'})
                          </span>
                          <span className={`px-2 py-1 rounded ${
                            bestOdds?.under?.sportsbook === odds.sportsbook
                              ? 'bg-green-600/30 text-green-400 font-bold'
                              : 'bg-green-900/20 text-green-600'
                          }`}>
                            U {odds.total_line} ({odds.total_under_odds !== null ? formatOdds(odds.total_under_odds) : 'N/A'})
                          </span>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-3 p-3 bg-green-900/10 rounded-lg">
          <div className="flex items-center gap-2 text-xs text-green-700 mb-1">
            <TrendingUp className="w-3 h-3" />
            Best Odds Highlighted
          </div>
          <p className="text-xs text-green-800">
            Green highlighted odds represent the best available odds across all sportsbooks.
          </p>
        </div>
      </div>
    </div>
  )
}
