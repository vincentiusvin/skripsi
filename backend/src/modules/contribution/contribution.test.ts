import { expect } from "chai";
import { before, beforeEach, describe, it } from "mocha";
import { Application } from "../../app.js";
import { baseCase } from "../../test/fixture_data.js";
import { APIContext, getLoginCookie } from "../../test/helpers.js";
import { clearDB } from "../../test/setup-test.js";

describe.only("contribution api", () => {
  let app: Application;
  let caseData: Awaited<ReturnType<typeof baseCase>>;
  before(async () => {
    app = Application.getApplication();
  });

  beforeEach(async () => {
    await clearDB(app);
    caseData = await baseCase(app.db);
  });

  it("should be able to get all contributions", async () => {
    const in_from = caseData.contrib_user;
    const expected_contribution = caseData.user_contribution;

    const cookie = await getLoginCookie(in_from.name, in_from.password);
    const read_req = await getContributions({}, cookie);
    const result = await read_req.json();

    expect(read_req.status).eq(200);
    const found = result.find((x) => x.id === expected_contribution.id);
    expect(found).to.not.eq(undefined);
    expect(found).to.deep.include(expected_contribution);
  });

  it("should be able to get individual contributions", async () => {
    const in_from = caseData.contrib_user;
    const in_contrib = caseData.user_contribution;

    const cookie = await getLoginCookie(in_from.name, in_from.password);
    const read_req = await getContributionDetail({ contribution_id: in_contrib.id }, cookie);
    const result = await read_req.json();

    expect(read_req.status).eq(200);
    expect(result).to.deep.include(in_contrib);
  });

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
      sender_key: "dev_user",
      user_ids: ["project_admin_user"],
      msg: "shouldn't be able to add contributions for other people as a dev",
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

  const approve_cases = [
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
  ] as const;

  for (const { msg, sender_key, ok, status, contribution_key } of approve_cases) {
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

function getContributions(params: { user_id?: number; project_id?: number }, cookie: string) {
  return new APIContext("ContributionsGet").fetch(`/api/contributions`, {
    headers: {
      cookie: cookie,
    },
    query: { user_id: params.user_id?.toString(), project_id: params.project_id?.toString() },
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
