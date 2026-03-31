import express, { Request, Response} from 'express'
import jwt from 'jsonwebtoken'

function porteiro(req: Request, res: Response, next: any) {
    const token = req.headers.authorization
    if (!token) {
        return res.status(401).json({ erro: 'Token não encontrado' })
    }
    try {
        const verify = jwt.verify(token, process.env.JWT_SECRET as string)
        next()
    } catch {
        return res.status(401).json({ erro: 'token invalido'})
    }
}

export default porteiro