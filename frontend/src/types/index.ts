export interface Team {
  id: number
  name: string
  elo_rating: number
  home_court_advantage: number
}

export interface Game {
  id: string
  home_team: Team
  away_team: Team
  game_time: string
  status: string
  sport: string
}

export interface OddsSnapshot {
  id: number
  game_id: string
  sportsbook: string
  moneyline_home: number | null
  moneyline_away: number | null
  spread_home: number | null
  spread_home_odds: number | null
  spread_away: number | null
  spread_away_odds: number | null
  total_line: number | null
  total_over_odds: number | null
  total_under_odds: number | null
  timestamp: string
}

export interface GameWithOdds {
  id: string
  home_team: Team
  away_team: Team
  game_time: string
  status: string
  current_odds: OddsSnapshot[]
  opening_odds: OddsSnapshot | null
  model_probability: {
    home: number
    away: number
  } | null
}
