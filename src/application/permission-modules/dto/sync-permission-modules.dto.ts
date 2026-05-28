import { ApiProperty } from "@nestjs/swagger";
import { ArrayUnique, IsArray, IsUUID } from "class-validator";

export class SyncPermissionModulesDto {
  @ApiProperty({
    type: [String],
    format: "uuid",
    example: [
      "11111111-1111-4111-8111-111111111111",
      "22222222-2222-4222-8222-222222222222",
    ],
    description:
      "Lista completa de módulos vinculados à permissão (substitui vínculos atuais)",
  })
  @IsArray()
  @ArrayUnique()
  @IsUUID("4", { each: true })
  module_ids: string[];
}
