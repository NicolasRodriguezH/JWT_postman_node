const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const keys = require('./settings/keys')

app.get('/', (req, res) => {
    res.send('Si estas autenticado ingresa a la ruta "/info"')
})

app.set('key', keys.key)
app.use(express.urlencoded({extended:false}))
app.use(express.json())


app.post('/login', (req, res) => {
    if (req.body.user == "superuser" && req.body.pass == "12345") {
    
        const payload = {
            check: true
        }
        const token = jwt.sign(payload, app.get('key'), {
            expiresIn: '7d'
        })
        res.json({
            msg: 'Autenticacion exitosa',
            token: token
        })
    }else{
        res.json({
            msg: 'Los datos no son correctos validacion anulada'
        })
    }
})

// Middleware para proteger las peticiones no deseadas!
const verification = express.Router()
verification.use((req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization']
    console.log(token)

    if(!token){
        res.status(401).send({
            error: 'Es necesario el token para la autenticacion'
        })
        return
    }
    if(token.startsWith('Bearer ')){
        token = token.slice(7, token.length)
    }
    if(token){
        jwt.verify(token, app.get('key'), (error, decoded) => {
            if (error) {
                return res.json({
                    msg: 'El token ingresado no es valido'
                })
            } else {
                req.decoded = decoded
                next()
            }
        })
    }
})

app.get('/info', verification, (req, res) => {
    res.send('Informacion Confidencial recuperada por medio de Jsonwebtoken')
})


app.listen(8000, () => {
    console.log('Server is running in port: http://localhost:8000')
})