# Database Structure Documentation

## Overview

This document provides a detailed explanation of the database structure for a client management and discovery interview system. The database consists of five main entities that work together to manage clients, their stakeholders, projects, and discovery interviews.

## Core Entities Overview

### 1. User Entity

**Purpose:** Central authentication and authorization entity

**Key Features:**
- Uses UUID as primary key for better security and scalability
- Role-based access control with `SuperAdmin` and `Admin` roles
- Flexible permission system using JSONB `accessScopes` for granular permissions
- Serves as the audit trail source for all other entities

**Fields:**
- `id` (UUID, Primary Key)
- `email` (Unique)
- `password`
- `role` (Enum: SuperAdmin | Admin)
- `accessScopes` (JSONB)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### 2. Client Entity

**Purpose:** Represents client organizations

**Key Features:**
- Unique `clientCode` for business identification
- Soft deletion with `isDeleted` flag
- Full audit trail with `createdBy` and `updatedBy` foreign keys to User
- Parent entity for stakeholders, projects, and interviews

**Fields:**
- `id` (UUID, Primary Key)
- `name`
- `clientCode` (Unique)
- `createdBy` (Foreign Key → User)
- `updatedBy` (Foreign Key → User)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)
- `isDeleted` (Boolean, Default: false)

### 3. ClientStakeholder Entity

**Purpose:** Represents individual contacts within client organizations

**Key Features:**
- Belongs to exactly one client (Many-to-One relationship)
- Can participate in multiple projects (Many-to-Many relationship)
- Can have multiple interviews conducted with them
- Optional contact information (email, phone)

**Fields:**
- `id` (UUID, Primary Key)
- `name`
- `email` (Nullable)
- `phone` (Nullable)
- `clientId` (Foreign Key → Client)
- `createdBy` (Foreign Key → User)
- `updatedBy` (Foreign Key → User)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)
- `isDeleted` (Boolean, Default: false)

### 4. Project Entity

**Purpose:** Represents specific projects for clients

**Key Features:**
- Belongs to exactly one client
- Can involve multiple stakeholders through a many-to-many relationship
- Uses a junction table `project_stakeholders` for the M:M relationship
- Can have multiple discovery interviews associated with it

**Fields:**
- `id` (UUID, Primary Key)
- `name`
- `clientTeam` (Nullable)
- `clientId` (Foreign Key → Client)
- `createdBy` (Foreign Key → User)
- `updatedBy` (Foreign Key → User)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)
- `isDeleted` (Boolean, Default: false)

### 5. Interview (DiscoveryInterview) Entity

**Purpose:** Records discovery interviews conducted

**Key Features:**
- Links to client, stakeholder, and project (all required relationships)
- Stores Google Drive integration with `gDriveId`
- Captures different types of requests (distillation, coaching, user stories)
- Timestamp for scheduling/tracking interview dates

**Fields:**
- `id` (UUID, Primary Key)
- `name`
- `date` (Timestamp)
- `gDriveId` (Nullable)
- `requestDistillation` (Nullable)
- `requestCoaching` (Nullable)
- `requestUserStories` (Nullable)
- `clientId` (Foreign Key → Client)
- `stakeholderId` (Foreign Key → ClientStakeholder)
- `projectId` (Foreign Key → Project)
- `createdBy` (Foreign Key → User)
- `updatedBy` (Foreign Key → User)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)
- `isDeleted` (Boolean, Default: false)

## Relationship Analysis

### One-to-Many Relationships

1. **Client → ClientStakeholder:** One client has many stakeholders
2. **Client → Project:** One client has many projects
3. **Client → Interview:** One client has many interviews
4. **ClientStakeholder → Interview:** One stakeholder can have many interviews
5. **Project → Interview:** One project can have many interviews

### Many-to-Many Relationship

**Project ↔ ClientStakeholder:** Projects can involve multiple stakeholders, and stakeholders can work on multiple projects
- Implemented via junction table `project_stakeholders`

### Audit Trail Pattern

All main entities (except User) have `createdBy` and `updatedBy` foreign keys pointing to the User entity, providing comprehensive audit logging.

## Design Strengths

1. **Comprehensive Audit Trail:** Every entity tracks who created and last updated it
2. **Soft Deletion:** Uses `isDeleted` flags instead of hard deletion for data preservation
3. **Flexible Permissions:** JSONB `accessScopes` allows for granular permission management
4. **UUID Primary Keys:** Better for distributed systems and security
5. **Clear Business Logic:** The relationships reflect real-world business scenarios

## Business Logic Flow

1. **User** logs in with role-based permissions
2. **Client** organizations are created and managed
3. **ClientStakeholders** are added to represent contacts within each client
4. **Projects** are created for clients with assigned stakeholders
5. **Discovery Interviews** are scheduled and conducted, linking all three: client, project, and specific stakeholder

## Use Cases

This database structure effectively supports a consulting or service-based business that needs to:

- Manage client relationships
- Track stakeholder interactions
- Organize projects with multiple stakeholder involvement
- Conduct discovery interviews with comprehensive context
- Maintain full audit trails for compliance and accountability
- Implement flexible access control for different user roles

## Technical Implementation

The system is implemented using TypeORM with the following key features:

- **UUID Primary Keys** for all entities
- **Enum Types** for role-based access control
- **JSONB Fields** for flexible permission structures
- **Junction Tables** for many-to-many relationships
- **Soft Delete Pattern** for data preservation
- **Comprehensive Foreign Key Relationships** for data integrity

## Conclusion

This database design provides a robust foundation for client management and discovery interview processes, with strong emphasis on data integrity, audit trails, and flexible permission management. The structure supports complex business scenarios while maintaining clean, normalized data relationships.