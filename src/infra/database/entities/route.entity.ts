import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { BaseEntity } from "./base.entity";
import { RouteMethodEnum } from "../enums";

@Entity("route")
@Unique(["method", "path"])
export class RouteEntity extends BaseEntity {

  @Column({ type: "enum", enum: RouteMethodEnum, nullable: false })
  method: RouteMethodEnum;

  @Column({ type: "varchar", length: 255, nullable: false, unique: true })
  path: string;

  @Column({ type: "boolean", default: true, nullable: false })
  is_active?: boolean;

  @DeleteDateColumn({ type: "timestamp", nullable: true })
  deleted_at?: Date;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;
}
