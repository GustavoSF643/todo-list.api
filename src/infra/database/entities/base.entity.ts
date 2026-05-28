import { Column, Generated, PrimaryGeneratedColumn } from "typeorm";

export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "uuid", unique: true })
  @Generated("uuid")
  external_id: string;
}
