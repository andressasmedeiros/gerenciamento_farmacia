import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class UpdateDriversAddressFields1751142882663 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove o campo antigo full_address
    await queryRunner.dropColumn("drivers", "full_address");

    // Adiciona os novos campos como NULLABLE inicialmente
    await queryRunner.addColumns("drivers", [
      new TableColumn({
        name: "street",
        type: "varchar",
        length: "100",
        isNullable: true,
      }),
      new TableColumn({
        name: "number",
        type: "varchar",
        length: "10",
        isNullable: true,
      }),
      new TableColumn({
        name: "neighborhood",
        type: "varchar",
        length: "100",
        isNullable: true,
      }),
      new TableColumn({
        name: "city",
        type: "varchar",
        length: "100",
        isNullable: true,
      }),
      new TableColumn({
        name: "state",
        type: "varchar",
        length: "50",
        isNullable: true,
      }),
      new TableColumn({
        name: "complement",
        type: "varchar",
        length: "100",
        isNullable: true,
      }),
      new TableColumn({
        name: "zip_code",
        type: "varchar",
        length: "20",
        isNullable: true,
      }),
    ]);

    // Atualiza os registros existentes com valores padrão para evitar valores nulos
    await queryRunner.query(`
      UPDATE drivers SET
        street = 'Rua desconhecida',
        number = 'S/N',
        neighborhood = 'Bairro desconhecido',
        city = 'Cidade desconhecida',
        state = 'Estado desconhecido',
        zip_code = '00000-000'
      WHERE street IS NULL
    `);

    // Agora altera as colunas para NOT NULL
    await queryRunner.query(`ALTER TABLE drivers ALTER COLUMN street SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE drivers ALTER COLUMN number SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE drivers ALTER COLUMN neighborhood SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE drivers ALTER COLUMN city SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE drivers ALTER COLUMN state SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE drivers ALTER COLUMN zip_code SET NOT NULL`);

    // complement continua nullable, então não altera
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove os novos campos
    await queryRunner.dropColumns("drivers", [
      "street",
      "number",
      "neighborhood",
      "city",
      "state",
      "complement",
      "zip_code",
    ]);

    // Volta com o campo full_address
    await queryRunner.addColumn(
      "drivers",
      new TableColumn({
        name: "full_address",
        type: "varchar",
        length: "255",
        isNullable: false,
      })
    );
  }
}
