Senior thesis project using React, NodeJS, and PostgreSQL.

Web application to connect volunteer developers and nonprofit organizations.

Features include chatting (websockets), kanban board, and a bunch of CRUD.

\>87% test coverage in the backend.

# Running

Prereq: Docker.

1. Setup a `.env.prod` file according to `.env.example`

2. Then run

```bash
docker compose up -d
```

3. App is active on `localhost:7000`

4. You can log in using: <br/>
   Username: `Admin`<br/>
   Password: `admin_pass` (configurable using the env file)

# Testing

Prereq: NodeJS, PostgreSQL

1. Setup a `.env.test` file according to `.env.example`
2. Run `CREATE DATABASE` according to the env
3. Then run

```bash
npm run test
```

in `./backend` or `./frontend`
