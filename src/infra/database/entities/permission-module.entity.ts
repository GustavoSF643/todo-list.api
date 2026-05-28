import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn  } from "typeorm";
import { PermissionEntity } from "./permission.entity";
import { ModuleEntity } from "./module.entity";

@Entity('permission_module')
export class PermissionModuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  permission_id: string;

  @JoinColumn({ name: 'permission_id' })
  @ManyToOne(() => PermissionEntity)
  permission: PermissionEntity;

  @Column({ type: 'uuid', nullable: false })
  module_id: string;

  @JoinColumn({ name: 'module_id' })
  @ManyToOne(() => ModuleEntity)
  module: ModuleEntity;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at?: Date;
}