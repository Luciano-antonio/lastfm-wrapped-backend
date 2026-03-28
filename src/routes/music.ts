import express, { Request, Response} from 'express'
import Router from 'express'
const router = Router()
import pool from '../database'
import { usuarioLogado, usuarioID, sessionKey } from './auth'

router.get('/top-tracks', async (req: Request, res: Response) => {
    const userName = usuarioLogado
    const resposta = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getTopTracks&user=${userName}&api_key=${process.env.LASTFM_API_KEY}&format=json`)
    const data = await resposta.json()
    const filtrar = data.toptracks.track.map((track: any) => ({
        nome: track.name,
        artista: track.artist.name,
        plays: track.playcount,
        ranking: (track as any)['@attr'].rank

    }))
    
    filtrar.forEach(async (track: any) => {
        await pool.query(`INSERT INTO historico_tracks (usuario_id, nome_musica, artista, plays) VALUES ($1, $2, $3, $4)`, [usuarioID, track.nome, track.artista, track.plays])
    })

    res.json(filtrar)
})

router.get('/top-artists', async (req: Request, res: Response) => {
    const userName = usuarioLogado
    const resposta = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getTopArtists&user=${userName}&api_key=${process.env.LASTFM_API_KEY}&format=json`)
    const data = await resposta.json()
    const filtro = data.topartists.artist.map((artist: any) => ({
        artista: artist.name,
        ranking: (artist as any)['@attr'].rank,
        playcount: artist.playcount
    }))

    filtro.forEach(async (artist: any) => {
        await pool.query(`INSERT INTO historico_artists (usuario_id, artista, plays) VALUES ($1, $2, $3)`, [usuarioID, artist.artista, artist.playcount])
    })

    res.json(filtro)
})

router.get('/recently-played', async (req: Request, res: Response) => {
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


export default router