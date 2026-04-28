def calculate_expected_score(rating_a: float, rating_b: float) -> float:
    """Calculate expected score for team A based on Elo ratings"""
    return 1 / (1 + 10 ** ((rating_b - rating_a) / 400))

def update_elo(current_elo: float, expected_score: float, actual_score: float, k_factor: float = 32) -> float:
    """Update Elo rating after a game"""
    return current_elo + k_factor * (actual_score - expected_score)

def calculate_win_probability(home_elo: float, away_elo: float, home_court_advantage: float = 3.0) -> float:
    """Calculate win probability for home team with home court advantage"""
    adjusted_home_elo = home_elo + home_court_advantage
    expected_home = calculate_expected_score(adjusted_home_elo, away_elo)
    return expected_home

def calculate_recent_form_multiplier(recent_results: list, decay_factor: float = 0.9) -> float:
    """Calculate recent form multiplier based on last N games"""
    if not recent_results:
        return 1.0
    
    weighted_score = 0
    total_weight = 0
    
    for i, result in enumerate(recent_results):
        weight = decay_factor ** i
        score = 1 if result == 'W' else 0
        weighted_score += score * weight
        total_weight += weight
    
    return weighted_score / total_weight if total_weight > 0 else 0.5
