import { ApiProperty } from "@nestjs/swagger";

export class TodoItemResponseDto {
  @ApiProperty({ format: "uuid" })
  id: string;

  @ApiProperty({ format: "uuid" })
  todo_list_id: string;

  @ApiProperty({ example: "Comprar leite" })
  title: string;

  @ApiProperty({ example: false })
  completed: boolean;

  @ApiProperty({ example: 0 })
  position: number;

  @ApiProperty({ example: "2026-05-18T12:00:00.000Z" })
  created_at: Date;

  @ApiProperty({ example: "2026-05-18T12:00:00.000Z" })
  updated_at: Date;
}
