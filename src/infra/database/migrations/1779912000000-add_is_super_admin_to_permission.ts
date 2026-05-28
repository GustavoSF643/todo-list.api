import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsSuperAdminToPermission1779912000000
  implements MigrationInterface
{
  name = "AddIsSuperAdminToPermission1779912000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "permission" ADD "is_super_admin" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "permission" DROP COLUMN "is_super_admin"`,
    );
  }
}
