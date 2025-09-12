import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './User.entity';

@Entity('admin_settings')
@Unique(['clientEmail'])
export class AdminSettings {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'varchar', length: 50, name: 'type', nullable: false })
  type: string; // e.g., "service_account"

  @Column({ type: 'varchar', length: 255, name: 'project_id', nullable: true })
  projectId: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'private_key_id',
    nullable: true,
  })
  privateKeyId: string;

  @Column({ type: 'text', name: 'private_key', nullable: false })
  privateKey: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'client_email',
    nullable: false,
  })
  clientEmail: string;

  @Column({ type: 'varchar', length: 255, name: 'client_id', nullable: true })
  clientId: string;

  @Column({ type: 'varchar', length: 500, name: 'auth_uri', nullable: true })
  authUri: string;

  @Column({ type: 'varchar', length: 500, name: 'token_uri', nullable: true })
  tokenUri: string;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'auth_provider_x509_cert_url',
    nullable: true,
  })
  authProviderX509CertUrl: string;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'client_x509_cert_url',
    nullable: true,
  })
  clientX509CertUrl: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'universe_domain',
    nullable: true,
  })
  universeDomain: string;

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

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;
}
