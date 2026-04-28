'use client'

import { useState, useEffect } from 'react'
import { Game, GameWithOdds } from '@/types'
import GamesList from '@/components/GamesList'
import MatchBreakdown from '@/components/MatchBreakdown'
import OddsAnalysis from '@/components/OddsAnalysis'
import SportFilter from '@/components/SportFilter'
import { RefreshCw } from 'lucide-react'

export default function Home() {
  const [games, setGames] = useState<Game[]>([])
  const [selectedGame, setSelectedGame] = useState<GameWithOdds | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [selectedSport, setSelectedSport] = useState<'basketball' | 'football'>('basketball')

  useEffect(() => {
    fetchGames()
  }, [selectedSport])

  const fetchGames = async () => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8000/api/games?sport=${selectedSport}`)
      if (!response.ok) throw new Error('Failed to fetch games')
      const data = await response.json()
      setGames(data)
      setLastUpdated(new Date())
      
      // Select first game by default
      if (data.length > 0 && !selectedGame) {
        fetchGameDetails(data[0].id)
      }
    } catch (error) {
      console.error('Error fetching games:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGameDetails = async (gameId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/games/${gameId}`)
      const data = await response.json()
      setSelectedGame(data)
    } catch (error) {
      console.error('Error fetching game details:', error)
    }
  }

  const handleGameSelect = (gameId: string) => {
    fetchGameDetails(gameId)
  }

  return (
    <div className="h-screen bg-black text-green-500 font-mono overflow-hidden">
      <header className="border-b border-green-900/30 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">BETTING <span className="text-green-700">ANALYTICS</span></h1>
          <SportFilter selectedSport={selectedSport} onSelect={setSelectedSport} />
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-xs text-green-700">
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchGames}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1 bg-green-900/20 border border-green-900/50 hover:bg-green-900/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm">REFRESH</span>
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-52px)]">
        <div className="w-1/4 border-r border-green-900/30 overflow-y-auto">
          <GamesList games={games} selectedGameId={selectedGame?.id} onGameSelect={handleGameSelect} loading={loading} />
        </div>
        
        <div className="w-1/2 border-r border-green-900/30 overflow-y-auto">
          {selectedGame ? (
            <MatchBreakdown game={selectedGame} />
          ) : (
            <div className="flex items-center justify-center h-full text-green-700">
              Select a game to view details
            </div>
          )}
        </div>
        
        <div className="w-1/4 overflow-y-auto">
          {selectedGame ? (
            <OddsAnalysis game={selectedGame} />
          ) : (
            <div className="flex items-center justify-center h-full text-green-700">
              Select a game to view odds analysis
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
