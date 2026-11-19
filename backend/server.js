
const express = require("express");
const cors = require("cors");
const db = require("./database");
const app = express();

app.use(cors());
app.use(express.json());

// Rota inicial do RomanDigital
app.get("/", (req, res) => {
    res.json({
        sistema: "RomanDigital",
        mensagem: "Servidor funcionando!",
        status: "Online"
    });
});
// Listar pedidos cadastrados
app.get("/pedidos", (req, res) => {
    const pedidos = db.prepare("SELECT * FROM pedidos").all();
    res.json(pedidos);
});

// Cadastrar novo pedido
app.post("/pedidos", (req, res) => {
    const { cliente, endereco, produto, quantidade } = req.body;

    const resultado = db.prepare(`
        INSERT INTO pedidos (cliente, endereco, produto, quantidade)
        VALUES (?, ?, ?, ?)
    `).run(cliente, endereco, produto, quantidade);

    res.json({
        mensagem: "Pedido cadastrado com sucesso!",
        id: resultado.lastInsertRowid
    });
});

// Atualizar status do pedido
app.put("/pedidos/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pendente", "Entregue"].includes(status)) {
        return res.status(400).json({
            erro: "Status inválido!"
        });
    }

    const resultado = db.prepare(
        "UPDATE pedidos SET status = ? WHERE id = ?"
    ).run(status, id);

    if (resultado.changes === 0) {
        return res.status(404).json({
            erro: "Pedido não encontrado!"
        });
    }

    res.json({
        mensagem: "Status atualizado com sucesso!"
    });
});

// Criar novo romaneio
app.post("/romaneios", (req, res) => {
    const { nome, pedidos } = req.body;

    if (!nome || !Array.isArray(pedidos) || pedidos.length === 0) {
        return res.status(400).json({
            erro: "Informe um nome e selecione pelo menos um pedido."
        });
    }

    const criarRomaneio = db.transaction(() => {
        const resultado = db.prepare(
            "INSERT INTO romaneios (nome) VALUES (?)"
        ).run(nome);

        const romaneioId = resultado.lastInsertRowid;

        const inserirPedido = db.prepare(
            "INSERT INTO romaneio_pedidos (romaneio_id, pedido_id) VALUES (?, ?)"
        );

        for (const pedidoId of pedidos) {
            const pedido = db.prepare(
                "SELECT id FROM pedidos WHERE id = ? AND status = 'Pendente'"
            ).get(pedidoId);

            if (!pedido) {
                throw new Error("Um dos pedidos não existe ou não está pendente.");
            }

            inserirPedido.run(romaneioId, pedidoId);
        }

        return romaneioId;
    });

    try {
        const id = criarRomaneio();

        res.status(201).json({
            mensagem: "Romaneio criado com sucesso!",
            id
        });
    } catch (erro) {
        res.status(400).json({
            erro: erro.message
        });
    }
});

// Listar romaneios criados
app.get("/romaneios", (req, res) => {
    const romaneios = db.prepare(`
        SELECT
            r.id,
            r.nome,
            r.data_criacao,
            COUNT(rp.pedido_id) AS total_pedidos
        FROM romaneios r
        LEFT JOIN romaneio_pedidos rp
            ON rp.romaneio_id = r.id
        GROUP BY r.id
        ORDER BY r.id DESC
    `).all();

    res.json(romaneios);
});

// Listar romaneios criados
app.get("/romaneios", (req, res) => {
    const romaneios = db.prepare(`
        SELECT
            r.id,
            r.nome,
            r.data_criacao,
            COUNT(rp.pedido_id) AS total_pedidos
        FROM romaneios r
        LEFT JOIN romaneio_pedidos rp
            ON rp.romaneio_id = r.id
        GROUP BY r.id
        ORDER BY r.id DESC
    `).all();

    res.json(romaneios);
});

 // Consultar os pedidos de um romaneio
app.get("/romaneios/:id/pedidos", (req, res) => {
    const { id } = req.params;

    const pedidos = db.prepare(`
        SELECT
            p.id,
            p.cliente,
            p.endereco,
            p.produto,
            p.quantidade,
            p.status
        FROM pedidos p
        INNER JOIN romaneio_pedidos rp
            ON p.id = rp.pedido_id
        WHERE rp.romaneio_id = ?
    `).all(id);

    res.json(pedidos);
});

// Inicialização do servidor
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`RomanDigital rodando em http://localhost:${PORT}`);
});
