export enum UserRole {
  ADMIN = "Admin",
  MODERATOR = "Moderator",
  PLAYER = "Player",
}

export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  profilePicture?: string;
  phone?: string;
  isVerified?: boolean;
}
