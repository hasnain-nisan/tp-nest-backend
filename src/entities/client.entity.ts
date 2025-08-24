import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ClientStakeholder } from './clientStakeholder.entity';
import { Project } from './project.entity';
import { Interview } from './discoveryInterview.entity';

@Entity('client')
export class Client {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'client_code', unique: true })
  clientCode: string;

  @ManyToOne(() => User, { nullable: false })
  @Column({ name: 'created_by' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: false })
  @Column({ name: 'updated_by' })
  updatedBy: User;

  @OneToMany(() => ClientStakeholder, (stakeholder) => stakeholder.client)
  stakeholders: ClientStakeholder[];

  @OneToMany(() => Project, (project) => project.client)
  projects: Project[];

  @OneToMany(() => Interview, (interview) => interview.client)
  interviews: Interview[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;
}
