import { GameWithOdds } from '@/types'
import { formatOdds, americanToImplied } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useState } from 'react'

interface OddsAnalysisProps {
  game: GameWithOdds
}

export default function OddsAnalysis({ game }: OddsAnalysisProps) {
  const [activeTab, setActiveTab] = useState<'moneyline' | 'spread' | 'total'>('moneyline')

  const currentOdds = game.current_odds[0]
  const openingOdds = game.opening_odds

  // Generate mock movement data for chart
  const movementData = [
    { time: 'Open', home: openingOdds?.moneyline_home || -150, away: openingOdds?.moneyline_away || +130 },
    { time: 'Now', home: currentOdds?.moneyline_home || -150, away: currentOdds?.moneyline_away || +130 },
  ]

  const calculateMarketProbability = (odds: number | null) => {
    if (odds === null) return null
    return americanToImplied(odds) * 100
  }

  return (
    <div className="p-4">
      <h2 className="text-xs font-bold text-green-700 mb-4">ODDS & ANALYSIS</h2>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('moneyline')}
          className={`flex-1 py-2 px-3 text-xs border transition-colors ${
            activeTab === 'moneyline'
              ? 'bg-green-900/40 border-green-500'
              : 'bg-green-900/10 border-green-900/30 hover:bg-green-900/20'
          }`}
        >
          MONEYLINE
        </button>
        <button
          onClick={() => setActiveTab('spread')}
          className={`flex-1 py-2 px-3 text-xs border transition-colors ${
            activeTab === 'spread'
              ? 'bg-green-900/40 border-green-500'
              : 'bg-green-900/10 border-green-900/30 hover:bg-green-900/20'
          }`}
        >
          SPREAD
        </button>
        <button
          onClick={() => setActiveTab('total')}
          className={`flex-1 py-2 px-3 text-xs border transition-colors ${
            activeTab === 'total'
              ? 'bg-green-900/40 border-green-500'
              : 'bg-green-900/10 border-green-900/30 hover:bg-green-900/20'
          }`}
        >
          TOTAL
        </button>
      </div>

      {activeTab === 'moneyline' && currentOdds && (
        <div className="space-y-3">
          <div className="bg-green-900/10 border border-green-900/30 p-3 rounded">
            <div className="text-xs text-green-700 mb-2">CURRENT ODDS</div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">{game.away_team.name}</span>
              <span className="text-lg font-bold">{formatOdds(currentOdds.moneyline_away || 0)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">{game.home_team.name}</span>
              <span className="text-lg font-bold">{formatOdds(currentOdds.moneyline_home || 0)}</span>
            </div>
            <div className="text-xs text-green-600 mt-2 pt-2 border-t border-green-900/30">
              Sportsbook: {currentOdds.sportsbook}
            </div>
          </div>

          {openingOdds && (
            <div className="bg-green-900/10 border border-green-900/30 p-3 rounded">
              <div className="text-xs text-green-700 mb-2">OPENING ODDS</div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">{game.away_team.name}</span>
                <span className="text-sm">{formatOdds(openingOdds.moneyline_away || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{game.home_team.name}</span>
                <span className="text-sm">{formatOdds(openingOdds.moneyline_home || 0)}</span>
              </div>
            </div>
          )}

          <div className="bg-green-900/10 border border-green-900/30 p-3 rounded">
            <div className="text-xs text-green-700 mb-2">MARKET IMPLIED PROBABILITY</div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">{game.away_team.name}</span>
              <span className="text-sm font-bold">{calculateMarketProbability(currentOdds.moneyline_away)?.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">{game.home_team.name}</span>
              <span className="text-sm font-bold">{calculateMarketProbability(currentOdds.moneyline_home)?.toFixed(1)}%</span>
            </div>
          </div>

          {game.model_probability && (
            <div className="bg-green-900/10 border border-green-900/30 p-3 rounded">
              <div className="text-xs text-green-700 mb-2">MODEL VS MARKET</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-green-600">Model (Away):</span>
                  <span>{(game.model_probability.away * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Market (Away):</span>
                  <span>{calculateMarketProbability(currentOdds.moneyline_away)?.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-green-900/30">
                  <span className="text-green-600">Edge:</span>
                  <span className={Math.abs(game.model_probability.away - (calculateMarketProbability(currentOdds.moneyline_away) || 0) / 100) > 0.05 ? 'text-green-400 font-bold' : ''}>
                    {((game.model_probability.away - (calculateMarketProbability(currentOdds.moneyline_away) || 0) / 100) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'spread' && currentOdds && (
        <div className="space-y-3">
          <div className="bg-green-900/10 border border-green-900/30 p-3 rounded">
            <div className="text-xs text-green-700 mb-2">CURRENT SPREAD</div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">{game.away_team.name}</span>
              <span className="text-lg font-bold">{currentOdds.spread_away !== null && currentOdds.spread_away > 0 ? '+' : ''}{currentOdds.spread_away ?? 'N/A'} ({currentOdds.spread_away_odds !== null ? formatOdds(currentOdds.spread_away_odds) : 'N/A'})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">{game.home_team.name}</span>
              <span className="text-lg font-bold">{currentOdds.spread_home !== null && currentOdds.spread_home > 0 ? '+' : ''}{currentOdds.spread_home ?? 'N/A'} ({currentOdds.spread_home_odds !== null ? formatOdds(currentOdds.spread_home_odds) : 'N/A'})</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'total' && currentOdds && (
        <div className="space-y-3">
          <div className="bg-green-900/10 border border-green-900/30 p-3 rounded">
            <div className="text-xs text-green-700 mb-2">CURRENT TOTAL</div>
            <div className="text-center mb-2">
              <span className="text-2xl font-bold">{currentOdds.total_line}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Over</span>
              <span className="text-lg font-bold">{formatOdds(currentOdds.total_over_odds || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Under</span>
              <span className="text-lg font-bold">{formatOdds(currentOdds.total_under_odds || 0)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 bg-green-900/10 border border-green-900/30 p-3 rounded">
        <div className="text-xs font-bold text-green-700 mb-3">LINE MOVEMENT</div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={movementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#166534" />
              <XAxis dataKey="time" stroke="#22c55e" fontSize={10} />
              <YAxis stroke="#22c55e" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#14532d', border: '1px solid #166534' }}
                itemStyle={{ color: '#22c55e' }}
              />
              <Line type="monotone" dataKey="home" stroke="#22c55e" strokeWidth={2} name="Home" />
              <Line type="monotone" dataKey="away" stroke="#16a34a" strokeWidth={2} name="Away" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
