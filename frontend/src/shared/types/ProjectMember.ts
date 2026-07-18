import { ProjectRole } from "./ProjectRole";

/** Un membru al proiectului curent (listă afișată în Setări → Partajare proiect). */
export interface ProjectMember {
  userId: string;
  username: string;
  role: ProjectRole;
}
