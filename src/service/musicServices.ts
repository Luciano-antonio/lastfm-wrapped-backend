import pool from '../database'

    // Função que busca imagens e salva no banco de dados
    const getMusicImage = async (artist: string, track: string) => {
        
        // Garante que as musicas e artistas sempre estarão no mesmo formato
        const searchKey = `${artist}:${track}`.toLowerCase().trim()
        
        // Verifica se a Search key da imagem já existe no banco de dados
        const result = await pool.query(
            'SELECT image_url FROM music_metadata_cache WHERE search_key = $1',
            [searchKey]
        )

            // Se encontrou algo no cache retorna a imagem já salva
            if (result.rows.length > 0) {
                return result.rows[0].image_url
            }

        // Imagens começa vazia por padrão
        let imagens = ''

       // Faz uma requisição para a API do Itunes buscando imagem 
       try { 
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchKey)}&media=music&limit=1`)
        
        // Converte response para JSON
        const data = await response.json()

        // Imagens recebe imagem ou retorna string vazia 
        imagens = data.results[0]?.artworkUrl100 || ''
    
// Envia Search key e Imagens para o banco de dados
    await pool.query(
        'INSERT INTO music_metadata_cache (search_key, image_url) VALUES ($1, $2) ON CONFLICT (search_key) DO NOTHING',
        [searchKey, imagens]
    )

        return imagens


  } catch {
        return ''
    }
    
    }

export default getMusicImage
