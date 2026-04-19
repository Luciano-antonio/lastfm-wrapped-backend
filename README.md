# Last.fm Wrapped

## o que é:

Last.fm Wrapped é um web app de retrospectiva de musicas. Enquanto voce ouve suas musicas favoritas o last.fm wrapped faz sua prorpia retrospectiva exclusica,
incluindo: seu top 50 artistas mais ouvidos, seu top 50 musicas mais ouvidas e suas 50 ultimas musicas ouvidas.

## Tecnologias
- Node.js / Express / TypeScript
- PostgreSQL
- Last.fm API / Itunes API
- JWT / OAuth

## Rotas
- GET /auth/login - inicia o login com Last.fm
- GET /auth/callback - finaliza o OAuth
- GET /music/top-tracks - retorna top musicas
- GET /music/top-artists - retorna top artistas
- GET /music/recently-played - retorna músicas recentes

## Variaveis de ambiente necessarias
- LASTFM_API_KEY
- LASTFM_SECRET
- JWT_SECRET
- DATABASE_URL
- FRONTEND_URL
- REDIRECT_URI

## Demo
https://lastfm-wrapped-frontend-msxsompde-luciano-antonios-projects.vercel.app/

## Frontend
https://github.com/Luciano-antonio/lastfm-wrapped-frontend
