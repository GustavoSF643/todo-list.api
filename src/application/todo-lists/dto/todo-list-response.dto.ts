import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class TodoListOwnerDto {
  @ApiProperty({ format: "uuid" })
  id: string;

  @ApiProperty({ example: "João" })
  first_name: string;

  @ApiProperty({ example: "Silva" })
  last_name: string;
}

export class TodoListResponseDto {
  @ApiProperty({ format: "uuid" })
  id: string;

  @ApiProperty({ format: "uuid" })
  user_id: string;

  @ApiProperty({ example: "Compras da semana" })
  title: string;

  @ApiPropertyOptional({ example: "Itens do mercado" })
  description?: string;

  @ApiProperty({ example: false })
  is_public: boolean;

  @ApiPropertyOptional({ type: TodoListOwnerDto })
  owner?: TodoListOwnerDto;

  @ApiProperty({ example: "2026-05-18T12:00:00.000Z" })
  created_at: Date;

  @ApiProperty({ example: "2026-05-18T12:00:00.000Z" })
  updated_at: Date;
}
