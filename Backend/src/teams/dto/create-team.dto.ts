export class CreateTeamDto {
  name: string;
  coach?: string;
  profileImage?: string;
  createdById: string;
  players?: string[];
}
