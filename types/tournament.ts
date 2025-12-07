export interface Participant {
  id: string;
  name: string;
  seed?: number;
}

export interface Match {
  id: string;
  participant1?: Participant;
  participant2?: Participant;
  winner?: Participant;
  nextMatchId?: string;
  round: number;
  bracketPosition: 'left' | 'right' | 'final';
  score1?: number;
  score2?: number;
}

export interface Tournament {
  id: string;
  name: string;
  type: 'league' | 'elimination';
  participants: Participant[];
  matches: Match[];
  createdAt: Date;
}

export interface LeagueStanding {
  participant: Participant;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}