
function mostrarLogin() {
    document.getElementById("areaLogin").style.display = "block";
}
function pegarUsuarios() {
    return JSON.parse(localStorage.getItem("usuarios")) || [];
}

function salvarUsuarios(usuarios) {
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

function pegarProdutos() {
    return JSON.parse(localStorage.getItem("produtos")) || [];
}

function salvarProdutos(produtos) {
    localStorage.setItem("produtos", JSON.stringify(produtos));
}

function login() {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const usuarios = pegarUsuarios();
    let encontrado = false;

    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email == email && usuarios[i].senha == senha) {
            encontrado = true;
            break;
        }
    }

    if (encontrado) {
        localStorage.setItem("usuarioLogado", email);
        window.location.href = "home.html";
    } else {
        alert("Email ou senha incorretos.");
    }
}

function cadastro() {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const palavra_passe = document.getElementById("palavra_passe").value;
    const nascimento = document.getElementById("nascimento").value;

    if (email == "" || senha == "" || palavra_passe == "" || nascimento == "") {
        alert("Preencha todos os campos.");
        return;
    }

    const usuarios = pegarUsuarios();

    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email == email) {
            alert("Este email ja esta cadastrado.");
            return;
        }
    }

    usuarios.push({
        email: email,
        senha: senha,
        palavra_passe: palavra_passe,
        nascimento: nascimento
    });

    salvarUsuarios(usuarios);

    alert("Conta criada com sucesso.");
    window.location.href = "index.html";
}

function recuperarSenha() {
    const email = document.getElementById("email").value;
    const nascimento = document.getElementById("nascimento").value;
    const nova_senha = document.getElementById("nova_senha").value;

    const usuarios = pegarUsuarios();
    let encontrado = false;

    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email == email && usuarios[i].nascimento == nascimento) {
            if (nova_senha == "") {
                alert("Digite a nova senha.");
                return;
            }

            usuarios[i].senha = nova_senha;
            encontrado = true;
            break;
        }
    }

    if (encontrado) {
        salvarUsuarios(usuarios);
        alert("Senha alterada com sucesso.");
        window.location.href = "index.html";
    } else {
        alert("Email ou data de nascimento incorretos.");
    }
}

function protegerPagina() {
    const usuario = localStorage.getItem("usuarioLogado");

    if (usuario == null) {
        window.location.href = "index.html";
    }
}

function iniciarHome() {
    protegerPagina();

    const usuario = localStorage.getItem("usuarioLogado");
    document.getElementById("usuarioLogado").innerHTML = usuario;

    const produtos = pegarProdutos();

    let totalProdutos = 0;
    for (let i = 0; i < produtos.length; i++) {
        if (Number(produtos[i].quantidade) > 0) {
            totalProdutos++;
        }
    }

    let totalEntradas = 0;
    let totalSaidas = 0;

    const hoje = new Date();
    const limite = new Date();
    limite.setDate(hoje.getDate() - 7);

    for (let i = 0; i < produtos.length; i++) {
        if (produtos[i].dataEntrada != "" && dataNosUltimosDias(produtos[i].dataEntrada, limite)) {
            totalEntradas++;
        }

        if (produtos[i].dataSaida != "" && dataNosUltimosDias(produtos[i].dataSaida, limite)) {
            totalSaidas++;
        }
    }

    document.getElementById("totalProdutos").innerHTML = totalProdutos;
    document.getElementById("totalEntradas").innerHTML = totalEntradas;
    document.getElementById("totalSaidas").innerHTML = totalSaidas;
}

function dataNosUltimosDias(dataTexto, limite) {
    const partes = dataTexto.split("-");
    const data = new Date(partes[0], partes[1] - 1, partes[2]);

    return data >= limite;
}

