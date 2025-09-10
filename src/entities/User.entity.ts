import { Exclude } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'email', unique: true })
  email: string;

  @Exclude()
  @Column({ name: 'password' })
  password: string;

  @Column({
    name: 'role',
    type: 'enum',
    enum: ['SuperAdmin', 'Admin', 'InterviewUser'], // Added InterviewUser
  })
  role: 'SuperAdmin' | 'Admin' | 'InterviewUser';

  @Column('jsonb', { name: 'access_scopes', nullable: true })
  accessScopes: {
    // User Management
    canAccessUsers?: boolean;
    canCreateUsers?: boolean;
    canUpdateUsers?: boolean;
    canDeleteUsers?: boolean;

    // Client Management
    canAccessClients?: boolean;
    canCreateClients?: boolean;
    canUpdateClients?: boolean;
    canDeleteClients?: boolean;

    // Stakeholder Management
    canAccessStakeholders?: boolean;
    canCreateStakeholders?: boolean;
    canUpdateStakeholders?: boolean;
    canDeleteStakeholders?: boolean;

    // Project Management
    canAccessProjects?: boolean;
    canCreateProjects?: boolean;
    canUpdateProjects?: boolean;
    canDeleteProjects?: boolean;

    // Interview Management
    canAccessInterviews?: boolean;
    canCreateInterviews?: boolean;
    canUpdateInterviews?: boolean;
    canDeleteInterviews?: boolean;

    // TPConfig Module
    canAccessConfig?: boolean;
    canCreateConfig?: boolean;
    canUpdateConfig?: boolean;
    canDeleteConfig?: boolean;

    // AdminSettings Module
    canAccessAdminSettings?: boolean;
    canUpdateAdminSettings?: boolean;
  };

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;
}
