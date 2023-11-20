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
require('dotenv').config();


app.use(cors({ credentials: true, origin: 'http://192.168.86.171:3000' }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

const salt = bcrypt.genSaltSync(10);
const secret = process.env.JWT_SECRET; // encriptacción
const url = process.env.URL_SECRET;
const client = new MongoClient(url);
const adminSecretKey = process.env.ADMIN_SECRET_KEY;

const rateLimitWindowMs = 15 * 60 * 1000; // 15 minutos
const maxRequestsPerWindow = 10; // Máximo de 100 solicitudes por IP en cada ventana de tiempo
const requestCounts = {}; // Almacena el conteo de solicitudes por IP

// Middleware de tasa de límite
const rateLimit = (req, res, next) => {
  const ip = req.ip;
  const currentTime = Date.now();

  if (!requestCounts[ip]) {
    requestCounts[ip] = {
      count: 1,
      startTime: currentTime
    };
  } else {
    requestCounts[ip].count++;
    if (currentTime - requestCounts[ip].startTime > rateLimitWindowMs) {
      // Reinicia el conteo y la ventana de tiempo
      requestCounts[ip] = {
        count: 1,
        startTime: currentTime
      };
    } else if (requestCounts[ip].count > maxRequestsPerWindow) {
      return res.status(429).json({ error: "Demasiadas solicitudes. Por favor, inténtalo de nuevo más tarde." });
    }
  }
  next();
};

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
app.post('/register', rateLimit, async (req, res) => {
  const { username, password, userType, secretKey } = req.body;
  const new_salt = bcrypt.genSaltSync(10);
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!username || typeof username !== 'string' || username.length < 3 || username.length > 10) {
    return res.status(400).json({ error: 'Nombre de usuario inválido. Debe tener entre 3 y 10 caracteres.' });
  }
  if (!passwordRegex.test(req.body.password)) {
    return res.status(400).json({ error: 'La contraseña no cumple con los requisitos de seguridad.' });
  }
  if (userType === "Admin" && secretKey !== adminSecretKey) {
    return res.status(403).json({ error: 'Clave de administrador inválida.' });
  }
  if (!userType || !['Admin', 'User'].includes(userType)) {
    return res.status(400).json({ error: 'Tipo de usuario inválido.' });
  }
  else {
    try {
      const hashedPassword = bcrypt.hashSync(password, new_salt); // encriptamos la contraseña
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
  }
});


// Ruta para iniciar sesión
app.post('/login', rateLimit, async (req, res) => {
  const { username, password } = req.body;

  if (!username || typeof username !== 'string' || username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: 'Nombre de usuario inválido.' });
  }

  if (!password || typeof password !== 'string' || password.length > 20) {
    return res.status(400).json({ error: 'Contraseña inválida.' });
  } else {
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
        }, secret, {expiresIn: '30m'}); // creamos el token único para el usuario que inicia sesión

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
    if (err.name === "TokenExpiredError") {
      res.status(401).json({ error: 'Token expirado' });
    } else {
      res.status(401).json({ error: 'No autenticado' });
    }
  }
});

// Ruta para cerrar sesión
app.post('/logout', (req, res) => {
  res.clearCookie('token').json('ok');
});

// Ruta para crear un post
app.post('/post', rateLimit, uploadMiddlewares.single('file'), async (req, res) => {
  try {
    // Asegúrate de que el archivo se haya subido correctamente
    if (!req.file) {
      return res.status(400).json({ error: 'Archivo no subido correctamente.' });
    }

    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];

    // Validación del formato del archivo (opcional, basado en tus necesidades)
    if (ext !== 'webp') {
      return res.status(400).json({ error: 'Formato de archivo no válido.' });
    }

    const newPath = path + '.' + ext;
    fs.renameSync(path, newPath);

    const decoded = jwt.verify(req.cookies.token, secret);
    const { title, summary, content } = req.body;

    // Validaciones del lado del servidor
    if (!title || title.length < 3) {
      return res.status(400).json({ error: 'Título inválido.' });
    }

    if (!summary || summary.length < 10) {
      return res.status(400).json({ error: 'Resumen inválido.' });
    }

    if (!content || content.length < 20) {
      return res.status(400).json({ error: 'Contenido inválido.' });
    }

    const postDoc = {
      title,
      summary,
      content,
      cover: newPath,
      author: new ObjectId(decoded.id),
      createdAt: new Date(),
    };

    const result = await posts.insertOne(postDoc);
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
