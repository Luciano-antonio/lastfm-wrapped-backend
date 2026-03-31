import express, { Request, Response } from 'express'
import { Router } from 'express'
const router = Router()
import crypto from 'crypto'
import pool from '../database'
import jwt from 'jsonwebtoken'

router.get('/login', async (req: Request, res: Response) => {
    const authURL = `http://www.last.fm/api/auth/?api_key=${process.env.LASTFM_API_KEY}&cb=${process.env.REDIRECT_URI}`
    res.redirect(authURL)
})

let sessionKey = ''
let usuarioLogado = ''
let usuarioID = ''  // variavel global apenas pra coletar id da rota callback

router.get('/callback', async (req: Request, res: Response) => {
    const token = req.query.token as string
    const assinatura = crypto
    .createHash('md5')
    .update(`api_key${process.env.LASTFM_API_KEY}methodauth.getSessiontoken${token}${process.env.LASTFM_SECRET}`)
    .digest('hex')

    const valido =  await fetch(`https://ws.audioscrobbler.com/2.0/?method=auth.getSession&api_key=${process.env.LASTFM_API_KEY}&token=${token}&api_sig=${assinatura}&format=json`)
    const data = await valido.json()
    sessionKey = data.session.key
    usuarioLogado = data.session.name

const inserirBanco = await pool.query(`INSERT INTO usuarios (username, session_key)
    VALUES ($1, $2)
    ON CONFLICT (username)
    DO UPDATE SET session_key = $2
    RETURNING id`,
    [usuarioLogado, sessionKey])

    usuarioID = inserirBanco.rows[0].id

    const tokenJWT = jwt.sign(
        { username: usuarioLogado, id: usuarioID },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d'}
    )
    res.json({ tokenJWT })
})

export default router
export { sessionKey, usuarioID, usuarioLogado}