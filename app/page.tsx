'use client';

import { useState } from 'react';
import { Tournament, Participant, Match } from '@/types/tournament';
import { createEliminationBracket, createLeagueMatches } from '@/utils/bracket';
import EliminationPage from './tournaments/elimination/page';
import LeaguePage from './tournaments/league/page';

export default function TournamentApp() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const generateDummyParticipants = (count: number): Participant[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `p${i + 1}`,
      name: `Participant ${i + 1}`,
      seed: i + 1
    }));
  };

  const createTournament = (name: string, type: 'league' | 'elimination', participantCount: number) => {
    const participants = generateDummyParticipants(Math.max(participantCount, 8));
    const matches = type === 'elimination' 
      ? createEliminationBracket(participants)
      : createLeagueMatches(participants);

    const newTournament: Tournament = {
      id: `t${Date.now()}`,
      name,
      type,
      participants,
      matches,
      createdAt: new Date()
    };

    setTournaments([...tournaments, newTournament]);
    setActiveTournament(newTournament);
    setShowCreateForm(false);
  };

  const deleteTournament = (tournamentId: string) => {
    setTournaments(tournaments.filter(t => t.id !== tournamentId));
    if (activeTournament?.id === tournamentId) {
      setActiveTournament(null);
    }
  };

  const updateMatch = (matchId: string, winner: Participant) => {
    if (!activeTournament) return;

    let updatedMatches = [...activeTournament.matches];
    
    // Update the match with winner
    const matchIndex = updatedMatches.findIndex(m => m.id === matchId);
    if (matchIndex !== -1) {
      updatedMatches[matchIndex] = { ...updatedMatches[matchIndex], winner };
      
      const currentMatch = updatedMatches[matchIndex];
      
      // Find next match and advance winner
      if (currentMatch.nextMatchId) {
        const nextMatchIndex = updatedMatches.findIndex(m => m.id === currentMatch.nextMatchId);
        if (nextMatchIndex !== -1) {
          const nextMatch = updatedMatches[nextMatchIndex];
          
          // For final match, left bracket winner goes to participant1, right to participant2
          if (nextMatch.bracketPosition === 'final') {
            if (currentMatch.bracketPosition === 'left') {
              updatedMatches[nextMatchIndex] = {
                ...nextMatch,
                participant1: winner
              };
            } else if (currentMatch.bracketPosition === 'right') {
              updatedMatches[nextMatchIndex] = {
                ...nextMatch,
                participant2: winner
              };
            }
          } else {
            // For other matches, find all matches that feed into this next match from the same round and bracket
            const feedingMatches = updatedMatches.filter(m => 
              m.nextMatchId === nextMatch.id && 
              m.round === currentMatch.round &&
              m.bracketPosition === currentMatch.bracketPosition
            );
            
            // Sort by match ID to ensure consistent ordering
            feedingMatches.sort((a, b) => a.id.localeCompare(b.id));
            const currentMatchIndex = feedingMatches.findIndex(m => m.id === currentMatch.id);
            
            // Determine which slot to fill based on order
            if (currentMatchIndex === 0) {
              // First feeding match goes to participant1
              updatedMatches[nextMatchIndex] = {
                ...nextMatch,
                participant1: winner
              };
            } else if (currentMatchIndex === 1) {
              // Second feeding match goes to participant2
              updatedMatches[nextMatchIndex] = {
                ...nextMatch,
                participant2: winner
              };
            }
          }
        }
      }
    }

    const updatedTournament = {
      ...activeTournament,
      matches: updatedMatches
    };

    setActiveTournament(updatedTournament);
    setTournaments(tournaments.map(t => t.id === updatedTournament.id ? updatedTournament : t));
  };

  const updateScore = (matchId: string, score1: number, score2: number) => {
    if (!activeTournament) return;

    const match = activeTournament.matches.find(m => m.id === matchId);
    if (!match || !match.participant1 || !match.participant2) return;

    const updatedMatches = activeTournament.matches.map(m => 
      m.id === matchId 
        ? { ...m, score1, score2 }
        : m
    );

    // Auto-determine winner based on scores
    let winner: Participant | undefined;
    if (score1 > score2) {
      winner = match.participant1;
    } else if (score2 > score1) {
      winner = match.participant2;
    }

    // Update winner if determined
    if (winner) {
      const matchIndex = updatedMatches.findIndex(m => m.id === matchId);
      if (matchIndex !== -1) {
        updatedMatches[matchIndex] = { ...updatedMatches[matchIndex], winner };
        
        // Advance winner to next match
        const currentMatch = updatedMatches[matchIndex];
        if (currentMatch.nextMatchId) {
          const nextMatchIndex = updatedMatches.findIndex(m => m.id === currentMatch.nextMatchId);
          if (nextMatchIndex !== -1) {
            const nextMatch = updatedMatches[nextMatchIndex];
            
            // For final match, left bracket winner goes to participant1, right to participant2
            if (nextMatch.bracketPosition === 'final') {
              if (currentMatch.bracketPosition === 'left') {
                updatedMatches[nextMatchIndex] = {
                  ...nextMatch,
                  participant1: winner
                };
              } else if (currentMatch.bracketPosition === 'right') {
                updatedMatches[nextMatchIndex] = {
                  ...nextMatch,
                  participant2: winner
                };
              }
            } else {
              // For other matches, find all matches that feed into this next match from the same round and bracket
              const feedingMatches = updatedMatches.filter(m => 
                m.nextMatchId === nextMatch.id && 
                m.round === currentMatch.round &&
                m.bracketPosition === currentMatch.bracketPosition
              );
              
              // Sort by match ID to ensure consistent ordering
              feedingMatches.sort((a, b) => a.id.localeCompare(b.id));
              const currentMatchIndex = feedingMatches.findIndex(m => m.id === currentMatch.id);
              
              // Determine which slot to fill based on order
              if (currentMatchIndex === 0) {
                // First feeding match goes to participant1
                updatedMatches[nextMatchIndex] = {
                  ...nextMatch,
                  participant1: winner
                };
              } else if (currentMatchIndex === 1) {
                // Second feeding match goes to participant2
                updatedMatches[nextMatchIndex] = {
                  ...nextMatch,
                  participant2: winner
                };
              }
            }
          }
        }
      }
    }

    const updatedTournament = {
      ...activeTournament,
      matches: updatedMatches
    };

    setActiveTournament(updatedTournament);
    setTournaments(tournaments.map(t => t.id === updatedTournament.id ? updatedTournament : t));
  };

  const updateLeagueMatch = (matchId: string, scores: {score1: number, score2: number}) => {
    // For league matches, we just store scores - no bracket advancement
    console.log('League match updated:', matchId, scores);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Tournament Manager</h1>
          <button
            onClick={() => setIsAdmin(!isAdmin)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isAdmin 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            {isAdmin ? 'Exit Admin Mode' : 'Enter Admin Mode'}
          </button>
        </div>
        
        {isAdmin && (
          <div className="mb-8">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New Tournament
            </button>
          </div>
        )}

        {isAdmin && showCreateForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Create Tournament</h2>
            <CreateTournamentForm onCreate={createTournament} />
          </div>
        )}

        {activeTournament && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">{activeTournament.name}</h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  Type: {activeTournament.type} | Participants: {activeTournament.participants.length}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => deleteTournament(activeTournament.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors text-sm"
                  >
                    Delete Tournament
                  </button>
                )}
              </div>
            </div>
            
            {activeTournament.type === 'elimination' ? (
              <EliminationPage 
                tournament={activeTournament} 
                onMatchUpdate={isAdmin ? updateMatch : () => {}} 
                onScoreUpdate={isAdmin ? updateScore : () => {}}
                isAdmin={isAdmin}
              />
            ) : (
              <LeaguePage 
                tournament={activeTournament} 
                onMatchUpdate={isAdmin ? updateLeagueMatch : () => {}} 
                isAdmin={isAdmin}
              />
            )}
          </div>
        )}

        {!activeTournament && tournaments.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <p className="text-xl">No tournaments created yet.</p>
            <p className="mt-2">
              {isAdmin ? 'Click "Create New Tournament" to get started!' : 'Enter admin mode to create tournaments.'}
            </p>
          </div>
        )}

        {!activeTournament && tournaments.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Tournaments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tournaments.map(tournament => (
                <div key={tournament.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="cursor-pointer flex-1" onClick={() => setActiveTournament(tournament)}>
                      <h3 className="font-semibold">{tournament.name}</h3>
                      <p className="text-sm text-gray-500">{tournament.type} | {tournament.participants.length} participants</p>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => deleteTournament(tournament.id)}
                        className="ml-2 text-red-600 hover:text-red-700"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CreateTournamentForm({ onCreate }: { onCreate: (name: string, type: 'league' | 'elimination', participants: number) => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'league' | 'elimination'>('elimination');
  const [participants, setParticipants] = useState(8);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), type, participants);
      setName('');
      setParticipants(8);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tournament Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Enter tournament name"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tournament Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as 'league' | 'elimination')}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="elimination">Elimination Bracket</option>
          <option value="league">League System</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Number of Participants (min: 8)
        </label>
        <input
          type="number"
          value={participants}
          onChange={(e) => setParticipants(Math.max(8, parseInt(e.target.value) || 8))}
          min="8"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
      
      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
      >
        Create Tournament
      </button>
    </form>
  );
}