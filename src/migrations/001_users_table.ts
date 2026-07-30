import { MigrationInterface, QueryRunner } from 'typeorm'

export class UsersTable1000000000000 implements MigrationInterface {
  async up(qr: QueryRunner): Promise<void> {
    await qr.query(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        phone text UNIQUE NOT NULL,
        password_hash text,
        locked_until timestamptz,
        otp_attempts integer DEFAULT 0,
        created_at timestamptz DEFAULT now()
      )
    `)
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.query(`DROP TABLE IF EXISTS users`)
  }
}
