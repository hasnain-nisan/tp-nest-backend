import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User.entity';
import { Interview } from './DiscoveryInterview.entity';
import { Client } from './Client.entity';
import { Config } from './Config.entity';
// import { ProjectConfig } from './config.entity';

@Entity('project')
export class Project {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'name', unique: true })
  name: string;

  @Column({ name: 'client_team', nullable: true })
  clientTeam: string;

  @ManyToOne(() => Client, (client) => client.projects)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  updatedBy: User;

  @OneToMany(() => Interview, (interview) => interview.project)
  interviews: Interview[];

  @OneToMany(() => Config, (config) => config.project)
  configs: Config[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;
}
