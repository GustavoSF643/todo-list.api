import { MigrationInterface, QueryRunner } from "typeorm";

export class TodoLists1780100000000 implements MigrationInterface {
  name = "TodoLists1780100000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "todo_list" ("id" SERIAL NOT NULL, "external_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "title" character varying(255) NOT NULL, "description" character varying(255), "is_public" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_todo_list_external_id" UNIQUE ("external_id"), CONSTRAINT "PK_todo_list" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "todo_item" ("id" SERIAL NOT NULL, "external_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "todo_list_id" uuid NOT NULL, "title" character varying(255) NOT NULL, "completed" boolean NOT NULL DEFAULT false, "position" integer NOT NULL DEFAULT 0, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_todo_item_external_id" UNIQUE ("external_id"), CONSTRAINT "PK_todo_item" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "todo_list" ADD CONSTRAINT "FK_todo_list_user" FOREIGN KEY ("user_id") REFERENCES "user"("external_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "todo_item" ADD CONSTRAINT "FK_todo_item_todo_list" FOREIGN KEY ("todo_list_id") REFERENCES "todo_list"("external_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "todo_item" DROP CONSTRAINT "FK_todo_item_todo_list"`,
    );
    await queryRunner.query(
      `ALTER TABLE "todo_list" DROP CONSTRAINT "FK_todo_list_user"`,
    );
    await queryRunner.query(`DROP TABLE "todo_item"`);
    await queryRunner.query(`DROP TABLE "todo_list"`);
  }
}
