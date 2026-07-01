import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

import type { JwtPayload } from "@application/auth";

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayload => {
    const request = context.switchToHttp().getRequest<Request>();
    return request["user"] as JwtPayload;
  },
);
