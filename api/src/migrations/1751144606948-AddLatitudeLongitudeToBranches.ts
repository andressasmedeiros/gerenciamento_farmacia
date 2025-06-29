import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddLatitudeLongitudeToBranches1751144606948 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns("branches", [
      new TableColumn({
        name: "latitude",
        type: "double precision",
        isNullable: true,
      }),
      new TableColumn({
        name: "longitude",
        type: "double precision",
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns("branches", ["latitude", "longitude"]);
  }
}
