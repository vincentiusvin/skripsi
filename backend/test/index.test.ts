import { expect } from "chai";
import { describe } from "mocha";
import supertest from "supertest";
import { Application } from "../src/app.js";

describe("test suite", () => {
  const app = Application.getApplication();
  it("should 404", async () => {
    const res = await supertest(app.express_server).post("/api/users").send({
      user_name: "testing",
      user_password: "testing",
    });
    expect(res.status).eq(201);
  });
});
