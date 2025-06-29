import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity("drivers")
export class Drivers {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 100 })
    street: string;

    @Column({ type: "varchar", length: 10 })
    number: string;

    @Column({ type: "varchar", length: 100 })
    neighborhood: string;

    @Column({ type: "varchar", length: 100 })
    city: string;

    @Column({ type: "varchar", length: 50 })
    state: string;

    @Column({ type: "varchar", length: 100, nullable: true })
    complement?: string;

    @Column({ type: "varchar", length: 20 })
    zip_code: string;


    @Column({ type: "varchar", length: 30 })
    document: string;

    @Column({ default: new Date(), name: "created_at" })
    createdAt: Date;

    @Column({ default: new Date(), name: "updated_at" })
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.drivers, { onDelete: "CASCADE" })
    @JoinColumn({ name: "users_id" })
    user: User;
}
