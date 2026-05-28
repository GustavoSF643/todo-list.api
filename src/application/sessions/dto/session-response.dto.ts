import { ApiProperty } from "@nestjs/swagger";

import { UserResponseDto } from "@application/users";

export class SessionResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    description: "JWT para uso no header Authorization: Bearer <token>",
  })
  access_token: string;

  @ApiProperty({ enum: ["Bearer"], example: "Bearer" })
  token_type: "Bearer";

  @ApiProperty({
    example: 3600,
    description: "Tempo de expiração do token em segundos",
  })
  expires_in: number;
}
