import { Body, Controller, Inject, Post } from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import {
  CreateSessionDto,
  SESSION_SERVICE,
  SessionResponseDto,
  type SessionServicePort,
} from "@application/sessions";

@ApiTags("sessions")
@Controller("sessions")
export class SessionsController {
  constructor(
    @Inject(SESSION_SERVICE)
    private readonly sessionService: SessionServicePort,
  ) {}

  @Post()
  @ApiOperation({ summary: "Autenticar e obter token JWT" })
  @ApiCreatedResponse({ type: SessionResponseDto })
  create(@Body() payload: CreateSessionDto): Promise<SessionResponseDto> {
    return this.sessionService.create(payload);
  }
}
