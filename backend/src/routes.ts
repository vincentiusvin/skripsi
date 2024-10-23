import { Application } from "./app.js";
import { Route } from "./helpers/controller.js";
import { TypesFromSchema, UnionToIntersection } from "./helpers/types";
import { ArticleController } from "./modules/article/ArticleController.js";
import { articleServiceFactory } from "./modules/article/ArticleService.js";
import { ChatController } from "./modules/chatroom/ChatroomController.js";
import { chatServiceFactory } from "./modules/chatroom/ChatroomService.js";
import { ContributionController } from "./modules/contribution/ContributionController.js";
import { contributionServiceFactory } from "./modules/contribution/ContributionService.js";
import { FriendController } from "./modules/friend/FriendController.js";
import { friendServiceFactory } from "./modules/friend/FriendService.js";
import { NotificationController } from "./modules/notification/NotificationController.js";
import { notificationServiceFactory } from "./modules/notification/NotificationService.js";
import { OrgController } from "./modules/organization/OrgController.js";
import { orgServiceFactory } from "./modules/organization/OrgService.js";
import { PreferenceController } from "./modules/preferences/PreferenceController.js";
import { preferenceServiceFactory } from "./modules/preferences/PreferenceService.js";
import { ProjectController } from "./modules/project/ProjectController.js";
import { projectServiceFactory } from "./modules/project/ProjectService.js";
import { ReportController } from "./modules/report/ReportController.js";
import { reportServiceFactory } from "./modules/report/ReportService.js";
import { SessionController } from "./modules/session/SessionController.js";
import { SuspensionController } from "./modules/suspensions/SuspensionController.js";
import { suspensionServiceFactory } from "./modules/suspensions/SuspensionService.js";
import { TaskController } from "./modules/task/TaskController.js";
import { taskServiceFactory } from "./modules/task/TaskService.js";
import { UserController } from "./modules/user/UserController.js";
import { userServiceFactory } from "./modules/user/UserService.js";

export function registerControllers(app: Application) {
  const user_service = userServiceFactory(app.db);
  const preference_service = preferenceServiceFactory(app.db);
  const notification_service = notificationServiceFactory(app.db);
  const org_service = orgServiceFactory(app.db);
  const project_service = projectServiceFactory(app.db);
  const task_service = taskServiceFactory(app.db);
  const chat_service = chatServiceFactory(app.db);
  const friend_service = friendServiceFactory(app.db);
  const contribution_service = contributionServiceFactory(app.db);
  const article_service = articleServiceFactory(app.db);
  const report_service = reportServiceFactory(app.db);
  const suspension_service = suspensionServiceFactory(app.db);

  const controllers = [
    new ChatController(app.express_server, app.socket_server, chat_service),
    new OrgController(app.express_server, org_service),
    new ProjectController(app.express_server, project_service),
    new SessionController(app.express_server, user_service, suspension_service),
    new UserController(app.express_server, user_service),
    new TaskController(app.express_server, task_service),
    new FriendController(app.express_server, friend_service),
    new ContributionController(app.express_server, contribution_service),
    new ArticleController(app.express_server, article_service),
    new NotificationController(app.express_server, notification_service),
    new ReportController(app.express_server, report_service),
    new SuspensionController(app.express_server, suspension_service),
    new PreferenceController(app.express_server, preference_service),
  ] as const;

  controllers.forEach((x) => x.register());

  return controllers;
}

type Controllers = ReturnType<typeof registerControllers>;
type Routes = UnionToIntersection<ReturnType<Controllers[number]["init"]>>;

type _api = {
  [K in keyof Routes]: Routes[K] extends Route<infer O> ? TypesFromSchema<O> : never;
};

/**
 * Export informasi type pada RequestHandler yang diregister diatas.
 * Cara pakainya dengan akses:
 * API[NamaKey]["ResBody" | "ReqBody" | "ReqParams"]
 */
export type API = {
  [K in keyof _api]: _api[K];
};
