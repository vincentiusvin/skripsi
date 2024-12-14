import { expect } from "chai";
import { before, beforeEach, describe, it } from "mocha";
import { Application } from "../../app.js";
import { NotificationTester } from "../../test/NotificationTester.js";
import { baseCase } from "../../test/fixture_data.js";
import { APIContext, getLoginCookie } from "../../test/helpers.js";
import { clearDB } from "../../test/setup-test.js";
import { ContributionStatus } from "./ContributionMisc.js";

describe("contribution api", () => {
  let app: Application;
  let caseData: Awaited<ReturnType<typeof baseCase>>;
  before(async () => {
    app = Application.getApplication();
  });

  beforeEach(async () => {
    await clearDB(app.db);
    caseData = await baseCase(app.db);
  });

  describe("get contribution collection", () => {
    const contribution_get_cases = [
      {
        title: "should be able to get all accepted contributions",
        user_key: "plain_user",
        params: () => {
          return {
            status: "Approved",
          };
        },
        ok: true,
      },
      {
        title: "should be able to get all contributions made by self",
        user_key: "contrib_user",
        params: (context: typeof caseData) => {
          return {
            user_id: context.contrib_user.id,
          };
        },
        ok: true,
      },
      {
        title: "shouldn't be able to get all contributions made by other people",
        user_key: "plain_user",
        params: (context: typeof caseData) => {
          return {
            user_id: context.contrib_user.id,
          };
        },
        ok: false,
      },
      {
        title: "should be able to get all contributions in project as admin",
        user_key: "project_admin_user",
        params: (context: typeof caseData) => {
          return {
            project_id: context.project.id,
          };
        },
        ok: true,
      },
      {
        title: "should be able to get all contributions in project as a peer dev",
        user_key: "dev_user",
        params: (context: typeof caseData) => {
          return {
            project_id: context.project.id,
          };
        },
        ok: true,
      },
      {
        title: "shouldn't be able to get all contributions",
        user_key: "plain_user",
        params: () => {
          return {};
        },
        ok: false,
      },
    ] as const;

    for (const { title, user_key, ok, params } of contribution_get_cases) {
      it(title, async () => {
        const in_from = caseData[user_key];

        const cookie = await getLoginCookie(in_from.name, in_from.password);
        const read_req = await getContributions(params(caseData), cookie);
        await read_req.json();

        if (ok) {
          expect(read_req.status).eq(200);
        } else {
          expect(read_req.status).oneOf([400, 401, 403]);
        }
      });
    }
  });

  describe("get contribution detail", () => {
    const contribution_detail_cases = [
      {
        user: "contrib_user",
        contrib: "user_contribution",
        ok: true,
        msg: "should be able to get pending contribution as author",
      },
      {
        user: "project_admin_user",
        contrib: "user_contribution",
        ok: true,
        msg: "should be able to get pending contribution as project admin",
      },
      {
        user: "dev_user",
        contrib: "user_contribution",
        ok: true,
        msg: "should be able to get pending contribution as project dev",
      },
      {
        user: "plain_user",
        contrib: "user_contribution",
        ok: false,
        msg: "shouldn't be able to get pending contribution as other people",
      },
      {
        user: "plain_user",
        contrib: "accepted_contribution",
        ok: true,
        msg: "should be able to get accepted contribution as other people",
      },
    ] as const;

    for (const { msg, user, contrib, ok } of contribution_detail_cases) {
      it(msg, async () => {
        const in_from = caseData[user];
        const in_contrib = caseData[contrib];

        const cookie = await getLoginCookie(in_from.name, in_from.password);
        const read_req = await getContributionDetail({ contribution_id: in_contrib.id }, cookie);
        const result = await read_req.json();

        if (ok) {
          expect(read_req.status).eq(200);
          expect(result).to.deep.include(in_contrib);
        } else {
          expect(read_req.status).oneOf([401]);
        }
      });
    }
  });

  describe("add contribution", () => {
    const add_cases = [
      {
        sender_key: "dev_user",
        user_ids: ["dev_user", "plain_user"],
        msg: "should be able to add self contributions as a dev",
        ok: true,
      },
      {
        sender_key: "plain_user",
        user_ids: ["dev_user", "plain_user"],
        msg: "shouldn't be able to add contributions as a non member",
        ok: false,
      },
      {
        sender_key: "project_admin_user",
        user_ids: ["dev_user"],
        msg: "should be able to add contributions for other people as an admin",
        ok: true,
      },
      {
        sender_key: "project_admin_user",
        user_ids: ["plain_user"],
        msg: "should be able to add contributions for people not involved in the project",
        ok: true,
      },
    ] as const;

    for (const { msg, sender_key, user_ids, ok } of add_cases) {
      it(msg, async () => {
        const in_from = caseData[sender_key];
        const in_proj = caseData.project;
        const in_contrib = {
          description: "Halo",
          name: "Nama contrib",
          project_id: in_proj.id,
          user_ids: user_ids.map((x) => caseData[x].id),
        };

        const cookie = await getLoginCookie(in_from.name, in_from.password);
        const read_req = await postContributions(in_contrib, cookie);
        const result = await read_req.json();

        if (ok) {
          expect(read_req.status).eq(201);
          const { user_ids: expected_users, ...expected_output } = in_contrib;
          expect(result).to.deep.include({
            ...expected_output,
            user_ids: expected_users.map((x) => ({
              user_id: x,
            })),
          });
        } else {
          expect(read_req.status).oneOf([401]);
        }
      });
    }
  });

  describe("edit contribution", () => {
    it("should be able to update contributions", async () => {
      const in_from = caseData.contrib_user;
      const in_proj = caseData.project;
      const in_contrib = caseData.user_contribution;
      const in_contrib_update = {
        description: "Halo",
        name: "Nama contrib",
        project_id: in_proj.id,
        user_ids: [in_from.id, caseData.plain_user.id],
        status: "Pending" as const,
      };

      const cookie = await getLoginCookie(in_from.name, in_from.password);
      const read_req = await putContributions(in_contrib.id, in_contrib_update, cookie);
      const result = await read_req.json();

      expect(read_req.status).eq(200);
      const { user_ids: expected_users, ...expected_output } = in_contrib_update;
      expect(result).to.deep.include({
        ...expected_output,
        user_ids: expected_users.map((x) => ({
          user_id: x,
        })),
      });
    });

    const status_cases = [
      {
        sender_key: "contrib_user",
        msg: "shouldn't be able to self approve contribution",
        status: "Approved",
        contribution_key: "user_contribution",
        ok: false,
      },
      {
        sender_key: "project_admin_user",
        msg: "should be able to approve people's contribution as admin",
        status: "Approved",
        contribution_key: "user_contribution",
        ok: true,
      },
      {
        sender_key: "project_admin_user",
        msg: "shouldn't be able to self approve contribution even as admin",
        status: "Approved",
        contribution_key: "admin_contribution",
        ok: false,
      },
      {
        sender_key: "contrib_user",
        msg: "should be able to return contribution to pending if it's already accepted as author",
        status: "Pending",
        contribution_key: "accepted_contribution",
        ok: true,
      },
      {
        sender_key: "project_admin_user",
        msg: "shouldn't be able to approve contribution that has been accepted as admin",
        status: "Rejected",
        contribution_key: "accepted_contribution",
        ok: false,
      },
      {
        sender_key: "contrib_user",
        msg: "shouldn't be able to return contribution to pending if it's rejected",
        status: "Pending",
        contribution_key: "rejected_contribution",
        ok: false,
      },
      {
        sender_key: "project_admin_user",
        msg: "shouldn't be able to return contribution to pending as a non-author",
        status: "Pending",
        contribution_key: "accepted_contribution",
        ok: false,
      },
    ] as const;

    for (const { msg, sender_key, ok, status, contribution_key } of status_cases) {
      it(msg, async () => {
        const in_from = caseData[sender_key];
        const in_contrib = caseData[contribution_key];
        const in_contrib_update = {
          status,
        };

        const cookie = await getLoginCookie(in_from.name, in_from.password);
        const read_req = await putContributions(in_contrib.id, in_contrib_update, cookie);
        const result = await read_req.json();

        if (ok) {
          expect(read_req.status).eq(200);
          expect(result).to.deep.include(in_contrib_update);
        } else {
          expect(read_req.status).oneOf([401]);
        }
      });
    }
  });

  describe("notifications", () => {
    it("should send notification on status update", async () => {
      const in_user = caseData.contrib_user;
      const in_admin = caseData.project_admin_user;
      const in_contrib = caseData.user_contribution;
      const in_contrib_update = {
        status: "Approved",
      } as const;

      const nt = await NotificationTester.fromLoginInfo(in_user.id, in_user.name, in_user.password);
      await nt.start();
      const cookie = await getLoginCookie(in_admin.name, in_admin.password);
      const read_req = await putContributions(in_contrib.id, in_contrib_update, cookie);
      await read_req.json();
      await nt.finish();
      const diff = nt.diff();

      expect(diff.length).to.eq(1);
    });

    it("should send notification to admins when contribution becomes pending", async () => {
      const in_user = caseData.contrib_user;
      const in_admin = caseData.project_admin_user;
      const in_contrib = caseData.accepted_contribution;
      const in_contrib_update = {
        status: "Pending",
      } as const;

      const nt = await NotificationTester.fromLoginInfo(
        in_admin.id,
        in_admin.name,
        in_admin.password,
      );
      await nt.start();
      const cookie = await getLoginCookie(in_user.name, in_user.password);
      const read_req = await putContributions(in_contrib.id, in_contrib_update, cookie);
      await read_req.json();
      await nt.finish();
      const diff = nt.diff();

      expect(diff.length).to.eq(1);
    });

    it("should send notification to admins when contribution is added", async () => {
      const in_user = caseData.dev_user;
      const in_proj = caseData.project;
      const in_admin = caseData.project_admin_user;
      const in_contrib = {
        description: "Halo",
        name: "Nama contrib",
        project_id: in_proj.id,
        user_ids: [in_user.id],
      };

      const nt = await NotificationTester.fromLoginInfo(
        in_admin.id,
        in_admin.name,
        in_admin.password,
      );

      await nt.start();
      const cookie = await getLoginCookie(in_user.name, in_user.password);
      const read_req = await postContributions(in_contrib, cookie);
      await read_req.json();
      await nt.finish();
      const diff = nt.diff();

      expect(diff.length).to.eq(1);
    });
  });
});

