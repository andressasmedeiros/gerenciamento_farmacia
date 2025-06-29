import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterTableMovements1743377187520 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            "movements",
            "status",
            new TableColumn({
                name: "status",
                type: "enum",
                enum: ["PENDING", "IN_PROGRESS", "FINISHED", "DELIVERED"],
                default: "'PENDING'",
                isNullable: false,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            "movements",
            "status",
            new TableColumn({
                name: "status",
                type: "enum",
                enum: ["PENDING", "IN_PROGRESS", "FINISHED"],
                default: "'PENDING'",
                isNullable: false,
            })
        );
    }
}
