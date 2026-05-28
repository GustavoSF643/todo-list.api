import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUniquePathInRouteTable1779908583827
  implements MigrationInterface
{
  name = "RemoveUniquePathInRouteTable1779908583827";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "route" DROP CONSTRAINT "UQ_c1ff837dc834b88f10ad80bb3dd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" DROP CONSTRAINT "UQ_1050f1bce08c8eb606e1a8607d7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ADD CONSTRAINT "UQ_c1ff837dc834b88f10ad80bb3dd" UNIQUE ("method", "path")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "route" DROP CONSTRAINT "UQ_c1ff837dc834b88f10ad80bb3dd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ADD CONSTRAINT "UQ_1050f1bce08c8eb606e1a8607d7" UNIQUE ("path")`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ADD CONSTRAINT "UQ_c1ff837dc834b88f10ad80bb3dd" UNIQUE ("method", "path")`,
    );
  }
}
