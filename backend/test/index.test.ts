import { expect } from "chai";
import { describe } from "mocha";
import supertest from "supertest";
import { app } from "../src/index.js";

describe("test suite", () => {
  it("should 404", async () => {
    const res = await supertest(app).post("/api/users").send({
      user_name: "testing",
      user_password: "testing",
    });
    expect(res.status).eq(201);
  });
});
