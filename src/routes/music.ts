import express, { Request, Response} from 'express'
import Router from 'express'
const router = Router()
import pool from '../database'
import { usuarioLogado, usuarioID, sessionKey } from './auth'
import porteiro from '../middleware/auth'

router.get('/top-tracks', porteiro, async (req: Request, res: Response) => {
    const userName = usuarioLogado
    const resposta = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getTopTracks&user=${userName}&api_key=${process.env.LASTFM_API_KEY}&format=json`)
    const data = await resposta.json()
    const filtrar = await Promise.all(data.toptracks.track.map(async (track: any) => {
        let imagem = ''
        if (track.name && track.artist.name) {
            try {
                const deezerRes = await fetch(`https://api.deezer.com/search?q=artist:"${track.artist.name}`)
                const deezerData: any = await deezerRes.json()
                imagem = deezerData.data[0]?.album?.cover_medium || ''
            } catch {}
        }
            return {
                name: track.name,
                artista: track.artist.name,
                plays: track.playcount,
                ranking: (track as any) ['@attr'].rank,
                mbid: track.mbid,
                imagem
            }
    }))
    
    filtrar.forEach(async (track: any) => {
        if (!track.name) return
        await pool.query(`INSERT INTO historico_tracks (usuario_id, nome_musica, artista, plays) VALUES ($1, $2, $3, $4) ON CONFLICT (usuario_id, nome_musica, artista) DO UPDATE SET PLAYS = $4`, [usuarioID, track.name, track.artista, track.plays])
    })

    res.json(filtrar)
})

router.get('/top-artists', porteiro, async (req: Request, res: Response) => {
    const userName = usuarioLogado
    const resposta = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getTopArtists&user=${userName}&api_key=${process.env.LASTFM_API_KEY}&format=json`)
    const data = await resposta.json()
    const filtro = await Promise.all(data.topartists.artist.map(async (artists: any) => {
        let imagemArtists = ''
            if (artists.name) {
                try {
                    const deezerRes = await fetch(`https://api.deezer.com/search/artist?q=${artists.name}`)
                    const deezerData: any = await deezerRes.json()
                    imagemArtists = deezerData.data[0].picture_medium || ''
                } catch {}
            }
                return {
                    name: artists.name,
                    playcount: artists.playcount,
                    ranking: (artists as any) ['@attr'].rank,
                    imagemArtists
                }
    }))

    filtro.forEach(async (artist: any) => {
        await pool.query(`INSERT INTO historico_artists (usuario_id, artista, plays) VALUES ($1, $2, $3)`, [usuarioID, artist.name, artist.playcount])
    })

    res.json(filtro)
})

router.get('/recently-played', porteiro, async (req: Request, res: Response) => {
    const userName = usuarioLogado
    const resposta = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=${userName}&api_key=${process.env.LASTFM_API_KEY}&format=json`)
    const data = await resposta.json()
    const filtro = await Promise.all(data.recenttracks.track.slice(0, 2).map(async (track: any) => {
        let recentlyImages = ""
            if (track.name) {
                try {
                    const deezerRes = await fetch(`https://api.deezer.com/search?q=artist:"${track.artist['#text']}" track:"${track.name}"`)
                    const deezerData: any = await deezerRes.json()
                    console.log(deezerData)
                    recentlyImages = deezerData.data[0]?.album?.cover_medium || ''
                } catch {}
            }
                return {
                    name: track.name,
                    playcount: track.playcount,
                    recentlyImages
                }
    }))
    res.json(filtro)
})


export default router