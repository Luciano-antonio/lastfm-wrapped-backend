import express, { Request, Response} from 'express'
import jwt from 'jsonwebtoken'

// Verifica se o token JWT é valido
function porteiro(req: Request, res: Response, next: any) {

    // Pega token do usuario
    const authHeader = req.headers.authorization

    // Extrai o token do header Authorization (formato: "Bearer token")
    const token = authHeader?.split(' ')[1]

    // Se não existir um token retorna um erro
    if (!token) {
        return res.status(401).json({ erro: 'Token não encontrado' })
    }

    // Descodifica o token e valida a assinatura
    try {
        const verify = jwt.verify(token, process.env.JWT_SECRET as string)

        // Salva os dados do token no req para as rotas acessarem 
        req.user = verify
        next()
    } catch {
        return res.status(401).json({ erro: 'token invalido'})
    }
}

export default porteiro