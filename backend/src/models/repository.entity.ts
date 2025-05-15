import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Image } from './image.entity';

@Entity('repositories')
export class Repository {
  @PrimaryColumn({ name: 'repository_name' })
  repository_name!: string;

  @Column({ name: 'repository_uri' })
  repository_uri!: string;

  @Column({ name: 'created_at' })
  created_at!: string;

  @Column({ name: 'last_updated' })
  last_updated!: string;

  @Column({ name: 'region' })
  region!: string;

  @OneToMany(() => Image, (image) => image.repository)
  images!: Image[];
}
