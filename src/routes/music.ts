import express, { Request, Response} from 'express'
import Router from 'express'
const router = Router()
import pool from '../database'
import { usuarioLogado, usuarioID, sessionKey } from './auth'
import porteiro from '../middleware/auth'
import getMusicImage from '../service/musicServices'


router.get('/top-tracks', porteiro, async (req: Request, res: Response) => {
    const userName = usuarioLogado
    const resposta = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getTopTracks&user=${userName}&api_key=${process.env.LASTFM_API_KEY}&format=json`)
    const data = await resposta.json()
    const filtrar = await Promise.all(data.toptracks.track.map(async (track: any) => {
        let imagem = ''
        if (track.name && track.artist.name) {
            try {
                imagem = await getMusicImage(track.artist.name, track.name)
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
    
    await Promise.all(filtrar.map(async (track: any) => {
        if (!track.name) return
        await pool.query(`INSERT INTO historico_tracks (usuario_id, nome_musica, artista, plays) VALUES ($1, $2, $3, $4) ON CONFLICT (usuario_id, nome_musica, artista) DO UPDATE SET PLAYS = $4`, [usuarioID, track.name, track.artista, track.plays])
    }))

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
                    imagemArtists = await getMusicImage(artists.name, '')
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
                                                                // Rota buscando imagens via Itunes.
router.get('/recently-played', porteiro, async (req: Request, res: Response) => {
    const userName = usuarioLogado
    const resposta = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=${userName}&api_key=${process.env.LASTFM_API_KEY}&format=json`)
    const data = await resposta.json()
    const filtro = await Promise.all(data.recenttracks.track.map(async (track: any) => {
        let recentlyImages = ""
            if (track.name) {
                try {
                    recentlyImages = await getMusicImage('', track.name)
                } catch {}
            }
                return {
                    name: track.name,
                    artista: track.artist['#text'],
                    tocandoAgora: track['@attr']?.nowplaying === 'true',
                    recentlyImages
                }
    }))
    res.json(filtro)
})


export default router