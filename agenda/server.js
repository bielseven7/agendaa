const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Conexão com o banco de dados SQLite
const db = new sqlite3.Database('./appointments.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
    }
});

// Cria a tabela de agendamentos se não existir
db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL
    )
`);

// Rota para salvar agendamento
app.post('/appointments', (req, res) => {
    const { name, email, date, time } = req.body;

    if (!name || !email || !date || !time) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const query = `INSERT INTO appointments (name, email, date, time) VALUES (?, ?, ?, ?)`;
    db.run(query, [name, email, date, time], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Erro ao salvar o agendamento.' });
        }
        res.status(201).json({ id: this.lastID, message: 'Agendamento salvo com sucesso!' });
    });
});

// Rota para listar agendamentos
app.get('/appointments', (req, res) => {
    const query = `SELECT * FROM appointments ORDER BY date, time`;
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar os agendamentos.' });
        }
        res.json(rows);
    });
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});