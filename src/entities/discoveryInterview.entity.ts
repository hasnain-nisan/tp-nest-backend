import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Client } from './Client.entity';
import { ClientStakeholder } from './ClientStakeholder.entity';
import { Project } from './Project.entity';
import { User } from './User.entity';

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

  @Column({ name: 'request_distillation', nullable: true })
  requestDistillation: string;

  @Column({ name: 'request_coaching', nullable: true })
  requestCoaching: string;

  @Column({ name: 'request_user_stories', nullable: true })
  requestUserStories: string;

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
