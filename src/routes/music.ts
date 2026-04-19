import express, { Request, Response} from 'express'
import Router from 'express'
const router = Router()
import pool from '../database'
import porteiro from '../middleware/auth'
import getMusicImage from '../service/musicServices'
import { TrackAPI, TrackMontado, ArtistsAPI, RecentlyAPI } from '../types'


router.get('/top-tracks', porteiro, async (req: Request, res: Response) => {
    
    // Pega o Username do usuario
    const userName = req.user.username
    
    // Faz uma requisição para a API do Last.fm buscando a top tracks do usuario
    const resposta = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getTopTracks&user=${userName}&api_key=${process.env.LASTFM_API_KEY}&format=json`)
   
    // Converte resposta para JSON
    const data = await resposta.json()
    
    // Busca a imagem de cada musica simultaneamente
    const filtrar = await Promise.all(data.toptracks.track.map(async (track: TrackAPI) => {

      // Imagem inicia vazia por padrão 
        let imagem = ''

        // Se ouver nome e artista busca imagem na função getMusicImage
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
                imagem
            }
    }))
    
 
      // Pega id do usuario
      const userID = req.user.id

    // Salva informações no banco de dados
    await Promise.all(filtrar.map(async (track: TrackMontado) => {
       
        // Se a musica não tiver nome ignore
        if (!track.name) return

        // Insere a musica no Banco de dados na tabela historico_tracks
        await pool.query(`INSERT INTO historico_tracks (usuario_id, nome_musica, artista, plays) VALUES ($1, $2, $3, $4) ON CONFLICT (usuario_id, nome_musica, artista) DO UPDATE SET PLAYS = $4`, [userID, track.name, track.artista, track.plays])
    }))

    res.json(filtrar)
})

router.get('/top-artists', porteiro, async (req: Request, res: Response) => {
    
    // Pega username do usuario
    const userName = req.user.username

    //  Faz uma requisição para a API do Last.fm buscando a top artists do usuario
    const resposta = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getTopArtists&user=${userName}&api_key=${process.env.LASTFM_API_KEY}&format=json`)
    
    // converte a resposta para JSON
    const data = await resposta.json()

    // Busca a imagem de cada artista simultaneamente
    const filtro = await Promise.all(data.topartists.artist.map(async (artists: ArtistsAPI) => {
        
        // imagemArtists inicia vazia por padrão
        let imagemArtists = ''

            // Se artista tiver nome busca a imagem na função getMusicImage        
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

    // salva informações no banco de dados
    await Promise.all(filtro.map( async (artist: ArtistsAPI) => {

        // Pega id do usuario
        const userID = req.user.id

        // insere artistas no banco de dados na tabela historico_artists
        await pool.query(`INSERT INTO historico_artists (usuario_id, artista, plays) VALUES ($1, $2, $3) ON CONFLICT (usuario_id, artista) DO UPDATE SET plays = $3`, [userID, artist.name, artist.playcount])
    }))

    res.json(filtro)
})
                                                                
router.get('/recently-played', porteiro, async (req: Request, res: Response) => {
    
    // Pega username do usuario
    const userName = req.user.username

    // Faz uma requisição para a API do Last.fm buscando musicas recentes do usuario
    const resposta = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=${userName}&api_key=${process.env.LASTFM_API_KEY}&format=json`)
    
    // converte a resposta para JSON
    const data = await resposta.json()

    // Busca imagem de cada musica recente simultaneamente
    const filtro = await Promise.all(data.recenttracks.track.map(async (track: RecentlyAPI) => {
        
        // recentlyImages inicia vazio por padrão
        let recentlyImages = ""

            // Se a musica tiver nome busca imagem na função getMusicImage
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