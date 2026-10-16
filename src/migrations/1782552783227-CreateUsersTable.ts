import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1782552783227 implements MigrationInterface {
  name = 'CreateUsersTable1782552783227';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("user_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "line_user_id" varchar NOT NULL, "point" integer NOT NULL DEFAULT (0), "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_5e36a5095adecf846fff3dcf475" UNIQUE ("line_user_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "donations" ("donate_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "user_id" integer NOT NULL, "line_user_id" varchar(255) NOT NULL, "points" integer NOT NULL, "status" text NOT NULL DEFAULT ('PENDING'), "external_transaction_id" varchar, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
    await queryRunner.query(
      `CREATE TABLE "receipts" ("receipt_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "user_id" integer NOT NULL, "seller" varchar, "receipt_date" varchar NOT NULL, "receipt_no" varchar NOT NULL, "amount" decimal NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
    await queryRunner.query(
      `CREATE TABLE "rewards" ("rewardId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" varchar, "points_required" integer NOT NULL, "stock" integer NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
    await queryRunner.query(
      `CREATE TABLE "redemptions" ("redemptionId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "user_id" integer NOT NULL, "reward_id" integer NOT NULL, "status" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_donations" ("donate_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "user_id" integer NOT NULL, "line_user_id" varchar(255) NOT NULL, "points" integer NOT NULL, "status" text NOT NULL DEFAULT ('PENDING'), "external_transaction_id" varchar, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_e0a522570e35074125c86d817ea" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_donations"("donate_id", "user_id", "line_user_id", "points", "status", "external_transaction_id", "created_at", "updated_at") SELECT "donate_id", "user_id", "line_user_id", "points", "status", "external_transaction_id", "created_at", "updated_at" FROM "donations"`,
    );
    await queryRunner.query(`DROP TABLE "donations"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_donations" RENAME TO "donations"`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_receipts" ("receipt_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "user_id" integer NOT NULL, "seller" varchar, "receipt_date" varchar NOT NULL, "receipt_no" varchar NOT NULL, "amount" decimal NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_6f5a711d2591ddf19f9519900e9" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_receipts"("receipt_id", "user_id", "seller", "receipt_date", "receipt_no", "amount", "created_at") SELECT "receipt_id", "user_id", "seller", "receipt_date", "receipt_no", "amount", "created_at" FROM "receipts"`,
    );
    await queryRunner.query(`DROP TABLE "receipts"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_receipts" RENAME TO "receipts"`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_redemptions" ("redemptionId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "user_id" integer NOT NULL, "reward_id" integer NOT NULL, "status" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_c59b27ed1a764e578add290572c" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_e845e4dbdf77458f29473e5e0cf" FOREIGN KEY ("reward_id") REFERENCES "rewards" ("rewardId") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_redemptions"("redemptionId", "user_id", "reward_id", "status", "created_at", "updated_at") SELECT "redemptionId", "user_id", "reward_id", "status", "created_at", "updated_at" FROM "redemptions"`,
    );
    await queryRunner.query(`DROP TABLE "redemptions"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_redemptions" RENAME TO "redemptions"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "redemptions" RENAME TO "temporary_redemptions"`,
    );
    await queryRunner.query(
      `CREATE TABLE "redemptions" ("redemptionId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "user_id" integer NOT NULL, "reward_id" integer NOT NULL, "status" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
    await queryRunner.query(
      `INSERT INTO "redemptions"("redemptionId", "user_id", "reward_id", "status", "created_at", "updated_at") SELECT "redemptionId", "user_id", "reward_id", "status", "created_at", "updated_at" FROM "temporary_redemptions"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_redemptions"`);
    await queryRunner.query(
      `ALTER TABLE "receipts" RENAME TO "temporary_receipts"`,
    );
    await queryRunner.query(
      `CREATE TABLE "receipts" ("receipt_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "user_id" integer NOT NULL, "seller" varchar, "receipt_date" varchar NOT NULL, "receipt_no" varchar NOT NULL, "amount" decimal NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
    await queryRunner.query(
      `INSERT INTO "receipts"("receipt_id", "user_id", "seller", "receipt_date", "receipt_no", "amount", "created_at") SELECT "receipt_id", "user_id", "seller", "receipt_date", "receipt_no", "amount", "created_at" FROM "temporary_receipts"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_receipts"`);
    await queryRunner.query(
      `ALTER TABLE "donations" RENAME TO "temporary_donations"`,
    );
    await queryRunner.query(
      `CREATE TABLE "donations" ("donate_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "user_id" integer NOT NULL, "line_user_id" varchar(255) NOT NULL, "points" integer NOT NULL, "status" text NOT NULL DEFAULT ('PENDING'), "external_transaction_id" varchar, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
    await queryRunner.query(
      `INSERT INTO "donations"("donate_id", "user_id", "line_user_id", "points", "status", "external_transaction_id", "created_at", "updated_at") SELECT "donate_id", "user_id", "line_user_id", "points", "status", "external_transaction_id", "created_at", "updated_at" FROM "temporary_donations"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_donations"`);
    await queryRunner.query(`DROP TABLE "redemptions"`);
    await queryRunner.query(`DROP TABLE "rewards"`);
    await queryRunner.query(`DROP TABLE "receipts"`);
    await queryRunner.query(`DROP TABLE "donations"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
