import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";

import { IsSecurePassword } from "../validators/is-secure-password.validator";

export class CreateUserDto {
  @ApiProperty({
    format: "uuid",
    example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    description: "ID externo da permissão vinculada ao usuário",
  })
  @IsUUID()
  permission_id: string;

  @ApiProperty({ example: "João", maxLength: 255 })
  @IsString()
  @MaxLength(255)
  first_name: string;

  @ApiProperty({ example: "Silva", maxLength: 255 })
  @IsString()
  @MaxLength(255)
  last_name: string;

  @ApiProperty({ example: "joao.silva@example.com", maxLength: 255 })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    example: "SenhaSegura123!",
    minLength: 8,
    maxLength: 64,
    format: "password",
    description:
      "Mín. 8 caracteres: letra maiúscula, minúscula, número e caractere especial (sem espaços)",
  })
  @IsString()
  @MaxLength(64)
  @IsSecurePassword()
  password: string;

  @ApiPropertyOptional({
    example: false,
    description:
      "Quando true, o sistema gera e armazena o secret TOTP internamente",
  })
  @IsOptional()
  @IsBoolean()
  two_factor_is_enabled?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
