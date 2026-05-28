import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class PermissionModuleResponseDto {
  @ApiProperty({
    format: "uuid",
    example: "a1b2c3d4-e5f6-4890-abcd-ef1234567890",
    readOnly: true,
  })
  id: string;

  @ApiProperty({ example: "Usuários" })
  name: string;

  @ApiPropertyOptional({
    example: "Operações relacionadas ao cadastro de usuários",
  })
  description?: string;

  @ApiProperty({ example: "USERS" })
  module_key: string;

  @ApiPropertyOptional({ example: true })
  is_active?: boolean;
}
