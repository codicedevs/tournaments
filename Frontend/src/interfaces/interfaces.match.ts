export interface Player {
  playerId: string;
  user: {
    name: string;
    email?: string;
    phone?: string;
    profilePicture?: string;
    role?: string;
    enabled?: boolean;
  };
  enabled?: boolean;
}

export interface ConfirmedPlayer {
  playerId: string;
  jerseyNumber: number;
  enableToPlay: boolean;
  name: string;
  email?: string;
  phone?: string;
  profilePicture?: string;
  teamId?: string;
}

export interface Event {
  id: string;
  type:
    | "goal"
    | "card"
    | "yellowCard"
    | "redCard"
    | "blueCard"
    | "period"
    | "system";
  team?: "home" | "away";
  player?: Player | ConfirmedPlayer;
  cardType?: "yellow" | "blue" | "red";
  minute?: number;
  description?: string;
}

export interface MatchOnProps {
  matchId: string;
  confirmedPlayers: ConfirmedPlayer[];
  onBack: (secondHalfStarted: boolean) => void;
}

export interface ConfirmTeamsProps {
  matchId?: string;
  onConfirm?: (players: any[]) => void;
  onBack?: () => void;
  soloLectura?: boolean;
}
