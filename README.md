# Tarefas Simbuss

Aplicação AdonisJS 7 com Vue e Inertia. A API e o frontend são servidos pelo mesmo processo.

## Desenvolvimento

Requer Node.js 24 ou superior.

```sh
npm ci
cp .env.example .env
node ace generate:key
```

No Windows, copie `.env.example` para `.env` pelo terminal ou pelo explorador.

O exemplo de ambiente corresponde ao PostgreSQL do `docker-compose.yml`:

```sh
docker compose up -d
node ace migration:run
npm run dev
```

Abra http://localhost:3333/signup para criar sua conta. Para desenvolver sem PostgreSQL, configure `DB_CONNECTION=sqlite` no `.env` antes de executar as migrações. O banco SQLite fica em `tmp/db.sqlite3`. Não alterne a conexão sobre dados de produção.

## API

Crie a conta pelo frontend e envie `POST /api/login` com JSON contendo `email` e `password`. Use o `token` retornado no cabeçalho `Authorization: Bearer TOKEN` e `Accept: application/json` nas demais chamadas:

- `GET /api/tasks`: listar suas tarefas.
- `POST /api/tasks`: criar com `title`, `description` e `type` (`bug`, `suggestion` ou `general`).
- `GET /api/tasks/:id`: consultar.
- `PATCH /api/tasks/:id`: editar título, descrição ou tipo.
- `PATCH /api/tasks/:id/status`: alterar para `open`, `in_progress` ou `finished`.
- `DELETE /api/tasks/:id`: excluir.

Cada usuário acessa apenas suas próprias tarefas. O frontend usa sessão e proteção CSRF; a API usa tokens.

## Verificação

Use um banco exclusivo para testes, configure `.env.test` e execute as migrações nesse banco antes de rodar `npm test`. Os testes funcionais desfazem suas alterações com transações.

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

## Produção

```sh
npm run build
cd build
npm ci --omit=dev
```

Configure as variáveis de ambiente, incluindo uma `APP_KEY` persistente, o banco e `NODE_ENV=production`. Execute `node ace migration:run --force` e `npm start` dentro de `build`. Não publique seu `.env`.
