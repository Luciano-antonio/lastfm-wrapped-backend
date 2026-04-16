
// interfaces para a rota Top Tracks
export interface TrackAPI {
    name: string,
    playcount: number,
    ranking: number,
    imagem: string,
    artist: {
        name:string
    }
}

export interface TrackMontado {
    name: string,
    artista: string,
    plays: string,
    ranking: string,
    imagem: string
}

// interfaces para a rota Top Artists

export interface ArtistsAPI {
    name: string,
    playcount: number,
    ranking: number,
    imagemArtists: string
}

// interface para a rota Recently Played

export interface RecentlyAPI {
    name: string,
    tocandoAgora: string,
    recentlyImages: string,
    artist: { '#text': string }
    '@attr'?: { nowplaying: string }
}