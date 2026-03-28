import 'dotenv/config'
import express, { Request, Response } from 'express'
const app = express()
app.use(express.json())
import { Pool } from 'pg'
import crypto   from 'crypto'

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT)
})

app.get('/login', async (req: Request, res: Response) => {
    const authURL = `http://www.last.fm/api/auth/?api_key=${process.env.LASTFM_API_KEY}&cb=${process.env.REDIRECT_URI}`
    res.redirect(authURL)
})

let sessionKey = ''
let usuarioLogado = ''

app.get('/callback', async (req: Request, res: Response) => {
    const token = req.query.token as string
    const assinatura = crypto
    .createHash('md5')
    .update(`api_key${process.env.LASTFM_API_KEY}methodauth.getSessiontoken${token}${process.env.LASTFM_SECRET}`)
    .digest('hex')

const valido =  await fetch(`https://ws.audioscrobbler.com/2.0/?method=auth.getSession&api_key=${process.env.LASTFM_API_KEY}&token=${token}&api_sig=${assinatura}&format=json`)
    const data = await valido.json()
    sessionKey = data.session.key
    usuarioLogado = data.session.name
    res.json(data)
})

app.get('/top-tracks', async (req: Request, res: Response) => {
    const userName = usuarioLogado
    const resposta = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getTopTracks&user=${userName}&api_key=${process.env.LASTFM_API_KEY}&format=json`)
    const data = await resposta.json()
    const filtrar = data.toptracks.track.map((track: any) => ({
        nome: track.name,
        artista: track.artist.name,
        plays: track.playcount,
        ranking: (track as any)['@attr'].rank

    }))
    
    res.json(filtrar)
})

app.get('/top-artists', async (req: Request, res: Response) => {
    const userName = usuarioLogado
    const resposta = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getTopArtists&user=${userName}&api_key=${process.env.LASTFM_API_KEY}&format=json`)
    const data = await resposta.json()
    const filtro = data.topartists.artist.map((artist: any) => ({
        artista: artist.name,
        ranking: (artist as any)['@attr'].rank,
        playcount: artist.playcount
    }))
    res.json(filtro)
})

app.get('/recently-played', async (req: Request, res: Response) => {
    const userName = usuarioLogado
    const resposta = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=${userName}&api_key=${process.env.LASTFM_API_KEY}&format=json`)
    const data = await resposta.json()
    const filtro = data.recenttracks.track.map((track: any) => ({
        name: track.name,
        artists: track.artist['#text'],
        date: track.date?.['#text']
    }))
    res.json(filtro)
})

app.listen(3000, () => {
    console.log("Servidor funcionando!")
})