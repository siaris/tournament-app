'use client';

import { useState } from 'react';
import { Tournament, Participant, Match } from '@/types/tournament';

interface EliminationPageProps {
  tournament: Tournament;
  onMatchUpdate: (matchId: string, winner: Participant) => void;
  onScoreUpdate: (matchId: string, score1: number, score2: number) => void;
  isAdmin: boolean;
}

export default function EliminationPage({ tournament, onMatchUpdate, onScoreUpdate, isAdmin }: EliminationPageProps) {
  const rounds = Math.max(...tournament.matches.map(m => m.round));
  const finalMatch = tournament.matches.find(m => m.bracketPosition === 'final');
  
  const getRoundName = (round: number, totalRounds: number) => {
    if (round === totalRounds) return 'Final';
    if (round === totalRounds - 1) return 'Semi Final';
    if (round === totalRounds - 2) return 'Quarter Final';
    if (round <= totalRounds - 3) return `Round ${round}`;
    return `Round ${round}`;
  };
  
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-8 min-w-max justify-center">
        {/* Left Bracket */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-4 text-center">Left Bracket</h3>
          <div className="space-y-4">
            {Array.from({ length: rounds }, (_, roundIndex) => {
              const round = roundIndex + 1;
              const roundMatches = tournament.matches.filter(m => m.round === round && m.bracketPosition === 'left');
              
              if (roundMatches.length === 0) return null;
              
              return (
                <div key={`left-${round}`} className="mb-8">
                  <h4 className="text-md font-medium mb-2">{getRoundName(round, rounds)}</h4>
                  <div className="space-y-2">
                    {roundMatches.map(match => (
                      <MatchCard key={match.id} match={match} onUpdate={onMatchUpdate} onScoreUpdate={onScoreUpdate} isAdmin={isAdmin} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Final Match */}
        {finalMatch && (
          <div className="flex items-center justify-center px-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-center">Final</h3>
              <MatchCard match={finalMatch} onUpdate={onMatchUpdate} onScoreUpdate={onScoreUpdate} isAdmin={isAdmin} />
            </div>
          </div>
        )}
        
        {/* Right Bracket */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-4 text-center">Right Bracket</h3>
          <div className="space-y-4">
            {Array.from({ length: rounds }, (_, roundIndex) => {
              const round = roundIndex + 1;
              const roundMatches = tournament.matches.filter(m => m.round === round && m.bracketPosition === 'right');
              
              if (roundMatches.length === 0) return null;
              
              return (
                <div key={`right-${round}`} className="mb-8">
                  <h4 className="text-md font-medium mb-2">{getRoundName(round, rounds)}</h4>
                  <div className="space-y-2">
                    {roundMatches.map(match => (
                      <MatchCard key={match.id} match={match} onUpdate={onMatchUpdate} onScoreUpdate={onScoreUpdate} isAdmin={isAdmin} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchCard({ match, onUpdate, onScoreUpdate, isAdmin }: { 
  match: Match, 
  onUpdate: (matchId: string, winner: Participant) => void, 
  onScoreUpdate: (matchId: string, score1: number, score2: number) => void,
  isAdmin: boolean 
}) {
  const handleScoreChange = (team: 1 | 2, value: string) => {
    const numValue = parseInt(value) || 0;
    const newScore1 = team === 1 ? numValue : (match.score1 || 0);
    const newScore2 = team === 2 ? numValue : (match.score2 || 0);
    
    onScoreUpdate(match.id, newScore1, newScore2);
  };

  const handleWinnerSelect = (winner: Participant) => {
    if (isAdmin) {
      onUpdate(match.id, winner);
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${match.winner ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
      <div className="space-y-3">
        {match.participant1 && (
          <div className="flex items-center justify-between">
            <span 
              className={`font-medium text-sm flex-1 cursor-pointer p-2 rounded transition-colors ${
                match.winner?.id === match.participant1.id 
                  ? 'bg-green-200 dark:bg-green-800' 
                  : isAdmin ? 'bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500' : 'bg-gray-50 dark:bg-gray-600'
              }`}
              onClick={() => handleWinnerSelect(match.participant1)}
            >
              {match.participant1.name}
            </span>
            {isAdmin ? (
              <input
                type="number"
                value={match.score1 || 0}
                onChange={(e) => handleScoreChange(1, e.target.value)}
                className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-500 rounded dark:bg-gray-600 dark:text-white ml-2"
                min="0"
              />
            ) : (
              <span className="font-bold ml-2">{match.score1 || 0}</span>
            )}
          </div>
        )}
        
        {match.participant1 && match.participant2 && (
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm">VS</div>
        )}
        
        {match.participant2 && (
          <div className="flex items-center justify-between">
            <span 
              className={`font-medium text-sm flex-1 cursor-pointer p-2 rounded transition-colors ${
                match.winner?.id === match.participant2.id 
                  ? 'bg-green-200 dark:bg-green-800' 
                  : isAdmin ? 'bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500' : 'bg-gray-50 dark:bg-gray-600'
              }`}
              onClick={() => handleWinnerSelect(match.participant2)}
            >
              {match.participant2.name}
            </span>
            {isAdmin ? (
              <input
                type="number"
                value={match.score2 || 0}
                onChange={(e) => handleScoreChange(2, e.target.value)}
                className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-500 rounded dark:bg-gray-600 dark:text-white ml-2"
                min="0"
              />
            ) : (
              <span className="font-bold ml-2">{match.score2 || 0}</span>
            )}
          </div>
        )}
        
        {match.winner && (
          <div className="text-sm font-semibold text-green-700 dark:text-green-400 mt-2 text-center">
            Winner: {match.winner.name}
          </div>
        )}
      </div>
    </div>
  );
}