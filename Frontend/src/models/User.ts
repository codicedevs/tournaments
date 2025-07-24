export enum UserRole {
  ADMIN = "Admin",
  MODERATOR = "Moderator",
  PLAYER = "Player",
  VIEWER = "Viewer",
  REFEREE = "Referee",
}

export const roleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Admin",
  [UserRole.MODERATOR]: "Coordinador",
  [UserRole.PLAYER]: "Jugador",
  [UserRole.VIEWER]: "Veedor",
  [UserRole.REFEREE]: "Árbitro",
};

export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  profilePicture?: string;
  phone?: string;
  isVerified?: boolean;
  enabled?: boolean;
}
