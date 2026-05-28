import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { RouteMethodEnum } from "@infra/database/enums";

export class ModuleRouteResponseDto {
  @ApiProperty({
    format: "uuid",
    example: "a1b2c3d4-e5f6-4890-abcd-ef1234567890",
    readOnly: true,
  })
  id: string;

  @ApiProperty({ enum: RouteMethodEnum, example: RouteMethodEnum.GET })
  method: RouteMethodEnum;

  @ApiProperty({ example: "/users" })
  path: string;

  @ApiPropertyOptional({ example: true })
  is_active?: boolean;
}
