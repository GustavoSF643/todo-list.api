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
import { TodoListEntity } from "./todo-list.entity";

@Entity("todo_item")
export class TodoItemEntity extends BaseEntity {
  @Column({ type: "uuid", nullable: false })
  todo_list_id: string;

  @JoinColumn({ name: "todo_list_id", referencedColumnName: "external_id" })
  @ManyToOne(() => TodoListEntity, (list) => list.items)
  todo_list?: TodoListEntity;

  @Column({ type: "varchar", length: 255, nullable: false })
  title: string;

  @Column({ type: "boolean", default: false, nullable: false })
  completed: boolean;

  @Column({ type: "int", default: 0, nullable: false })
  position: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @DeleteDateColumn({ type: "timestamp", nullable: true })
  deleted_at?: Date;
}
