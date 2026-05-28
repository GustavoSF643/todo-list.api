import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, ArrayUnique, IsArray, IsUUID } from "class-validator";

export class AddModuleRoutesDto {
  @ApiProperty({
    type: [String],
    format: "uuid",
    example: ["11111111-1111-4111-8111-111111111111"],
    description: "Rotas a vincular ao módulo (sem remover vínculos existentes)",
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID("4", { each: true })
  route_ids: string[];
}
