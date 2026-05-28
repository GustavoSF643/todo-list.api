import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1778070885278 implements MigrationInterface {
    name = 'InitialMigration1778070885278'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "permission" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_240853a0c3353c25fb12434ad33" UNIQUE ("name"), CONSTRAINT "PK_3b8b97af9d9d8807e41e6f48362" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."route_method_enum" AS ENUM('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD')`);
        await queryRunner.query(`CREATE TABLE "route" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "method" "public"."route_method_enum" NOT NULL, "path" character varying(255) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "deleted_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1050f1bce08c8eb606e1a8607d7" UNIQUE ("path"), CONSTRAINT "UQ_c1ff837dc834b88f10ad80bb3dd" UNIQUE ("method", "path"), CONSTRAINT "PK_08affcd076e46415e5821acf52d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "module" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" character varying, "module_key" character varying(255) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_620a549dbcb1fff62ea85695ca3" UNIQUE ("name"), CONSTRAINT "UQ_a159e2857f6b88bd69a074c5e2d" UNIQUE ("module_key"), CONSTRAINT "PK_0e20d657f968b051e674fbe3117" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "permission_module" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "permission_id" uuid NOT NULL, "module_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_9b0b5d512656563cef9f0236a77" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "module_route" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "module_id" uuid NOT NULL, "route_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_a19fcbce6bffc89a1127ad0bd40" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying(255) NOT NULL, "last_name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255), "two_factor_is_enabled" boolean DEFAULT false, "two_factor_secret" character varying(255), "permission_id" uuid NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "permission_module" ADD CONSTRAINT "FK_4c5f79d5a2a29f24ca0ffe335f2" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "permission_module" ADD CONSTRAINT "FK_178b158271af850f8ee5c5ccf6e" FOREIGN KEY ("module_id") REFERENCES "module"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "module_route" ADD CONSTRAINT "FK_91469a52ce7fe27d35b309c1db8" FOREIGN KEY ("module_id") REFERENCES "module"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "module_route" ADD CONSTRAINT "FK_a4320e9e0cc11729ae1ffd3b469" FOREIGN KEY ("route_id") REFERENCES "route"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_a7326749e773c740a7104634a77" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_a7326749e773c740a7104634a77"`);
        await queryRunner.query(`ALTER TABLE "module_route" DROP CONSTRAINT "FK_a4320e9e0cc11729ae1ffd3b469"`);
        await queryRunner.query(`ALTER TABLE "module_route" DROP CONSTRAINT "FK_91469a52ce7fe27d35b309c1db8"`);
        await queryRunner.query(`ALTER TABLE "permission_module" DROP CONSTRAINT "FK_178b158271af850f8ee5c5ccf6e"`);
        await queryRunner.query(`ALTER TABLE "permission_module" DROP CONSTRAINT "FK_4c5f79d5a2a29f24ca0ffe335f2"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "module_route"`);
        await queryRunner.query(`DROP TABLE "permission_module"`);
        await queryRunner.query(`DROP TABLE "module"`);
        await queryRunner.query(`DROP TABLE "route"`);
        await queryRunner.query(`DROP TYPE "public"."route_method_enum"`);
        await queryRunner.query(`DROP TABLE "permission"`);
    }

}
