import { Participant, Match } from '@/types/tournament';

export const createEliminationBracket = (participants: Participant[]): Match[] => {
  // Calculate the next power of 2 for proper bracket
  const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(participants.length)));
  const rounds = Math.log2(nextPowerOf2);
  
  // Add byes if needed to make it a power of 2
  const byesNeeded = nextPowerOf2 - participants.length;
  const allParticipants = [...participants];
  
  // Add dummy participants for byes
  for (let i = 0; i < byesNeeded; i++) {
    allParticipants.push({
      id: `bye-${i}`,
      name: 'BYE',
      seed: undefined
    });
  }
  
  // Split participants into left and right brackets
  const halfSize = nextPowerOf2 / 2;
  const leftParticipants = allParticipants.slice(0, halfSize);
  const rightParticipants = allParticipants.slice(halfSize);

  // Create bracket structure
  const bracketStructure: { id: string; round: number; bracketPosition: 'left' | 'right' | 'final'; nextMatchId?: string }[] = [];
  let matchId = 1;
  
  // Create all matches in order
  for (let round = 1; round <= rounds; round++) {
    const matchesInRound = Math.pow(2, rounds - round);
    
    if (round === rounds) {
      // Final
      bracketStructure.push({
        id: `m${matchId++}`,
        round,
        bracketPosition: 'final'
      });
    } else {
      // Equal distribution between left and right brackets
      const matchesPerBracket = matchesInRound / 2;
      
      // Left bracket matches
      for (let i = 0; i < matchesPerBracket; i++) {
        bracketStructure.push({
          id: `m${matchId++}`,
          round,
          bracketPosition: 'left'
        });
      }
      
      // Right bracket matches
      for (let i = 0; i < matchesPerBracket; i++) {
        bracketStructure.push({
          id: `m${matchId++}`,
          round,
          bracketPosition: 'right'
        });
      }
    }
  }
  
  // Now set up nextMatchId connections
  for (let round = 1; round < rounds; round++) {
    const currentRoundMatches = bracketStructure.filter(m => m.round === round);
    const nextRoundMatches = bracketStructure.filter(m => m.round === round + 1);
    
    // Connect left bracket matches
    const leftCurrentMatches = currentRoundMatches.filter(m => m.bracketPosition === 'left');
    const leftNextMatches = nextRoundMatches.filter(m => m.bracketPosition === 'left');
    
    // Pair up left bracket matches to next round
    for (let i = 0; i < leftCurrentMatches.length; i += 2) {
      const nextMatchIndex = Math.floor(i / 2);
      if (leftNextMatches[nextMatchIndex]) {
        leftCurrentMatches[i].nextMatchId = leftNextMatches[nextMatchIndex].id;
        if (i + 1 < leftCurrentMatches.length) {
          leftCurrentMatches[i + 1].nextMatchId = leftNextMatches[nextMatchIndex].id;
        }
      }
    }
    
    // Connect right bracket matches
    const rightCurrentMatches = currentRoundMatches.filter(m => m.bracketPosition === 'right');
    const rightNextMatches = nextRoundMatches.filter(m => m.bracketPosition === 'right');
    
    // Pair up right bracket matches to next round
    for (let i = 0; i < rightCurrentMatches.length; i += 2) {
      const nextMatchIndex = Math.floor(i / 2);
      if (rightNextMatches[nextMatchIndex]) {
        rightCurrentMatches[i].nextMatchId = rightNextMatches[nextMatchIndex].id;
        if (i + 1 < rightCurrentMatches.length) {
          rightCurrentMatches[i + 1].nextMatchId = rightNextMatches[nextMatchIndex].id;
        }
      }
    }
    
    // Connect semi-finals to final
    if (round === rounds - 1) {
      const finalMatch = nextRoundMatches.find(m => m.bracketPosition === 'final');
      if (finalMatch) {
        // The winner of the last left semi-final goes to final as participant1
        if (leftCurrentMatches.length > 0) {
          leftCurrentMatches[leftCurrentMatches.length - 1].nextMatchId = finalMatch.id;
        }
        // The winner of the last right semi-final goes to final as participant2
        if (rightCurrentMatches.length > 0) {
          rightCurrentMatches[rightCurrentMatches.length - 1].nextMatchId = finalMatch.id;
        }
      }
    }
  }
  
  // Convert to Match objects and assign participants
  const finalMatches: Match[] = bracketStructure.map(structure => ({
    ...structure,
    participant1: undefined,
    participant2: undefined,
    winner: undefined,
    score1: 0,
    score2: 0
  }));

  // Assign participants to first round
  const firstRoundMatches = finalMatches.filter(m => m.round === 1);
  const leftMatches = firstRoundMatches.filter(m => m.bracketPosition === 'left');
  const rightMatches = firstRoundMatches.filter(m => m.bracketPosition === 'right');
  
  // Assign left participants (pair them sequentially)
  for (let i = 0; i < leftParticipants.length; i += 2) {
    const matchIndex = Math.floor(i / 2);
    const match = leftMatches[matchIndex];
    if (match) {
      match.participant1 = leftParticipants[i];
      if (i + 1 < leftParticipants.length) {
        match.participant2 = leftParticipants[i + 1];
      }
    }
  }
  
  // Assign right participants (pair them sequentially)
  for (let i = 0; i < rightParticipants.length; i += 2) {
    const matchIndex = Math.floor(i / 2);
    const match = rightMatches[matchIndex];
    if (match) {
      match.participant1 = rightParticipants[i];
      if (i + 1 < rightParticipants.length) {
        match.participant2 = rightParticipants[i + 1];
      }
    }
  }

  return finalMatches;
};

export const createLeagueMatches = (participants: Participant[]): Match[] => {
  const matches: Match[] = [];
  let matchId = 1;
  const weeks = participants.length - 1; // Round-robin: each team plays every other team once
  
  // Create proper round-robin schedule
  const teams = [...participants];
  
  for (let week = 1; week <= weeks; week++) {
    const usedThisWeek = new Set<string>();
    
    // Pair teams for this week - each team plays exactly once
    for (let i = 0; i < teams.length; i++) {
      if (usedThisWeek.has(teams[i].id)) continue;
      
      // Find an opponent who hasn't played this week
      for (let j = i + 1; j < teams.length; j++) {
        if (!usedThisWeek.has(teams[j].id)) {
          // Check if they've already played in previous weeks
          const alreadyPlayed = matches.some(m => 
            m.round < week && (
              (m.participant1?.id === teams[i].id && m.participant2?.id === teams[j].id) ||
              (m.participant1?.id === teams[j].id && m.participant2?.id === teams[i].id)
            )
          );
          
          if (!alreadyPlayed) {
            matches.push({
              id: `m${matchId++}`,
              participant1: teams[i],
              participant2: teams[j],
              round: week,
              bracketPosition: 'left'
            });
            
            usedThisWeek.add(teams[i].id);
            usedThisWeek.add(teams[j].id);
            break;
          }
        }
      }
    }
  }

  return matches;
};