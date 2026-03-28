
import express, { Request, Response } from 'express'
const app = express()
app.use(express.json())
import authRouter from './src/routes/auth'
app.use(authRouter)
import musicRouter from './src/routes/music'
app.use(musicRouter)


app.listen(3000, () => {
    console.log("Servidor funcionando!")
})