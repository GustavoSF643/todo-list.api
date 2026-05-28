import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class CreateSessionDto {
  @ApiProperty({ example: "joao.silva@example.com", maxLength: 255 })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    example: "SenhaSegura123",
    minLength: 8,
    maxLength: 64,
    format: "password",
  })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  password: string;
}