function cadastrarEntrada() {
    protegerPagina();

    const codigo = document.getElementById("codigo").value;
    const descricao = document.getElementById("descricao").value;
    const quantidade = Number(document.getElementById("quantidade").value);
    const categoria = document.getElementById("categoria").value;
    const dataEntrada = document.getElementById("dataEntrada").value;
    const dataSaida = document.getElementById("dataSaida").value;

    if (codigo == "" || descricao == "" || quantidade <= 0 || categoria == "" || dataEntrada == "") {
        document.getElementById("mensagem").innerHTML = "Preencha os dados corretamente.";
        return;
    }

    const produtos = pegarProdutos();
    let produtoEncontrado = false;

    for (let i = 0; i < produtos.length; i++) {
        if (produtos[i].codigo == codigo) {
            produtos[i].quantidade = Number(produtos[i].quantidade) + quantidade;
            produtos[i].descricao = descricao;
            produtos[i].categoria = categoria;
            produtos[i].dataEntrada = dataEntrada;

            if (dataSaida != "") {
                produtos[i].dataSaida = dataSaida;
            }

            produtoEncontrado = true;
            break;
        }
    }

    if (!produtoEncontrado) {
        produtos.push({
            codigo: codigo,
            descricao: descricao,
            quantidade: quantidade,
            categoria: categoria,
            dataEntrada: dataEntrada,
            dataSaida: dataSaida
        });
    }

    salvarProdutos(produtos);

    document.getElementById("mensagem").innerHTML = "Produto cadastrado com sucesso.";

    document.getElementById("codigo").value = "";
    document.getElementById("descricao").value = "";
    document.getElementById("quantidade").value = "";
    document.getElementById("categoria").value = "";
    document.getElementById("dataEntrada").value = "";
    document.getElementById("dataSaida").value = "";
}

function mostrarEstoque() {
    protegerPagina();

    const produtos = pegarProdutos();
    const tabela = document.getElementById("listaEstoque");
    const tabelaSaidas = document.getElementById("listaSaidas");

    tabela.innerHTML = "";
    tabelaSaidas.innerHTML = "";

    for (let i = 0; i < produtos.length; i++) {
        if (Number(produtos[i].quantidade) > 0) {
            tabela.innerHTML +=
                "<tr>" +
                "<td>" + produtos[i].codigo + "</td>" +
                "<td>" + produtos[i].descricao + "</td>" +
                "<td>" + produtos[i].quantidade + "</td>" +
                "<td>" + produtos[i].categoria + "</td>" +
                "<td>" + produtos[i].dataEntrada + "</td>" +
                "<td>" + produtos[i].dataSaida + "</td>" +
                "</tr>";

            if (produtos[i].dataSaida != "") {
                tabelaSaidas.innerHTML +=
                    "<tr>" +
                    "<td>" + produtos[i].codigo + "</td>" +
                    "<td>" + produtos[i].descricao + "</td>" +
                    "<td>" + produtos[i].quantidade + "</td>" +
                    "<td>" + produtos[i].dataSaida + "</td>" +
                    "</tr>";
            }
        }
    }
}

function registrarSaida() {
    protegerPagina();

    const codigo = document.getElementById("codigoSaida").value;
    const quantidadeSaida = Number(document.getElementById("quantidadeSaida").value);
    const dataSaida = document.getElementById("dataSaidaRegistro").value;

    if (codigo == "" || quantidadeSaida <= 0 || dataSaida == "") {
        document.getElementById("mensagemSaida").innerHTML = "Preencha os dados corretamente.";
        return;
    }

    const produtos = pegarProdutos();
    let encontrado = false;

    for (let i = 0; i < produtos.length; i++) {
        if (produtos[i].codigo == codigo) {
            encontrado = true;

            if (quantidadeSaida > Number(produtos[i].quantidade)) {
                document.getElementById("mensagemSaida").innerHTML = "Quantidade maior que o estoque.";
                return;
            }

            produtos[i].quantidade = Number(produtos[i].quantidade) - quantidadeSaida;
            produtos[i].dataSaida = dataSaida;
            break;
        }
    }

    if (encontrado) {
        salvarProdutos(produtos);
        document.getElementById("mensagemSaida").innerHTML = "Saida registrada com sucesso.";
        document.getElementById("codigoSaida").value = "";
        document.getElementById("quantidadeSaida").value = "";
        document.getElementById("dataSaidaRegistro").value = "";
        carregarProdutosSaida();
    } else {
        document.getElementById("mensagemSaida").innerHTML = "Produto nao encontrado.";
    }
}

function carregarProdutosSaida() {
    protegerPagina();

    const produtos = pegarProdutos();
    const area = document.getElementById("produtosSaida");

    if (area == null) {
        return;
    }

    area.innerHTML = "";

    for (let i = 0; i < produtos.length; i++) {
        if (produtos[i].dataSaida != "" && Number(produtos[i].quantidade) > 0) {
            area.innerHTML +=
                "<p>Codigo: " + produtos[i].codigo +
                " | Produto: " + produtos[i].descricao +
                " | Quantidade: " + produtos[i].quantidade +
                " | Data: " + produtos[i].dataSaida + "</p>";
        }
    }
}

function sair() {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "index.html";
}
