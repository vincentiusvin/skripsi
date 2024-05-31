import { expect } from "chai";
import { describe } from "mocha";
import { APIContext } from "./helpers.js";

describe("test suite", () => {
  it("should 404", async () => {
    const res = await new APIContext("UsersPost").fetch("/api/users", {
      method: "POST",
      body: {
        user_name: "testing",
        user_password: "testing",
      },
    });
    const result = await res.json();
    expect(result.msg).eq("hi");
  });
});
