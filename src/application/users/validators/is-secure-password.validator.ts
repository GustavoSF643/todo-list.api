import {
  registerDecorator,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from "class-validator";

/** Mín. 8 caracteres, maiúscula, minúscula, dígito e caractere especial (sem espaços). */
const SECURE_PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])[^\s]{8,64}$/;

@ValidatorConstraint({ name: "isSecurePassword", async: false })
export class IsSecurePasswordConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value === "string" && SECURE_PASSWORD_PATTERN.test(value);
  }

  defaultMessage(): string {
    return "A senha deve ter entre 8 e 64 caracteres, com letra maiúscula, minúscula, número e caractere especial (sem espaços).";
  }
}

export function IsSecurePassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsSecurePasswordConstraint,
    });
  };
}
