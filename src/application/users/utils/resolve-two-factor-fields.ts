import { generateTwoFactorSecret } from "./generate-two-factor-secret";

type TwoFactorInput = {
  two_factor_is_enabled?: boolean;
};

type TwoFactorState = {
  two_factor_is_enabled?: boolean;
  two_factor_secret?: string | null;
};

export const resolveTwoFactorFields = (
  payload: TwoFactorInput,
  existing?: TwoFactorState,
): Pick<TwoFactorState, "two_factor_is_enabled" | "two_factor_secret"> => {
  const requestedEnabled = payload.two_factor_is_enabled;

  if (requestedEnabled === false) {
    return {
      two_factor_is_enabled: false,
      two_factor_secret: null,
    };
  }

  const enabled = requestedEnabled ?? existing?.two_factor_is_enabled ?? false;

  if (!enabled) {
    return {
      two_factor_is_enabled: false,
      two_factor_secret: null,
    };
  }

  const enablingNow =
    requestedEnabled === true && existing?.two_factor_is_enabled !== true;
  const missingSecret = !existing?.two_factor_secret;

  if (enablingNow || missingSecret) {
    return {
      two_factor_is_enabled: true,
      two_factor_secret: generateTwoFactorSecret(),
    };
  }

  return {
    two_factor_is_enabled: true,
    two_factor_secret: existing.two_factor_secret,
  };
};
