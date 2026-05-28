import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { UserResponseDto } from "../dto/user-response.dto";

export interface UserServicePort {
  create(payload: CreateUserDto): Promise<UserResponseDto>;
  findAll(): Promise<UserResponseDto[]>;
  findByExternalId(externalId: string): Promise<UserResponseDto>;
  update(externalId: string, payload: UpdateUserDto): Promise<UserResponseDto>;
  remove(externalId: string): Promise<void>;
}
