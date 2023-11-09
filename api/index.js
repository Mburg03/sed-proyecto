const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');  // token para inicio de sesión

const salt =bcrypt.genSaltSync(10); // encriptación de la contraseña, método
const secret = 'asdasdasdasdasge'; 
const cookieParser = require('cookie-parser'); // requerimiento para poder recibir cookies y leerlas

app.use(cors({credentials:true, origin:'http://localhost:3000'}))
app.use(express.json());
app.use(cookieParser());
mongoose.connect('mongodb+srv://mburgosgit003:rt40vh2SFKCCiZBX@cluster0.mgrscfy.mongodb.net/?retryWrites=true&w=majority'); // conectando a la base de datos


app.post('/register', async(req, res) => {
    const {username, password} = req.body;
    try{
        const userDoc = await User.create({
            username, password:bcrypt.hashSync(password, salt) // proceso de encriptación de la contraseña usando el método de salt
        });
        res.json(userDoc);
    } catch(e){
        res.status(400).json(e)
    }
});


app.post('/login', async (req,res) => {
    const {username,password} = req.body;
    const userDoc = await User.findOne({username});
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      // inicio de sesión correcta
      jwt.sign({username,id:userDoc._id}, secret, {}, (err,token) => {
        if (err) throw err;
        res.cookie('token', token).json({
          id:userDoc._id,
          username,
        });// mandando el token no como json, sino como cookies hacia el usuario
      });
    } else {
      res.status(400).json('credenciales incorrectas.');
    }
});

// recibiendo las cookies del usuario
app.get('/profile', (req, res) => {
    const { token } = req.cookies;

    if (!token) {
        // Si no hay token presente, aún consideramos la solicitud exitosa, pero devolvemos un objeto vacío en lugar de lanzar un error
        return res.json({});
    }

    jwt.verify(token, secret, (err, info) => {
        if (err) {
            // Si hay un error al verificar el token, aún consideramos la solicitud exitosa, pero devolvemos un objeto vacío en lugar de lanzar un error
            return res.json({});
        }

        // Si la verificación del token es exitosa, devolvemos la información del usuario
        res.json(info);
    });
});

app.post('/logout', (req,res) => {
    res.clearCookie('token').json('ok');
});

app.post('/post', (req, res) => {
    
});

app.listen(4000);


// mongoose information
//mburgosgit003
// rt40vh2SFKCCiZBX
