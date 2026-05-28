import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from "typeorm";
import { BaseEntity } from "./base.entity";
import { PermissionEntity } from "./permission.entity";

@Entity("user")
export class UserEntity extends BaseEntity {
  @Column({ type: "varchar", length: 255, nullable: false })
  first_name: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  last_name: string;

  @Column({ type: "varchar", length: 255, nullable: false, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  password?: string;

  @Column({ type: "boolean", default: false, nullable: true })
  two_factor_is_enabled?: boolean;

  @Column({ type: "varchar", length: 255, nullable: true })
  two_factor_secret?: string;

  @Column({ type: "uuid", nullable: false })
  permission_id: string;

  @JoinColumn({ name: "permission_id", referencedColumnName: "external_id" })
  @ManyToOne(() => PermissionEntity)
  permission?: PermissionEntity;

  @Column({ type: "boolean", default: true, nullable: false })
  is_active?: boolean;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @DeleteDateColumn({ type: "timestamp", nullable: true })
  deleted_at?: Date;
}
