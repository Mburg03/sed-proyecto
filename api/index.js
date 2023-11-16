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
const secret = 'asdasdasdasdasge';

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

const url = 'mongodb+srv://mburgosgit003:edckdB9ospbAvn5C@cluster0.mgrscfy.mongodb.net/?retryWrites=true&w=majority'; // Reemplaza con tu URI de conexión real
const client = new MongoClient(url);

let db, users, posts;
async function run() {
  try {
    await client.connect();
    console.log("Conectado exitosamente a MongoDB");

    db = client.db('Blog-bd');
    users = db.collection('users');
    posts = db.collection('posts');
    // Aquí puedes seguir con la configuración de tus rutas de Express u otras operaciones

  } catch (err) {
    console.error("Error al conectar a MongoDB:", err);
  }
}
run();


app.post('/register', async (req, res) => {
  const { username, password, userType } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, salt);
    const userDoc = await users.insertOne(
      {
        username,
        password: hashedPassword,
        userType
      }
    );
    res.json(userDoc);
    // Devuelve el documento insertado
  } catch (e) {
    console.log(e);
    res.status(400).json(e.toString());
  }
});


app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await users.findOne({ username });
    if (!userDoc) {
      return res.status(400).json('Usuario no encontrado');
    }

    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      const token = jwt.sign({
        username,
        id: userDoc._id,
        userType: userDoc.userType
      }, secret);

      res.cookie('token', token).json({
        id: userDoc._id,
        username,
        userType: userDoc.userType
      });
    } else {
      res.status(400).json('Credenciales incorrectas');
    }
  } catch (e) {
    console.error(e);
    res.status(500).json(e.toString());
  }
});

// ... 

app.get('/profile', async (req, res) => {
  const { token } = req.cookies;

  try {
    const decoded = jwt.verify(token, secret);
    res.json(decoded);
  } catch (err) {
    console.log("Usuario sin iniciar sesión.");
    res.status(401).json({ error: 'No autenticado' });
  }
});

// ...

app.post('/logout', (req, res) => {
  res.clearCookie('token').json('ok');
});

// ...

app.post('/post', uploadMiddlewares.single('file'), async (req, res) => {
  try {
    // Asumiendo que la subida del archivo y la obtención del nuevo path es correcta.
    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path + '.' + ext;
    fs.renameSync(path, newPath);

    // Verificas el token una vez y usas el resultado (decoded).
    const decoded = jwt.verify(req.cookies.token, secret);

    // No necesitas verificar el token una segunda vez, así que elimina esta parte.
    // Simplemente continúa con la creación del documento post.
    const { title, summary, content } = req.body;
    const postDoc = {
      title,
      summary,
      content,
      cover: newPath,
      author: new ObjectId(decoded.id), // Asegúrate de que decoded.id exista.
      createdAt: new Date(), // Añade la fecha y hora actuales
    };
    const result = await posts.insertOne(postDoc);
    res.json(result); // Devuelve el documento insertado.
  } catch (error) {
    // El catch ahora atrapará tanto los errores de la inserción como los posibles errores de jwt.verify.
    console.log(error);
    res.status(500).json({ error: 'Error al crear el post.' });
  }
});


// ...

app.get('/post', async (req, res) => {
  try {
    let postDocs = await posts.find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Para cada post, busca la información del autor y añádela al post.
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

    // Para cada post, busca la información del autor y añádela al post.
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



// ...

app.get('/post/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Asegúrate de convertir el ID de string a un ObjectId de MongoDB
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

// ...

app.listen(4000);
