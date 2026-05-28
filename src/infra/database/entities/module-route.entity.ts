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
import { RouteEntity } from "./route.entity";
import { ModuleEntity } from "./module.entity";

@Entity("module_route")
export class ModuleRouteEntity extends BaseEntity {
  @Column({ type: "uuid", nullable: false })
  module_id: string;

  @JoinColumn({ name: "module_id", referencedColumnName: "external_id" })
  @ManyToOne(() => ModuleEntity)
  module: ModuleEntity;

  @Column({ type: "uuid", nullable: false })
  route_id: string;

  @JoinColumn({ name: "route_id", referencedColumnName: "external_id" })
  @ManyToOne(() => RouteEntity)
  route: RouteEntity;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @DeleteDateColumn({ type: "timestamp", nullable: true })
  deleted_at?: Date;
}