function getContributions(
  params: { user_id?: number; project_id?: number; status?: ContributionStatus },
  cookie: string,
) {
  return new APIContext("ContributionsGet").fetch(`/api/contributions`, {
    headers: {
      cookie: cookie,
    },
    query: {
      user_id: params.user_id?.toString(),
      project_id: params.project_id?.toString(),
      status: params.status,
    },
    credentials: "include",
    method: "get",
  });
}

function postContributions(
  obj: {
    name: string;
    project_id: number;
    user_ids: number[];
    description: string;
  },
  cookie: string,
) {
  return new APIContext("ContributionsPost").fetch(`/api/contributions`, {
    headers: {
      cookie: cookie,
    },
    body: obj,
    credentials: "include",
    method: "post",
  });
}

function putContributions(
  contrib_id: number,
  obj: {
    description?: string | undefined;
    status?: "Pending" | "Approved" | "Revision" | "Rejected" | undefined;
    name?: string | undefined;
    project_id?: number | undefined;
    user_ids?: number[] | undefined;
  },
  cookie: string,
) {
  return new APIContext("ContributionsDetailPut").fetch(`/api/contributions/${contrib_id}`, {
    headers: {
      cookie: cookie,
    },
    body: obj,
    credentials: "include",
    method: "put",
  });
}

function getContributionDetail(params: { contribution_id: number }, cookie: string) {
  const { contribution_id } = params;
  return new APIContext("ContributionsDetailGet").fetch(`/api/contributions/${contribution_id}`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "get",
  });
}
