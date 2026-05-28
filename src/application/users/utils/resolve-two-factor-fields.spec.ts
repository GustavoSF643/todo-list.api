import { resolveTwoFactorFields } from "./resolve-two-factor-fields";
import * as generator from "./generate-two-factor-secret";

describe("resolveTwoFactorFields", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("disables 2FA and clears secret", () => {
    expect(
      resolveTwoFactorFields(
        { two_factor_is_enabled: false },
        { two_factor_is_enabled: true, two_factor_secret: "OLDSECRET" },
      ),
    ).toEqual({
      two_factor_is_enabled: false,
      two_factor_secret: null,
    });
  });

  it("generates secret when enabling 2FA", () => {
    jest
      .spyOn(generator, "generateTwoFactorSecret")
      .mockReturnValue("NEWSECRET");

    expect(
      resolveTwoFactorFields(
        { two_factor_is_enabled: true },
        { two_factor_is_enabled: false, two_factor_secret: null },
      ),
    ).toEqual({
      two_factor_is_enabled: true,
      two_factor_secret: "NEWSECRET",
    });
  });

  it("keeps existing secret when already enabled", () => {
    expect(
      resolveTwoFactorFields(
        {},
        { two_factor_is_enabled: true, two_factor_secret: "KEEPSECRET" },
      ),
    ).toEqual({
      two_factor_is_enabled: true,
      two_factor_secret: "KEEPSECRET",
    });
  });
});
