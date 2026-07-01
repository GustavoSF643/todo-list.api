import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from "typeorm";

import { BaseEntity } from "./base.entity";
import { TodoItemEntity } from "./todo-item.entity";
import { UserEntity } from "./user.entity";

@Entity("todo_list")
export class TodoListEntity extends BaseEntity {
  @Column({ type: "uuid", nullable: false })
  user_id: string;

  @JoinColumn({ name: "user_id", referencedColumnName: "external_id" })
  @ManyToOne(() => UserEntity)
  owner?: UserEntity;

  @Column({ type: "varchar", length: 255, nullable: false })
  title: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  description?: string;

  @Column({ type: "boolean", default: false, nullable: false })
  is_public: boolean;

  @OneToMany(() => TodoItemEntity, (item) => item.todo_list)
  items?: TodoItemEntity[];

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @DeleteDateColumn({ type: "timestamp", nullable: true })
  deleted_at?: Date;
}
