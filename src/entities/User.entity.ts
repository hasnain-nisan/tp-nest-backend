import { Exclude } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
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
    enum: ['SuperAdmin', 'Admin'],
  })
  role: 'SuperAdmin' | 'Admin';

  @Column('jsonb', { name: 'access_scopes', nullable: true })
  accessScopes: {
    canManageUsers?: boolean;
    canManageClients?: boolean;
    canManageStakeholders?: boolean;
    canManageProjects?: boolean;
    canManageInterviews?: boolean;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
