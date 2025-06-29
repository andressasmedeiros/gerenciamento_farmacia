import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class UpdateBranchesAddressFields1751142188286 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove o campo antigo
    await queryRunner.dropColumn("branches", "full_address");

    // Adiciona novos campos como NULLABLE para evitar erro
    await queryRunner.addColumns("branches", [
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
      UPDATE branches SET
        street = 'Rua desconhecida',
        number = 'S/N',
        neighborhood = 'Bairro desconhecido',
        city = 'Cidade desconhecida',
        state = 'Estado desconhecido',
        zip_code = '00000-000'
      WHERE street IS NULL
    `);

    // Agora altera as colunas para NOT NULL
    await queryRunner.query(`ALTER TABLE branches ALTER COLUMN street SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE branches ALTER COLUMN number SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE branches ALTER COLUMN neighborhood SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE branches ALTER COLUMN city SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE branches ALTER COLUMN state SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE branches ALTER COLUMN zip_code SET NOT NULL`);

    // complement pode continuar nullable, então não altera
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverte a operação: remove os novos campos e volta o full_address
    await queryRunner.dropColumns("branches", [
      "street",
      "number",
      "neighborhood",
      "city",
      "state",
      "complement",
      "zip_code",
    ]);

    await queryRunner.addColumn(
      "branches",
      new TableColumn({
        name: "full_address",
        type: "varchar",
        length: "255",
        isNullable: false,
      })
    );
  }
}
