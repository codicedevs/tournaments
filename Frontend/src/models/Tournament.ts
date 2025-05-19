import { Phase } from "./Phase";

export interface Tournament {
  _id: string;
  name: string;
  phases?: Phase[];
  createdAt?: Date;
  updatedAt?: Date;
}
