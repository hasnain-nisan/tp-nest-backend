import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Client } from './Client.entity';
import { Project } from './Project.entity';
import { User } from './User.entity';
import { ClientStakeholder } from './ClientStakeholder.entity';

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
  requestDistillation: boolean;

  @Column({ name: 'request_coaching', nullable: true })
  requestCoaching: boolean;

  @Column({ name: 'request_user_stories', nullable: true })
  requestUserStories: boolean;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;

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

  @ManyToMany(() => ClientStakeholder, (stakeholder) => stakeholder.interviews)
  @JoinTable({
    name: 'interview_stakeholders',
    joinColumn: {
      name: 'interview_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'stakeholder_id',
      referencedColumnName: 'id',
    },
  })
  stakeholders: ClientStakeholder[];
}
