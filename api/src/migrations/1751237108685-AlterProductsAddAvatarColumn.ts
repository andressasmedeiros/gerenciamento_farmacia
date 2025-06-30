import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterProductsAddAvatarColumn1751237108685 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Remove a coluna "url_cover"
        await queryRunner.dropColumn("products", "url_cover");

        // Adiciona a nova coluna "avatar"
        await queryRunner.addColumn(
            "products",
            new TableColumn({
                name: "avatar",
                type: "bytea",
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverte a adição da coluna "avatar"
        await queryRunner.dropColumn("products", "avatar");

        // Reverte a remoção da coluna "url_cover"
        await queryRunner.addColumn(
            "products",
            new TableColumn({
                name: "url_cover",
                type: "varchar",
                length: "200",
                isNullable: false,  // Supondo que "url_cover" não seja nulo
            })
        );
    }
}
