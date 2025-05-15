import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Repository } from './repository.entity';

@Entity({ name: 'images' })
@Unique(['repository_name', 'image_digest'])
export class Image {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  repository_name!: string;

  @Column()
  registry_id!: string;

  @Column()
  image_digest!: string;

  @Column()
  image_tags!: string;

  @Column()
  image_size_in_bytes!: number;

  @Column()
  image_pushed_at!: string;

  @Column()
  image_scan_status!: string;

  @Column()
  image_scan_findings_summary!: string;

  @Column()
  image_manifest_media_type!: string;

  @Column()
  artifact_media_type!: string;

  @Column({ nullable: true })
  last_recorded_pull_time!: string;

  @ManyToOne(() => Repository, (repository) => repository.images)
  @JoinColumn({
    name: 'repository_name',
    referencedColumnName: 'repository_name',
  })
  repository!: Repository;
}
