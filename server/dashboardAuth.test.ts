import { afterEach, describe, expect, it } from "vitest";
import { loginWithDashboardPassword, resetDashboardAuthAttemptsForTests } from "./dashboardAuth";

const originalPassword = process.env.DASHBOARD_PASSWORD;
const originalUsername = process.env.DASHBOARD_USERNAME;

afterEach(() => {
  if (originalPassword === undefined) delete process.env.DASHBOARD_PASSWORD;
  else process.env.DASHBOARD_PASSWORD = originalPassword;
  if (originalUsername === undefined) delete process.env.DASHBOARD_USERNAME;
  else process.env.DASHBOARD_USERNAME = originalUsername;
  resetDashboardAuthAttemptsForTests();
});

describe("dashboard owner authentication", () => {
  it("fails closed when the production secret is not configured", async () => {
    delete process.env.DASHBOARD_PASSWORD;
    const req = { headers: {}, ip: "127.0.0.1" } as any;
    const res = { cookie: () => undefined } as any;

    await expect(loginWithDashboardPassword(req, res, "owner", "not-a-password"))
      .rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });

  it("rejects invalid credentials without touching the database", async () => {
    process.env.DASHBOARD_PASSWORD = "a-long-test-password";
    process.env.DASHBOARD_USERNAME = "owner";
    const req = { headers: {}, ip: "127.0.0.1" } as any;
    const res = { cookie: () => undefined } as any;

    await expect(loginWithDashboardPassword(req, res, "owner", "wrong-password"))
      .rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
