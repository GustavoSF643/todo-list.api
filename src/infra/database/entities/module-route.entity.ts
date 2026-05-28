import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RouteEntity } from "./route.entity";
import { ModuleEntity } from "./module.entity";

@Entity('module_route')
export class ModuleRouteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  module_id: string;

  @JoinColumn({ name: 'module_id' })
  @ManyToOne(() => ModuleEntity)
  module: ModuleEntity;

  @Column({ type: 'uuid', nullable: false })
  route_id: string;

  @JoinColumn({ name: 'route_id' })
  @ManyToOne(() => RouteEntity)
  route: RouteEntity;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at?: Date;
}