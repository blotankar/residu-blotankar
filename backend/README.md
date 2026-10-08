# ResiduGuard

ResiduGuard is a dairy milk safety and traceability platform designed to track cattle health, veterinary treatments, milk collection, milk processing, and consumer verification.

The current development version uses:

- React + TypeScript
- TanStack Start
- Bun
- PostgreSQL
- Prisma ORM
- REST API backend

> **Note:** Blockchain integration is planned for a later phase. The current version uses PostgreSQL as the primary database.

---

# 1. Prerequisites

Before starting the project, install the following:

- Git
- Bun
- PostgreSQL
- pgAdmin 4 (recommended)

Check that they are installed:

```powershell
git --version
bun --version
psql --version

Each command should display a version number.

2. Clone the Repository

Clone the ResiduGuard repository:

git clone <YOUR_GITHUB_REPOSITORY_URL>

Then enter the project folder:

cd ResiduGuard
3. Install Frontend Dependencies

From the project root:

bun install

This installs all frontend dependencies.

4. Install Backend Dependencies

Go into the backend folder:

cd backend

Install the backend dependencies:

bun install