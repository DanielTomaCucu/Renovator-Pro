import { Project } from "./Project";
import { ProjectRole } from "./ProjectRole";
import { User } from "./User";

/** Sesiunea curentă (rezultatul register/login/refresh/`GET /api/auth/me`) — expusă de `useAuth()`. */
export interface AuthSession {
  user: User;
  project: Project;
  role: ProjectRole;
}
