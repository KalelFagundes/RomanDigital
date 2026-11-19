

async function carregarDashboard() {
    try {
        const respostaPedidos = await fetch("http://localhost:3000/pedidos");
        const pedidos = await respostaPedidos.json();

        const total = pedidos.length;
        const entregues = pedidos.filter(
            pedido => pedido.status === "Entregue"
        ).length;

        const pendentes = pedidos.filter(
            pedido => pedido.status === "Pendente"
        ).length;

        document.getElementById("totalPedidos").textContent = total;
        document.getElementById("entregues").textContent = entregues;
        document.getElementById("pendentes").textContent = pendentes;
        document.getElementById("emAndamento").textContent = pendentes;

    } catch (erro) {
        console.error("Erro ao carregar indicadores:", erro);
    }
}

carregarDashboard();


function destacarMenu(elemento) {
    const links = document.querySelectorAll(".sidebar nav a");

    links.forEach(link => {
        link.classList.remove("active");
    });

    elemento.classList.add("active");
}

// Mostrar Dashboard
function mostrarDashboard() {
    document.getElementById("tela-dashboard").style.display = "block";
    document.getElementById("tela-pedidos").style.display = "none";
    document.getElementById("tela-romaneios").style.display = "none";
}

// Mostrar Pedidos
async function mostrarPedidos() {
    document.getElementById("tela-dashboard").style.display = "none";
    document.getElementById("tela-pedidos").style.display = "block";
    document.getElementById("tela-romaneios").style.display = "none";

    const lista = document.getElementById("lista-pedidos");
    lista.innerHTML = "Carregando pedidos...";

    try {
        const resposta = await fetch("http://localhost:3000/pedidos");
        const pedidos = await resposta.json();

        if (pedidos.length === 0) {
            lista.innerHTML = "Nenhum pedido cadastrado.";
            return;
        }

        lista.innerHTML = pedidos.map(pedido => `
            <div class="card">
                <h3>Pedido #${pedido.id}</h3>
                <p><strong>Cliente:</strong> ${pedido.cliente}</p>
                <p><strong>Endereço:</strong> ${pedido.endereco}</p>
                <p><strong>Produto:</strong> ${pedido.produto}</p>
                <p><strong>Quantidade:</strong> ${pedido.quantidade}</p>
                <p><strong>Status:</strong> ${pedido.status}</p>

                <button onclick="atualizarStatus(${pedido.id}, '${pedido.status === "Pendente" ? "Entregue" : "Pendente"}')">
                    ${pedido.status === "Pendente" ? "Marcar como Entregue" : "Voltar para Pendente"}
                </button>
            </div>
        `).join("");

    } catch (erro) {
        lista.innerHTML = "Erro ao carregar pedidos.";
        console.error(erro);
    }
}


 // Mostrar Romaneios e carregar pedidos disponíveis
async function mostrarRomaneios() {
    document.getElementById("tela-dashboard").style.display = "none";
    document.getElementById("tela-pedidos").style.display = "none";
    document.getElementById("tela-romaneios").style.display = "block";

    // Buscar romaneios já criados
    const listaRomaneios = document.getElementById("lista-romaneios");
    listaRomaneios.innerHTML = "Carregando romaneios...";

    try {
        const respostaRomaneios = await fetch("http://localhost:3000/romaneios");
        const romaneios = await respostaRomaneios.json();

        if (romaneios.length === 0) {
            listaRomaneios.innerHTML = "Nenhum romaneio criado.";
        } else {
            listaRomaneios.innerHTML = romaneios.map(romaneio => `
                <div class="card">
                    <h3>Romaneio #${romaneio.id}</h3>
                    <p><strong>Nome:</strong> ${romaneio.nome}</p>
                    <p><strong>Data:</strong> ${romaneio.data_criacao}</p>
                    <p><strong>Total de pedidos:</strong> ${romaneio.total_pedidos}</p>
                    <button onclick="mostrarDetalhesRomaneio(${romaneio.id})">
    Ver pedidos
</button>
                </div>
            `).join("");
        }
    } catch (erro) {
        listaRomaneios.innerHTML = "Erro ao carregar romaneios.";
        console.error(erro);
    }

    const selecao = document.getElementById("selecao-pedidos");
    selecao.innerHTML = "Carregando pedidos...";

    try {
        const resposta = await fetch("http://localhost:3000/pedidos");

        if (!resposta.ok) {
            throw new Error("Não foi possível buscar os pedidos.");
        }

        const pedidos = await resposta.json();

        if (pedidos.length === 0) {
            selecao.innerHTML = "Nenhum pedido cadastrado.";
            return;
        }

        selecao.innerHTML = pedidos
            .filter(pedido => pedido.status === "Pendente")
            .map(pedido => `
                <label style="display: block; margin: 10px 0;">
                    <input type="checkbox" name="pedidoSelecionado" value="${pedido.id}">
                    Pedido #${pedido.id} - ${pedido.cliente}
                    | ${pedido.produto}
                    | Quantidade: ${pedido.quantidade}
                </label>
            `).join("");

        if (!selecao.innerHTML) {
            selecao.innerHTML = "Não há pedidos pendentes para selecionar.";
        }

    } catch (erro) {
        selecao.innerHTML = "Erro ao carregar pedidos.";
        console.error(erro);
    }
}


