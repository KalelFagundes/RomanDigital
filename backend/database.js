const Database = require("better-sqlite3");

// Cria ou abre o banco de dados
const db = new Database("romandigital.db");

// Cria a tabela de pedidos
db.exec(`
    CREATE TABLE IF NOT EXISTS pedidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente TEXT NOT NULL,
        endereco TEXT NOT NULL,
        produto TEXT NOT NULL,
        quantidade INTEGER NOT NULL,
        status TEXT DEFAULT 'Pendente'
    )
`);

// Criar tabela de romaneios
db.exec(`
    CREATE TABLE IF NOT EXISTS romaneios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        data_criacao TEXT DEFAULT CURRENT_TIMESTAMP
    )
`);

// Relacionar pedidos aos romaneios
db.exec(`
    CREATE TABLE IF NOT EXISTS romaneio_pedidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        romaneio_id INTEGER NOT NULL,
        pedido_id INTEGER NOT NULL,
        FOREIGN KEY (romaneio_id) REFERENCES romaneios(id),
        FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
        UNIQUE (romaneio_id, pedido_id)
    )
`);

console.log("Banco de dados conectado!");

module.exports = db;