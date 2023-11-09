const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const salt =bcrypt.genSaltSync(10); // encriptación de la contraseña, método
const secret = 'asdasdasdasdasge'; 


app.use(cors({credentials:true, origin:'http://localhost:3000'}))
app.use(express.json());

mongoose.connect('mongodb+srv://mburgosgit003:rt40vh2SFKCCiZBX@cluster0.mgrscfy.mongodb.net/?retryWrites=true&w=majority');


app.post('/register', async(req, res) => {
    const {username, password} = req.body;
    try{
        const userDoc = await User.create({
            username, password:bcrypt.hashSync(password, salt) // aca este es el proceso de encriptación de la contraseña usando el método de salt
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
      // logged in
      jwt.sign({username,id:userDoc._id}, secret, {}, (err,token) => {
        if (err) throw err;
        res.cookie('token', token).json({
          id:userDoc._id,
          username,
        });
      });
    } else {
      res.status(400).json('wrong credentials');
    }
  });

app.listen(4000);

//mburgosgit003
// rt40vh2SFKCCiZBX
// 