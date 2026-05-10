import express, { Request, Response } from 'express'
import cors from 'cors'
import authRouter from './src/routes/auth.js'
import musicRouter from './src/routes/music.js'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'

const app = express()
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
})
app.use(helmet())
app.use(cors({
    origin: true
}))
app.use(express.json())
app.use(limiter)
app.use(authRouter)
app.use(musicRouter)

app.listen(3000, () => {
    console.log("Servidor funcionando!")
})