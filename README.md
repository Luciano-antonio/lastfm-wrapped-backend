# Last.fm Wrapped

## O que é

Last.fm Wrapped é um web app de retrospectiva musical. Enquanto você ouve suas músicas favoritas, o app gera sua própria retrospectiva, incluindo:
- Top 50 músicas mais ouvidas
- Top 50 artistas mais ouvidos
- Últimas 50 músicas ouvidas

## Tecnologias
- Node.js / Express / TypeScript
- PostgreSQL
- Last.fm API / iTunes API
- JWT / OAuth

## Rotas
- GET /auth/login - inicia o login com Last.fm
- GET /auth/callback - finaliza o OAuth
- GET /music/top-tracks - retorna top músicas
- GET /music/top-artists - retorna top artistas
- GET /music/recently-played - retorna músicas recentes

## Variáveis de ambiente necessárias
```
LASTFM_API_KEY=
LASTFM_SECRET=
JWT_SECRET=
DATABASE_URL=
FRONTEND_URL=
REDIRECT_URI=
```

## Demo
https://lastfm-wrapped-frontend-msxsompde-luciano-antonios-projects.vercel.app/

## Frontend
https://github.com/Luciano-antonio/lastfm-wrapped-frontend
