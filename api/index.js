const express = require('express');
const app = express();
const cors = require('cors');
const { ObjectId, ServerApiVersion } = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const uploadMiddlewares = multer({ dest: './uploads/' });
const fs = require('fs');
const cookieParser = require('cookie-parser');

const salt = bcrypt.genSaltSync(10);
const secret = 'asdasdasdasdasge'; // valor de encriptacción para la contraseña

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

const url = 'mongodb+srv://mburgosgit003:edckdB9ospbAvn5C@cluster0.mgrscfy.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(url);
let db, users, posts;

// Nos conectamos a la base de datos
async function run() {
  try {
    await client.connect();
    console.log("Conectado exitosamente a MongoDB");

    db = client.db('Blog-bd');
    users = db.collection('users');
    posts = db.collection('posts');

  } catch (err) {
    console.error("Error al conectar a MongoDB:", err);
  }
}
run();

// Ruta para registrarse
app.post('/register', async (req, res) => {
  const { username, password, userType } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, salt); // encriptamos la contraseña
    const userDoc = await users.insertOne( // insertamos el nuevo usuario a la coleccion "users"
      {
        username,
        password: hashedPassword,
        userType
      }
    );
    res.json(userDoc);
  } catch (e) {
    console.log(e);
    res.status(400).json(e.toString());
  }
});

// Ruta para iniciar sesión
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await users.findOne({ username }); // buscamos el usuario en base al username que tenga en la colección users
    if (!userDoc) {
      return res.status(400).json('Usuario no encontrado');
    }

    const passOk = bcrypt.compareSync(password, userDoc.password); // compaamos la contraseña encriptada
    if (passOk) {
      const token = jwt.sign({
        username,
        id: userDoc._id,
        userType: userDoc.userType
      }, secret); // creamos el token único para el usuario que inicia sesión

      res.cookie('token', token).json({
        id: userDoc._id,
        username,
        userType: userDoc.userType
      }); // mandamos el token mediante cookies para no mandar información mediante el url
    } else {
      res.status(400).json('Credenciales incorrectas');
    }
  } catch (e) {
    console.error(e);
    res.status(500).json(e.toString());
  }
});

// Ruta para saber cuando un usuario ha iniciado o no sesión asi dar el Home para visitantes o para usuarios
app.get('/profile', async (req, res) => {
  const { token } = req.cookies; // obtenemos el token de las cookies
  try {
    const decoded = jwt.verify(token, secret); // verificamos
    res.json(decoded);
  } catch (err) {
    console.log("Usuario sin iniciar sesión.");
    res.status(401).json({ error: 'No autenticado' });
  }
});

// Ruta para cerrar sesión
app.post('/logout', (req, res) => {
  res.clearCookie('token').json('ok');
});

// Ruta para crear un post
app.post('/post', uploadMiddlewares.single('file'), async (req, res) => {
  try {
    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path + '.' + ext;
    fs.renameSync(path, newPath);
    const decoded = jwt.verify(req.cookies.token, secret);
    const { title, summary, content } = req.body;
    const postDoc = {
      title,
      summary,
      content,
      cover: newPath,
      author: new ObjectId(decoded.id),
      createdAt: new Date(),  // Aqui a diferencia de mongoose debemos crear un objeto Date en el esquema.
    };
    const result = await posts.insertOne(postDoc); // insertamos el post en la colección "posts"
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al crear el post.' });
  }
});


app.get('/post', async (req, res) => {
  try {
    let postDocs = await posts.find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Para cada post, busca la información del autor y  la añade al post usando map
    postDocs = await Promise.all(postDocs.map(async post => {
      const authorInfo = await users.findOne({ _id: post.author }, { projection: { username: 1 } });
      return { ...post, authorName: authorInfo ? authorInfo.username : "Desconocido" };
    }));

    res.json(postDocs);
  } catch (error) {
    console.error(error);
    res.status(500).json(error.toString());
  }
});


app.get("/getAllPosts", async (req, res) => {
  try {
    let allPosts = await posts.find({})
      .sort({ createdAt: -1 })
      .toArray();

    allPosts = await Promise.all(allPosts.map(async post => {
      const authorInfo = await users.findOne({ _id: post.author }, { projection: { username: 1 } });
      return { ...post, authorName: authorInfo ? authorInfo.username : "Desconocido" };
    }));

    res.json(allPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json(error.toString());
  }

});


// Conseguimos un único post en base a su id 
app.get('/post/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Convertimos el ID de string a un ObjectId de MongoDB
    const postDoc = await posts.findOne({ _id: new ObjectId(id) });

    // Si el post existe, busca la información del autor.
    if (postDoc) {
      const authorInfo = await users.findOne({ _id: postDoc.author }, { projection: { username: 1 } });

      // Agrega la información del autor al documento del post.
      // Crea una nueva propiedad en postDoc para el autor.
      postDoc.authorInfo = authorInfo;

      res.json(postDoc);
    } else {
      res.status(404).json({ error: "Post no encontrado" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al buscar el post.' });
  }
});


// ...
app.get("/getAllUser", async (req, res) => {
  try {
    const allUser = await users.find({}).toArray();
    res.json({ status: "ok", data: allUser });
  } catch (error) {
    console.log(error);
    res.status(500).json(error.toString());
  }
});


// ...
app.post("/deleteUser", async (req, res) => {
  const { userid } = req.body;
  try {
    const result = await users.deleteOne({ _id: new ObjectId(userid) });
    if (result.deletedCount === 1) {
      res.json({ status: "Ok", data: "Eliminado" });
    } else {
      res.status(404).json({ status: "Error", data: "Usuario no encontrado" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "Error", data: error.message });
  }
});


// ...
app.post("/deletePost", async (req, res) => {
  const { postid } = req.body;
  try {
    const result = await posts.deleteOne({ _id: new ObjectId(postid) });
    if (result.deletedCount === 1) {
      res.json({ status: "Ok", data: "Eliminado" });
    } else {
      res.status(404).json({ status: "Error", data: "Post no encontrado" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "Error", data: error.message });
  }
});


app.listen(4000);