// Cadastrar pedido
document.getElementById("form-pedido").addEventListener("submit", async function(event) {
    event.preventDefault();

    const cliente = document.getElementById("cliente").value;
    const endereco = document.getElementById("endereco").value;
    const produto = document.getElementById("produto").value;
    const quantidade = Number(document.getElementById("quantidade").value);

    try {
        const resposta = await fetch("http://localhost:3000/pedidos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                cliente,
                endereco,
                produto,
                quantidade
            })
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || "Não foi possível cadastrar o pedido.");
        }

        alert("Pedido cadastrado com sucesso!");

        document.getElementById("form-pedido").reset();

        mostrarPedidos();
carregarDashboard();

    } catch (erro) {
        alert("Erro ao cadastrar pedido. Verifique se o servidor está funcionando.");
        console.error(erro);
    }
});

// Atualizar status do pedido
async function atualizarStatus(id, novoStatus) {
    try {
        const resposta = await fetch(
            `http://localhost:3000/pedidos/${id}/status`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status: novoStatus
                })
            }
        );

        if (!resposta.ok) {
            throw new Error("Erro ao atualizar pedido");
        }

        alert("Status atualizado com sucesso!");

        mostrarPedidos();
carregarDashboard();
    } catch (erro) {
        alert("Não foi possível atualizar o status.");
        console.error(erro);
    }
}

 // Cadastrar novo romaneio
document.getElementById("form-romaneio").addEventListener("submit", async function(event) {
    event.preventDefault();

    const nome = document.getElementById("nome-romaneio").value;

    const pedidosSelecionados = Array.from(
        document.querySelectorAll('input[name="pedidoSelecionado"]:checked')
    ).map(input => Number(input.value));

    if (pedidosSelecionados.length === 0) {
        alert("Selecione pelo menos um pedido!");
        return;
    }

    try {
        const resposta = await fetch("http://localhost:3000/romaneios", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome: nome,
                pedidos: pedidosSelecionados
            })
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || "Erro ao criar romaneio.");
        }

        alert("Romaneio criado com sucesso!");

        document.getElementById("form-romaneio").reset();

        mostrarRomaneios();

    } catch (erro) {
        alert(erro.message);
        console.error(erro);
    }
});

// Mostrar detalhes dos pedidos de um romaneio

// Mostrar detalhes dos pedidos de um romaneio
async function mostrarDetalhesRomaneio(id) {
    const areaDetalhes = document.getElementById("detalhes-romaneio");
    const listaDetalhes = document.getElementById("lista-detalhes-pedidos");

    areaDetalhes.style.display = "block";
    listaDetalhes.innerHTML = "Carregando pedidos...";

    try {
        const resposta = await fetch(
            `http://localhost:3000/romaneios/${id}/pedidos`
        );

        if (!resposta.ok) {
            throw new Error("Não foi possível buscar os pedidos.");
        }

        const pedidos = await resposta.json();

        if (pedidos.length === 0) {
            listaDetalhes.innerHTML = "Este romaneio não possui pedidos.";
            return;
        }

        listaDetalhes.innerHTML = pedidos.map(pedido => `
            <div class="card" style="margin-bottom: 15px; padding: 20px;">
                <h3>Pedido #${pedido.id}</h3>
                <p><strong>Cliente:</strong> ${pedido.cliente}</p>
                <p><strong>Endereço:</strong> ${pedido.endereco}</p>
                <p><strong>Produto:</strong> ${pedido.produto}</p>
                <p><strong>Quantidade:</strong> ${pedido.quantidade}</p>
                <p><strong>Status:</strong> ${pedido.status}</p>
            </div>
        `).join("");

        areaDetalhes.scrollIntoView({ behavior: "smooth" });

    } catch (erro) {
        listaDetalhes.innerHTML = "Erro ao carregar os pedidos.";
        console.error(erro);
    }
}



