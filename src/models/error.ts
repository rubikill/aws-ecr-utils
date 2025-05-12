import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "errors" })
export class Error {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  repository_name!: string;

  @Column()
  error_message!: string;

  @Column()
  timestamp!: string;
}
