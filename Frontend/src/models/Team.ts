import { User } from "./User";
import { Registration } from "./Registration";

export interface Team {
  _id: string;
  name: string;
  coach: string;
  profileImage?: string;
  createdAt?: Date;
  createdById: string | User;
  players?: string[] | User[];
  captain?: string | User;
  registrations?: Registration[];
}
