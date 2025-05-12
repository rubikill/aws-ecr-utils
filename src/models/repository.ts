import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "repositories" })
export class Repository {
  @PrimaryColumn()
  repository_name!: string;

  @Column()
  repository_uri!: string;

  @Column()
  created_at!: string;

  @Column()
  last_updated!: string;

  @Column()
  region!: string;
}
