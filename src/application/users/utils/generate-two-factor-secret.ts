import { authenticator } from "otplib";

export const generateTwoFactorSecret = (): string => authenticator.generateSecret();
