process.env.JWT_SECRET='teste521'

import { describe, it, vi, expect } from "vitest"
import request from 'supertest'
import app from '../app'
import jwt from 'jsonwebtoken'


const token = jwt.sign({ id: 1, email: 'teste@gmail.com' },'teste521')


// Mock da query rota /Callback
vi.mock('../database/index.ts', () => ({
    default : {
        query: vi.fn().mockResolvedValue({ rows: [{ id: 1}]})
    }
}))

// fetch rota callback
global.fetch = vi.fn().mockResolvedValue({
    json: vi.fn().mockResolvedValue({ session: { key: 'teste431', name: 'keyteste1234'}})
})

describe('/login', () => {
    it('Deve logar o usuario e redireciona-lo para login no last.fm', async () => {
        const res = await request(app)
        .get('/login')
        expect(res.status).toBe(302)
    })
})

describe('/callback', () => {
    it('Deve criar o token do usuario e enseri-lo no banco de dados e redirecionar o usuario para o dashboard', async () => {
        const res = await request(app)
        .get('/callback?token=tokenfake')
        expect(res.status).toBe(302)
    })
})