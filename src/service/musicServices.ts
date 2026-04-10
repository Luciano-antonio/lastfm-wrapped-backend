import { Pool } from 'pg'
import pool from '../database'
    const getMusicImage = async (artist: string, track: string) => {
        
        const searchKey = `${artist}:${track}`.toLowerCase().trim()
        const result = await pool.query(
            'SELECT image_url FROM music_metadata_cache WHERE search_key = $1',
            [searchKey]
        )

            if (result.rows.length > 0) {
                return result.rows[0].image_url
            }

        let imagens = ''

    const query = encodeURIComponent(`${searchKey}`)
    const response = await fetch(`https://itunes.apple.com/search?term=${query}&media=music&limit=1`)
    const data = await response.json()
    imagens = data.results[0]?.artworkUrl100 || ''
    

    await pool.query(
        'INSERT INTO music_metadata_cache (search_key, image_url) VALUES ($1, $2) ON CONFLICT (search_key) DO NOTHING',
        [searchKey, imagens]
    )

        return imagens

    }

export default getMusicImage
