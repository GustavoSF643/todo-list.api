export interface PasswordHasher {
  hash(value: string): string;
  compare(value: string, hashedValue: string): boolean;
}
