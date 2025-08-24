import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Client } from './client.entity';
import { ClientStakeholder } from './clientStakeholder.entity';
import { Project } from './project.entity';
import { User } from './user.entity';

@Entity('discovery_interview')
export class Interview {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'date', type: 'timestamp' })
  date: Date;

  @Column({ name: 'gdrive_id', nullable: true })
  gDriveId: string;

  @Column({ name: 'request_distillation', default: false })
  requestDistillation: boolean;

  @Column({ name: 'request_coaching', default: false })
  requestCoaching: boolean;

  @Column({ name: 'request_user_stories', default: false })
  requestUserStories: boolean;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne(() => ClientStakeholder)
  @JoinColumn({ name: 'stakeholder_id' })
  stakeholder: ClientStakeholder;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  updatedBy: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;
}
