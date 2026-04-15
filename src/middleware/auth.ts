import express, { Request, Response} from 'express'
import jwt from 'jsonwebtoken'

function porteiro(req: Request, res: Response, next: any) {
    const authHeader = req.headers.authorization
    const token = authHeader?.split(' ')[1]
    if (!token) {
        return res.status(401).json({ erro: 'Token não encontrado' })
    }
    try {
        const verify = jwt.verify(token, process.env.JWT_SECRET as string)
        req.user = verify
        next()
    } catch {
        return res.status(401).json({ erro: 'token invalido'})
    }
}

export default porteiro