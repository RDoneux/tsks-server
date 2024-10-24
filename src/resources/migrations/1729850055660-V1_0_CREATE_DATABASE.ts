import { MigrationInterface, QueryRunner } from 'typeorm';

export class V10CREATEDATABASE1729850055660 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE DATABASE IF NOT EXISTS Tasks
        `);
    await queryRunner.query(`USE Tasks`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP DATABASE IF EXISTS Tasks
        `);
  }
}
