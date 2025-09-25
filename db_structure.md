# Database Structure Documentation

## Overview
This database supports **client management**, **stakeholder tracking**, **project management**, and **discovery interview scheduling**, with **full auditability** and **granular access control**.  
It’s composed of five main entities and one junction table, designed for scalability, integrity, and traceability.

---

## Core Entities

### **1. User**
**Purpose:** Authentication, authorization, and system-wide audit source.

**Key Features:**
- UUID primary key for global uniqueness.
- Enum `role` supports system-level roles (`SuperAdmin`, `Admin`).
- `accessScopes` JSONB for granular feature-level permissions.
- Self-referential `createdBy` / `updatedBy` for tracking by other users.

**Fields:**
| Field          | Type      | Constraints / Notes                                   |
|----------------|-----------|------------------------------------------------------|
| id             | UUID      | PK                                                   |
| email          | varchar   | unique, **not null**                                 |
| password       | varchar   | **not null**, excluded from serialization            |
| role           | enum      | `SuperAdmin` or `Admin`, **not null**                 |
| accessScopes   | JSONB     | nullable, stores boolean permission flags             |
| created_by     | UUID      | nullable, FK → User                                  |
| updated_by     | UUID      | nullable, FK → User                                  |
| created_at     | timestamp | auto-generated                                       |
| updated_at     | timestamp | auto-generated                                       |
| is_deleted     | boolean   | default: `false`                                      |

---

### **2. Client**
**Purpose:** Represents a client organization.

**Key Features:**
- Unique `clientCode` for business reference.
- Soft-delete with `is_deleted`.
- Parent for `ClientStakeholder`, `Project`, and `Interview`.

**Fields:**
| Field        | Type      | Constraints / Notes     |
|--------------|-----------|-------------------------|
| id           | UUID      | PK                      |
| name         | varchar   | **not null**            |
| client_code  | varchar   | unique, **not null**    |
| created_by   | UUID      | nullable, FK → User     |
| updated_by   | UUID      | nullable, FK → User     |
| created_at   | timestamp | auto-generated          |
| updated_at   | timestamp | auto-generated          |
| is_deleted   | boolean   | default: `false`        |

---

### **3. ClientStakeholder**
**Purpose:** A contact person working for a Client.

**Key Features:**
- Belongs to exactly **one** Client.
- May be linked to multiple Projects (M:M through `project_stakeholders`).
- Contact info is optional.

**Fields:**
| Field        | Type      | Constraints / Notes     |
|--------------|-----------|-------------------------|
| id           | UUID      | PK                      |
| name         | varchar   | **not null**            |
| email        | varchar   | nullable                |
| phone        | varchar   | nullable                |
| client_id    | UUID      | FK → Client, **not null** |
| created_by   | UUID      | nullable, FK → User     |
| updated_by   | UUID      | nullable, FK → User     |
| created_at   | timestamp | auto-generated          |
| updated_at   | timestamp | auto-generated          |
| is_deleted   | boolean   | default: `false`        |

---

### **4. Project**
**Purpose:** Represents a project for a Client.

**Key Features:**
- Belongs to a single Client.
- Can link to multiple Stakeholders via `project_stakeholders` M:M join.
- Has multiple associated Interviews.

**Fields:**
| Field        | Type      | Constraints / Notes     |
|--------------|-----------|-------------------------|
| id           | UUID      | PK                      |
| name         | varchar   | **not null**            |
| client_team  | varchar   | nullable                |
| client_id    | UUID      | FK → Client, **not null**|
| created_by   | UUID      | nullable, FK → User     |
| updated_by   | UUID      | nullable, FK → User     |
| created_at   | timestamp | auto-generated          |
| updated_at   | timestamp | auto-generated          |
| is_deleted   | boolean   | default: `false`        |

---

### **5. DiscoveryInterview**
**Purpose:** Represents interviews conducted for a Client, linked to a specific Project.

**Key Features:**
- Required link to both `Client` and `Project`.
- Optional Google Drive ID and request type flags.
- Tracks interview date.

