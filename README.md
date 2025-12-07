# Tournament Manager

A modern web application for managing tournaments with support for both elimination brackets and league systems. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

### Tournament Types
- **Elimination Bracket**: Single-elimination tournaments with automatic bracket generation
- **League System**: Round-robin tournaments where each participant plays every other participant

### Key Features
- **Admin/User Modes**: Switch between admin (can create tournaments and update matches) and user (view-only) modes
- **Automatic Bracket Generation**: Creates proper tournament brackets based on participant count
- **Score Management**: Enter scores for matches with automatic winner determination
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Support**: Built-in dark mode toggle
- **Real-time Updates**: Matches update instantly with winner advancement to next rounds

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tournament-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating Tournaments

1. **Enter Admin Mode**: Click the "Enter Admin Mode" button
2. **Create Tournament**: Click "Create New Tournament" and fill in:
   - Tournament name
   - Tournament type (Elimination or League)
   - Number of participants (minimum 8)

### Managing Elimination Tournaments

- **View Bracket**: Tournaments are displayed with left and right brackets leading to a final
- **Update Scores**: As admin, enter scores for each match
- **Winner Advancement**: Winners automatically advance to the next round
- **Visual Feedback**: Completed matches are highlighted in green

### Managing League Tournaments

- **Round-Robin Schedule**: Automatic generation of match schedules
- **Score Tracking**: Enter scores for each match
- **Standings**: View league standings (feature in progress)

## Technical Details

### Bracket Generation

The elimination bracket follows the standard `2^n` structure:
- 8 participants = 3 rounds (Quarterfinals, Semifinals, Final)
- 16 participants = 4 rounds (Round of 16, Quarterfinals, Semifinals, Final)
- Byes are automatically added when participant count isn't a power of 2

### Project Structure

```
├── app/
│   ├── tournaments/
│   │   ├── elimination/    # Elimination bracket page
│   │   └── league/         # League system page
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main tournament manager
├── components/
│   └── DarkModeToggle.tsx  # Dark mode toggle component
├── types/
│   └── tournament.ts       # TypeScript type definitions
├── utils/
│   └── bracket.ts          # Bracket generation logic
└── public/                 # Static assets
```

### Key Components

- **TournamentManager**: Main application component with state management
- **EliminationPage**: Displays and manages elimination brackets
- **LeaguePage**: Displays and manages league tournaments
- **MatchCard**: Individual match component with score input

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **React Hooks**: State management and side effects

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Future Enhancements

- [ ] Double elimination brackets
- [ ] Tournament templates
- [ ] Export/import tournament data
- [ ] Participant registration system
- [ ] Match scheduling with dates/times
- [ ] Live scoring updates
- [ ] Tournament history and statistics
