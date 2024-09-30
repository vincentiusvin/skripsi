import { Application } from "./app.js";
import { Route } from "./helpers/controller.js";
import { ExtractRH, UnionToIntersection } from "./helpers/types";
import { ChatController } from "./modules/chatroom/ChatroomController.js";
import { ChatRepository } from "./modules/chatroom/ChatroomRepository.js";
import { ChatService } from "./modules/chatroom/ChatroomService.js";
import { ContributionController } from "./modules/contribution/ContributionController.js";
import { ContributionRepository } from "./modules/contribution/ContributionRepository.js";
import { ContributionService } from "./modules/contribution/ContributionService.js";
import { EmailService } from "./modules/email/EmailService.js";
import { FriendController } from "./modules/friend/FriendController.js";
import { FriendRepository } from "./modules/friend/FriendRepository.js";
import { FriendService } from "./modules/friend/FriendService.js";
import { NotificationController } from "./modules/notification/NotificationController.js";
import { NotificationRepository } from "./modules/notification/NotificationRepository.js";
import { NotificationService } from "./modules/notification/NotificationService.js";
import { OrgController } from "./modules/organization/OrgController.js";
import { OrgRepository } from "./modules/organization/OrgRepository.js";
import { OrgService } from "./modules/organization/OrgService.js";
import { ProjectController } from "./modules/project/ProjectController.js";
import { ProjectRepository } from "./modules/project/ProjectRepository.js";
import { ProjectService } from "./modules/project/ProjectService.js";
import { SessionController } from "./modules/session/SessionController.js";
import { TaskController } from "./modules/task/TaskController.js";
import { TaskRepository } from "./modules/task/TaskRepository.js";
import { TaskService } from "./modules/task/TaskService.js";
import { UserController } from "./modules/user/UserController.js";
import { UserRepository } from "./modules/user/UserRepository.js";
import { UserService } from "./modules/user/UserService.js";

export function registerControllers(app: Application) {
  const notification_repo = new NotificationRepository(app.db);
  const org_repo = new OrgRepository(app.db);
  const chat_repo = new ChatRepository(app.db);
  const task_repo = new TaskRepository(app.db);
  const project_repo = new ProjectRepository(app.db);
  const user_repo = new UserRepository(app.db);
  const friend_repo = new FriendRepository(app.db);
  const contribution_repo = new ContributionRepository(app.db);

  const user_service = new UserService(user_repo);
  const email_service = EmailService.fromEnv();
  const notification_service = new NotificationService(
    notification_repo,
    email_service,
    user_service,
  );
  const org_service = new OrgService(org_repo, notification_service, user_service);
  const project_service = new ProjectService(
    project_repo,
    org_service,
    notification_service,
    user_service,
  );
  const task_service = new TaskService(task_repo, project_service);
  const chat_service = new ChatService(chat_repo, project_service);
  const friend_service = new FriendService(friend_repo);
  const contribution_service = new ContributionService(contribution_repo);

  const controllers = [
    new ChatController(app.express_server, app.socket_server, chat_service),
    new OrgController(app.express_server, org_service),
    new ProjectController(app.express_server, project_service),
    new SessionController(app.express_server, app.db),
    new UserController(app.express_server, user_service),
    new TaskController(app.express_server, task_service),
    new FriendController(app.express_server, friend_service),
    new ContributionController(app.express_server, contribution_service),
    new NotificationController(app.express_server, notification_service),
  ] as const;

  controllers.forEach((x) => x.register());

  return controllers;
}

type Controllers = ReturnType<typeof registerControllers>;
type Routes = UnionToIntersection<ReturnType<Controllers[number]["init"]>>;

type _api = {
  [K in keyof Routes]: Routes[K] extends Route<infer O> ? O : never;
};

/**
 * Export informasi type pada RequestHandler yang diregister diatas.
 * Cara pakainya dengan akses:
 * API[NamaKey]["ResBody" | "ReqBody" | "ReqParams"]
 */
export type API = {
  [K in keyof _api]: ExtractRH<_api[K]>;
};
