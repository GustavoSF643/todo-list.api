import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UserResponseDto {
  @ApiProperty({
    format: "uuid",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  })
  id: string;

  @ApiProperty({
    format: "uuid",
    example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  })
  permission_id: string;

  @ApiProperty({ example: "João" })
  first_name: string;

  @ApiProperty({ example: "Silva" })
  last_name: string;

  @ApiProperty({ example: "joao.silva@example.com" })
  email: string;

  @ApiPropertyOptional({ example: false })
  two_factor_is_enabled?: boolean;

  @ApiPropertyOptional({ example: true })
  is_active?: boolean;

  @ApiProperty({ example: "2026-05-18T12:00:00.000Z" })
  created_at: Date;

  @ApiProperty({ example: "2026-05-18T12:00:00.000Z" })
  updated_at: Date;
}
