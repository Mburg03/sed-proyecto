const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');  // token para inicio de sesión
const multer = require('multer');
const uploadMiddlewares = multer({ dest: './uploads/' }); // directorio en donde se guardaran los posts
const fs = require('fs');

const salt = bcrypt.genSaltSync(10); // encriptación de la contraseña, método
const secret = 'asdasdasdasdasge';
const cookieParser = require('cookie-parser'); // requerimiento para poder recibir cookies y leerlas


app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));
mongoose.connect('mongodb+srv://mburgosgit003:rt40vh2SFKCCiZBX@cluster0.mgrscfy.mongodb.net/?retryWrites=true&w=majority'); // conectando a la base de datos



app.post('/register', async (req, res) => {
  const { username, password, userType } = req.body;
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
      userType
    });
    res.json(userDoc);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});


app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });
  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (passOk) {
    // logged in
    jwt.sign({ username, id: userDoc._id, userType: userDoc.userType }, secret, {}, (err, token) => {
      if (err) throw err;
      res.cookie('token', token).json({
        id: userDoc._id,
        username,
        userType: userDoc.userType
      });
    });
  } else {
    res.status(400).json('wrong credentials');
  }
});
// recibiendo las cookies del usuario
app.get('/profile', (req, res) => {
  const { token } = req.cookies;

  jwt.verify(token, secret, {}, (err, info) => {
    if (err) throw err;
    res.json(info);
  });
});

app.post('/logout', (req, res) => {
  res.clearCookie('token').json('ok');
});

app.post('/post', uploadMiddlewares.single('file'), async (req, res) => {
  try {
    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path + '.' + ext;
    const { token } = req.cookies;

    fs.renameSync(path, newPath);

    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) {
        res.status(401).json({ error: 'Token no válido.' });
      };
      const { title, summary, content } = req.body;
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover: newPath,
        author: info.id
      });
      res.json(postDoc);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el post.' });
  }
});


app.get('/post', async (req, res) => {
  const posts = await Post.find().populate('author', ['username']).sort({ createdAt: -1 }).limit(20);
  res.json(posts);
});

app.get('/post/:id', async (req, res) => {
  const { id } = req.params;
  postDoc = await Post.findById(id).populate('author', ['username']);
  res.json(postDoc);
});

app.get("/getAllUser", async (req, res) => {
  try {
    const allUser = await User.find({});
    res.send({ status: "ok", data: allUser })
  } catch (error) {
    console.log(error);
  }
})

app.post("/deleteUser", async (req, res) => {
  const { userid } = req.body;
  try {
    const result = await User.deleteOne({ _id: userid });
    console.log(result);
    res.send({ status: "Ok", data: "Deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "Error", data: error.message });
  }
});

app.listen(4000);