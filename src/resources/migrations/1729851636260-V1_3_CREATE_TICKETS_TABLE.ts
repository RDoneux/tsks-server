import { MigrationInterface, QueryRunner } from 'typeorm';

export class V13CREATETICKETSTABLE1729851636260 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS tickets (
                id VARCHAR(38) PRIMARY KEY,
                ticket_name VARCHAR(255) NOT NULL,
                description TEXT,
                priority ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW') NOT NULL,
                done TINYINT(1) NOT NULL DEFAULT 0,
                column_id VARCHAR(38),
                
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE IF EXISTS tickets
        `);
  }
}
