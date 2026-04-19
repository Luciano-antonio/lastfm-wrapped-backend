import express, { Request, Response } from 'express'
import { Router } from 'express'
const router = Router()
import crypto from 'crypto'
import pool from '../database'
import jwt from 'jsonwebtoken'


router.get('/login', async (req: Request, res: Response) => {
    
    // Last.fm login
    const authURL = `http://www.last.fm/api/auth/?api_key=${process.env.LASTFM_API_KEY}&cb=${process.env.REDIRECT_URI}`

    // redireciona o usuario para o login Last.fm
    res.redirect(authURL)
})


router.get('/callback', async (req: Request, res: Response) => {
   try { 

    // Recebe token do usuario
    const token = req.query.token as string

    // Caso não tenha token da erro
    if (!token) return res.status(400).json({ Erro: 'Token não fornecido' })
    
    // Gera uma assinatura MD5 com a API key, token e secret
    // O last.fm exige essa assinatura para validar que a requisição é legitima    
    const assinatura = crypto
    .createHash('md5')
    .update(`api_key${process.env.LASTFM_API_KEY}methodauth.getSessiontoken${token}${process.env.LASTFM_SECRET}`)
    .digest('hex')

    // Troca o token temporário pela session key permanente do usuario 
    const valido =  await fetch(`https://ws.audioscrobbler.com/2.0/?method=auth.getSession&api_key=${process.env.LASTFM_API_KEY}&token=${token}&api_sig=${assinatura}&format=json`)
    
    // Converte valido para JSON
    const data = await valido.json()

    // Recebe session key do usuario
    const sessionKey = data.session.key

    // Recebe nome do usuario
    const usuarioLogado = data.session.name

 // Insere session key e nome do usuario no banco de dados   
const inserirBanco = await pool.query(`INSERT INTO usuarios (username, session_key)
    VALUES ($1, $2)
    ON CONFLICT (username)
    DO UPDATE SET session_key = $2
    RETURNING id`,
    [usuarioLogado, sessionKey])

    // Pega ID do usuario
    const usuarioID = inserirBanco.rows[0].id

    // Cria um token JWT com o username e id do usuario, válido por 7 dias
    const tokenJWT = jwt.sign(
        { username: usuarioLogado, id: usuarioID },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d'}
    )
    // Redireciona para o dashboard passando a JWT pela URL
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${tokenJWT}`)
} catch {
    res.status(500).json({ erro: "Erro ao autenticar "})
}
})

export default router