**Fields:**
| Field                | Type      | Constraints / Notes     |
|----------------------|-----------|-------------------------|
| id                   | UUID      | PK                      |
| name                 | varchar   | **not null**            |
| date                 | timestamp | **not null**            |
| gdrive_id            | varchar   | nullable                |
| request_distillation | varchar   | nullable                |
| request_coaching     | varchar   | nullable                |
| request_user_stories | varchar   | nullable                |
| client_id            | UUID      | FK → Client, **not null**|
| project_id           | UUID      | FK → Project, **not null**|
| created_by           | UUID      | nullable, FK → User     |
| updated_by           | UUID      | nullable, FK → User     |
| created_at           | timestamp | auto-generated          |
| updated_at           | timestamp | auto-generated          |
| is_deleted           | boolean   | default: `false`        |

---

### **6. project_stakeholders** (Junction Table)
**Purpose:** Links Projects to ClientStakeholders (M:M).

**Fields:**
| Field          | Type  | Constraints / Notes |
|----------------|-------|---------------------|
| project_id     | UUID  | FK → Project        |
| stakeholder_id | UUID  | FK → ClientStakeholder |

---

## Relationship Summary

**One-to-Many**
- Client → ClientStakeholder  
- Client → Project  
- Client → DiscoveryInterview  
- Project → DiscoveryInterview  

**Many-to-Many**
- Project ↔ ClientStakeholder (via `project_stakeholders`)

**Audit Trail**
- Every main entity except has `created_by` and `updated_by` → `User`.

---

## Design Strengths
1. **Strong auditability** through `created_by` and `updated_by`.
2. **Soft-deletion** everywhere for reversible data handling.
3. **Granular permissions** via `accessScopes`.
4. **UUID keys** for distributed safety and non-guessable IDs.
5. **Clear workflow mapping** (client → project → interview).

---

## DBML Schema

