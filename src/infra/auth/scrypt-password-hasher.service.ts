import { Injectable } from "@nestjs/common";
import { randomBytes, scryptSync } from "node:crypto";

import type { PasswordHasher } from "@application/auth";

@Injectable()
export class ScryptPasswordHasherService implements PasswordHasher {
  hash(value: string): string {
    const salt = randomBytes(16).toString("hex");
    const hashedValue = scryptSync(value, salt, 64).toString("hex");

    return `${salt}:${hashedValue}`;
  }

  compare(value: string, hashedValue: string): boolean {
    const [salt, expectedHash] = hashedValue.split(":");

    if (!salt || !expectedHash) {
      return false;
    }

    const currentHash = scryptSync(value, salt, 64).toString("hex");
    return currentHash === expectedHash;
  }
}
