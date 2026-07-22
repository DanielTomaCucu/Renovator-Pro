import { Project } from "./Project";
import { ProjectRole } from "./ProjectRole";

/** O intrare din selectorul de proiecte (`GET /api/auth/me/projects`) — un proiect al userului curent + rolul lui pe el. */
export interface MyProject {
  project: Project;
  role: ProjectRole;
}
