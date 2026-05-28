import {
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { BaseEntity } from "./base.entity";
import { PermissionEntity } from "./permission.entity";
import { ModuleEntity } from "./module.entity";

@Entity("permission_module")
export class PermissionModuleEntity extends BaseEntity {
  @Column({ type: "uuid", nullable: false })
  permission_id: string;

  @JoinColumn({ name: "permission_id", referencedColumnName: "external_id" })
  @ManyToOne(() => PermissionEntity)
  permission: PermissionEntity;

  @Column({ type: "uuid", nullable: false })
  module_id: string;

  @JoinColumn({ name: "module_id", referencedColumnName: "external_id" })
  @ManyToOne(() => ModuleEntity)
  module: ModuleEntity;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @DeleteDateColumn({ type: "timestamp", nullable: true })
  deleted_at?: Date;
}
