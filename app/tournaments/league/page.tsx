'use client';

import { useState } from 'react';
import { Tournament, Participant, Match } from '@/types/tournament';

interface LeaguePageProps {
  tournament: Tournament;
  onMatchUpdate: (matchId: string, scores: {score1: number, score2: number}) => void;
  isAdmin: boolean;
}

export default function LeaguePage({ tournament, onMatchUpdate, isAdmin }: LeaguePageProps) {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [matchScores, setMatchScores] = useState<{[key: string]: {score1: number, score2: number}}>({});
  
  const totalWeeks = Math.max(...tournament.matches.map(m => m.round));
  const matchesPerWeek = Math.floor(tournament.participants.length / 2);
  
  const weekMatches = tournament.matches.slice(
    (currentWeek - 1) * matchesPerWeek, 
    currentWeek * matchesPerWeek
  );

  const updateScore = (matchId: string, score1: number, score2: number) => {
    setMatchScores(prev => ({
      ...prev,
      [matchId]: { score1, score2 }
    }));
  };

  const standings = tournament.participants.map(participant => {
    const participantMatches = tournament.matches.filter(
      m => m.participant1?.id === participant.id || m.participant2?.id === participant.id
    );
    
    let played = 0, won = 0, drawn = 0, lost = 0, goalsFor = 0, goalsAgainst = 0;
    
    participantMatches.forEach(match => {
      const score = matchScores[match.id];
      if (score) {
        played++;
        const isParticipant1 = match.participant1?.id === participant.id;
        const participantScore = isParticipant1 ? score.score1 : score.score2;
        const opponentScore = isParticipant1 ? score.score2 : score.score1;
        
        goalsFor += participantScore;
        goalsAgainst += opponentScore;
        
        if (participantScore > opponentScore) won++;
        else if (participantScore === opponentScore) drawn++;
        else lost++;
      }
    });
    
    const points = won * 3 + drawn;
    
    return {
      participant,
      played,
      won,
      drawn,
      lost,
      points,
      goalsFor,
      goalsAgainst,
      goalDifference: goalsFor - goalsAgainst
    };
  }).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">League Standings</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
            disabled={currentWeek === 1}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            ←
          </button>
          <span className="px-4 py-1 font-semibold">Week {currentWeek}</span>
          <button
            onClick={() => setCurrentWeek(Math.min(totalWeeks, currentWeek + 1))}
            disabled={currentWeek === totalWeeks}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            →
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Pos</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Team</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">P</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">W</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">D</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">L</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">GF</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">GA</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">GD</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing, index) => (
              <tr key={standing.participant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{index + 1}</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">{standing.participant.name}</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">{standing.played}</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">{standing.won}</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">{standing.drawn}</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">{standing.lost}</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">{standing.goalsFor}</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">{standing.goalsAgainst}</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">{standing.goalDifference}</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-bold">{standing.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div>
        <h4 className="text-lg font-semibold mb-3">Week {currentWeek} Matches</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weekMatches.map(match => (
            <LeagueMatchCard 
              key={match.id} 
              match={match} 
              scores={matchScores[match.id] || { score1: 0, score2: 0 }}
              onScoreUpdate={isAdmin ? (score1, score2) => updateScore(match.id, score1, score2) : () => {}}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function LeagueMatchCard({ match, scores, onScoreUpdate, isAdmin }: { 
  match: Match, 
  scores: { score1: number, score2: number },
  onScoreUpdate: (score1: number, score2: number) => void,
  isAdmin: boolean 
}) {
  const [localScores, setLocalScores] = useState(scores);

  const handleScoreChange = (team: 1 | 2, value: string) => {
    const numValue = parseInt(value) || 0;
    const newScores = { ...localScores, [`score${team}`]: numValue };
    setLocalScores(newScores);
    onScoreUpdate(newScores.score1, newScores.score2);
  };

  return (
    <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">{match.participant1?.name}</span>
          {isAdmin ? (
            <input
              type="number"
              value={localScores.score1}
              onChange={(e) => handleScoreChange(1, e.target.value)}
              className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-500 rounded dark:bg-gray-600 dark:text-white"
              min="0"
            />
          ) : (
            <span className="font-bold">{localScores.score1}</span>
          )}
        </div>
        
        <div className="text-center text-gray-500 dark:text-gray-400 text-sm">VS</div>
        
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">{match.participant2?.name}</span>
          {isAdmin ? (
            <input
              type="number"
              value={localScores.score2}
              onChange={(e) => handleScoreChange(2, e.target.value)}
              className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-500 rounded dark:bg-gray-600 dark:text-white"
              min="0"
            />
          ) : (
            <span className="font-bold">{localScores.score2}</span>
          )}
        </div>
      </div>
    </div>
  );
}