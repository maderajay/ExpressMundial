
import express from 'express';
import { config } from 'dotenv';
import { MongoClient } from 'mongodb';


config(); 
// Para cargar variables de entorno

const app = express();
const PORT = process.env.PORT;

// Middleware para entender JSON en las peticiones
app.use(express.json());

// Configuración de MongoDB
const url = process.env.DB_URI;
const client = new MongoClient(url);
const dbName = 'mundial';
let db;

// Conectar a la Base de Datos al iniciar el servidor
async function connectDB() {
    try {
        await client.connect();
        console.log(' Conectado con éxito a MongoDB');
        db = client.db(dbName);
    } catch (error) {
        console.error(' Error al conectar a MongoDB:', error);
        process.exit(1); // Detener la app si no hay base de datos
    }
}

// --- RUTAS DE EXPRESS ---

app.get('/', (req, res) => {
    res.json({ mensaje: '¡usando express y mongodb a la API REST!' });
});

app.get('/paises', async (req, res) => {
    try {
        const paises = await db.collection('paises').find({}).toArray();
        res.json(paises);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener paises' });
    }
});

app.get('/paises/orden/:ord', async (req, res) => {
    try {
		
		const  params  = req.params;
		const ord = parseInt(params.ord);
		
        const paises = await db.collection('paises').find({}).sort({ pais: ord }).toArray();
        res.json(paises);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener paises' });
    }
});

//////////////////////////

app.get('/partidos/orden/:pais/:ord', async (req, res) => {
    try {
		
		const  params  = req.params;
		const ord = parseInt(params.ord);
		const pais = params.pais;
		
        const partidos = await db.collection('partidos').find({paislocal: pais}).sort({ numeral: ord }).toArray();
        res.json(partidos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener partidos' });
    }
});

app.get('/partidos', async (req, res) => {
    try {
        const partidos = await db.collection('partidos').find({}).toArray();
        res.json(partidos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener partidos' });
    }
});

app.get('/partidos/:numeral', async (req, res) => {
    try {
		const  params  = req.params;
		const numeral = parseInt(params.numeral);
		
		const partidos = await db.collection('partidos').find({'numeral':numeral}).toArray();
        res.json(partidos);
		
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener partidos' });
    }
});


app.get('/partidos/grupo/:grupo', async (req, res) => {
    try {
		const  params  = req.params;
		const grupo = params.grupo.toLowerCase();
		
		const grupoModificado = grupo.charAt(0).toUpperCase() + grupo.slice(1);
		
		const partidos = await db.collection('partidos').find({'grupo':grupoModificado}).toArray();
        res.json(partidos);
		
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener partidos' });
    }
});



// 1. Obtener todos los elementos (Equivalente al find() de tu página)
app.get('/usuarios', async (req, res) => {
    try {
        const usuarios = await db.collection('usuarios').find({}).toArray();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// 2. Insertar un nuevo elemento
app.post('/usuarios', async (req, res) => {
    try {
        const nuevoUsuario = req.body;
        const resultado = await db.collection('usuarios').insertOne(nuevoUsuario);
        res.status(201).json({ mensaje: 'Usuario creado', id: resultado.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear usuario' });
    }
});

// Iniciar servidor tras conectar la base de datos
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
    });
});