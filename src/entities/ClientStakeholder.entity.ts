import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Client } from './Client.entity';
import { User } from './User.entity';
import { Interview } from './DiscoveryInterview.entity';

@Entity('client_stakeholder')
export class ClientStakeholder {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'email', nullable: true, unique: true })
  email: string;

  @Column({ name: 'phone', nullable: true, unique: true })
  phone: string;

  @ManyToOne(() => Client, (client) => client.stakeholders)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ name: 'role', nullable: true })
  role: string;

  @Column({ name: 'team', nullable: true })
  team: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  updatedBy: User;

  @ManyToMany(() => Interview, (interview) => interview.stakeholders)
  interviews: Interview[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;
}
