import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Project } from './Project.entity';
import { User } from './User.entity';
@Entity('configs')
@Index(['projectId', 'version'], { unique: true })
export class Config {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // project relation start
  @Column({ type: 'uuid', name: 'project_id', nullable: true })
  projectId: string;

  @ManyToOne(() => Project, (project) => project.configs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;
  // project relation end

  @Column({ type: 'int', name: 'version' })
  version: number;

  @Column({ type: 'boolean', name: 'is_latest', default: true })
  is_latest: boolean;

  // Combined Config Payload
  @Column({
    type: 'jsonb',
    name: 'config',
  })
  config: {
    client: string;
    client_code: string;
    project_name: string;
    project_desc: string;
    example1?: string;
    example2?: string;
    example3?: string;
    categories_flag: string;
    us_categories: Record<string, string>;
    custom_context?: string;
    email_confirmation: string[];
    interview_tracker_gdrive_id: string;
    interview_repository_gdrive_url?: string;
    global_repository_gdrive_url?: string;
    output_gdrive_url?: string;
    logging_output_url?: string;
  };

  @Column({ type: 'text', name: 'change_summary', nullable: true })
  change_summary?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  created_by: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updated_by: User;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;
}

// add uniuque constraint
// DROP INDEX IF EXISTS "IDX_projectId_version";

// CREATE UNIQUE INDEX idx_configs_project_version_active
// ON configs (project_id, version)
// WHERE is_deleted = false;
