export enum UserRole {
  ADMIN = "Admin",
  MODERATOR = "Moderator",
  PLAYER = "Player",
  VIEWER = "Viewer",
  REFEREE = "Referee",
}

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
