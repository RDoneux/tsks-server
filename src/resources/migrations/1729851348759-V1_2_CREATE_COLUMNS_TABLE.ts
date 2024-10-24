import { MigrationInterface, QueryRunner } from 'typeorm';

export class V21CREATECOLUMNSTABLE1729851348759 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS columns (
                id VARCHAR(38) PRIMARY KEY,
                column_name VARCHAR(255) NOT NULL,
                board_id VARCHAR(38),
                
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

                FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE IF EXISTS columns
        `);
  }
}
