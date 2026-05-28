import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class PermissionResponseDto {
  @ApiProperty({
    format: "uuid",
    example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  })
  id: string;

  @ApiProperty({ example: "Administrador" })
  name: string;

  @ApiPropertyOptional({ example: true })
  is_active?: boolean;

  @ApiProperty({ example: "2026-05-18T12:00:00.000Z" })
  created_at: Date;

  @ApiProperty({ example: "2026-05-18T12:00:00.000Z" })
  updated_at: Date;
}