[TP Admin Database Diagram](https://dbdiagram.io/d/TP-admin-db-68ac81791e7a611967813959)

```dbml
// DBML for your given entities with nullability
// Docs: https://dbml.dbdiagram.io/docs

Table user {
  id uuid [primary key]
  email varchar [unique] // not null
  password varchar // not null
  role varchar // enum: SuperAdmin | Admin, not null
  access_scopes jsonb [null]
  created_by uuid [null]
  updated_by uuid [null]
  created_at timestamp
  updated_at timestamp
  is_deleted boolean // default: false
}

Table client {
  id uuid [primary key]
  name varchar // not null
  client_code varchar [unique] // not null
  created_by uuid [null]
  updated_by uuid [null]
  created_at timestamp
  updated_at timestamp
  is_deleted boolean // default: false
}

Table client_stakeholder {
  id uuid [primary key]
  name varchar // not null
  email varchar [null]
  phone varchar [null]
  client_id uuid // not null
  created_by uuid [null]
  updated_by uuid [null]
  created_at timestamp
  updated_at timestamp
  is_deleted boolean // default: false
}

Table project {
  id uuid [primary key]
  name varchar // not null
  client_team varchar [null]
  client_id uuid // not null
  created_by uuid [null]
  updated_by uuid [null]
  created_at timestamp
  updated_at timestamp
  is_deleted boolean // default: false
}

Table project_stakeholders {
  project_id uuid // not null
  stakeholder_id uuid // not null
}

Table discovery_interview {
  id uuid [primary key]
  name varchar // not null
  date timestamp // not null
  gdrive_id varchar [null]
  request_distillation varchar [null]
  request_coaching varchar [null]
  request_user_stories varchar [null]
  client_id uuid // not null
  project_id uuid // not null
  created_by uuid [null]
  updated_by uuid [null]
  created_at timestamp
  updated_at timestamp
  is_deleted boolean // default: false
}

// Relationships for many-to-many
Ref: project_stakeholders.project_id > project.id
Ref: project_stakeholders.stakeholder_id > client_stakeholder.id

// One-to-many / Many-to-one relationships
Ref: client_stakeholder.client_id > client.id
Ref: project.client_id > client.id
Ref: discovery_interview.client_id > client.id
Ref: discovery_interview.project_id > project.id

// Self-references for created_by / updated_by
Ref: user.created_by > user.id
Ref: user.updated_by > user.id
Ref: client.created_by > user.id
Ref: client.updated_by > user.id
Ref: client_stakeholder.created_by > user.id
Ref: client_stakeholder.updated_by > user.id
Ref: project.created_by > user.id
Ref: project.updated_by > user.id
Ref: discovery_interview.created_by > user.id
Ref: discovery_interview.updated_by > user.id


// DBML for your given entities with nullability
// Docs: https://dbml.dbdiagram.io/docs

Table user {
  id uuid [primary key]
  email varchar [unique] // not null
  password varchar // not null
  role varchar // enum: SuperAdmin | Admin | InterviewUser, not null
  access_scopes jsonb [null]
  created_by uuid [null]
  updated_by uuid [null]
  created_at timestamp
  updated_at timestamp
  is_deleted boolean // default: false
}

Table admin_settings {
  id uuid [primary key]
  type varchar(50) // not null
  project_id varchar(255) [null]
  private_key_id varchar(255) [null]
  private_key text // not null
  client_email varchar(255) [unique, not null]
  client_id varchar(255) [null]
  auth_uri varchar(500) [null]
  token_uri varchar(500) [null]
  auth_provider_x509_cert_url varchar(500) [null]
  client_x509_cert_url varchar(500) [null]
  universe_domain varchar(255) [null]
  created_by uuid [null]
  updated_by uuid [null]
  created_at timestamp
  updated_at timestamp
  is_deleted boolean // default: false
}

Table client {
  id uuid [primary key]
  name varchar // not null
  client_code varchar [unique] // not null
  created_by uuid [null]
  updated_by uuid [null]
  created_at timestamp
  updated_at timestamp
  is_deleted boolean // default: false
}

Table client_stakeholder {
  id uuid [primary key]
  name varchar // not null
  email varchar [null]
  phone varchar [null]
  client_id uuid // not null
  created_by uuid [null]
  updated_by uuid [null]
  created_at timestamp
  updated_at timestamp
  is_deleted boolean // default: false
}

Table project {
  id uuid [primary key]
  name varchar [unique] // not null
  client_team varchar [null]
  client_id uuid // not null
  description text // not null
  created_by uuid [null]
  updated_by uuid [null]
  created_at timestamp
  updated_at timestamp
  is_deleted boolean // default: false
}

Table discovery_interview {
  id uuid [primary key]
  name varchar // not null
  date timestamp // not null
  gdrive_id varchar [null]
  request_distillation varchar [null]
  request_coaching varchar [null]
  request_user_stories varchar [null]
  client_id uuid // not null
  project_id uuid // not null
  created_by uuid // not null (ManyToOne with no nullable option means it's not nullable)
  updated_by uuid // not null
  created_at timestamp
  updated_at timestamp
  is_deleted boolean // default: false
}

Table interview_stakeholders {
  interview_id uuid [not null]
  stakeholder_id uuid [not null]
}

// Relationships
// One-to-many / Many-to-one relationships
Ref: client_stakeholder.client_id > client.id
Ref: project.client_id > client.id
Ref: discovery_interview.client_id > client.id
Ref: discovery_interview.project_id > project.id
Ref: interview_stakeholders.interview_id > discovery_interview.id
Ref: interview_stakeholders.stakeholder_id > client_stakeholder.id

// Self-references for created_by / updated_by
Ref: user.created_by > user.id
Ref: user.updated_by > user.id
Ref: client.created_by > user.id
Ref: client.updated_by > user.id
Ref: client_stakeholder.created_by > user.id
Ref: client_stakeholder.updated_by > user.id
Ref: project.created_by > user.id
Ref: project.updated_by > user.id
Ref: discovery_interview.created_by > user.id
Ref: discovery_interview.updated_by > user.id
Ref: admin_settings.created_by > user.id
Ref: admin_settings.updated_by > user.id