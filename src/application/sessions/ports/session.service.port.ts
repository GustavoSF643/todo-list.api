import { CreateSessionDto } from "../dto/create-session.dto";
import { SessionResponseDto } from "../dto/session-response.dto";

export interface SessionServicePort {
  create(payload: CreateSessionDto): Promise<SessionResponseDto>;
}
