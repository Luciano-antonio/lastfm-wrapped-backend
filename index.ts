import express, { Request, Response } from 'express'
import cors from 'cors'
import authRouter from './src/routes/auth'
import musicRouter from './src/routes/music'

const app = express()
app.use(cors({
    origin: true
}))
app.use(express.json())
app.use(authRouter)
app.use(musicRouter)

app.listen(3000, () => {
    console.log("Servidor funcionando!")
})