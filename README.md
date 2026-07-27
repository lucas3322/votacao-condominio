# Condomínio em Conjunto

Aplicação fullstack em Next.js para reunir as adesões dos moradores e totalizar pessoas, janelas e portas de sacada por serviço.

## Rodar localmente

1. Crie um banco PostgreSQL e copie `.env.example` para `.env`.
2. Execute `npx prisma db push`.
3. Execute `npm run dev`.
4. Abra `http://localhost:3000`.

## Publicar na Vercel

Crie um PostgreSQL (Neon, Supabase ou Vercel Marketplace), cadastre na Vercel as quatro variáveis de `.env.example` e execute `npx prisma db push` usando a URL de produção antes da primeira utilização.

O login master inicial é `lucas.pardinho`. A senha não fica no código: somente o hash está configurado.
