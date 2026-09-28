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

function pegarMovimentacoes() {
    return JSON.parse(localStorage.getItem("movimentacoes")) || [];
}

function salvarMovimentacoes(movimentacoes) {
    localStorage.setItem("movimentacoes", JSON.stringify(movimentacoes));
}

function normalizarTexto(texto) {
    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function login() {
    const email = document.getElementById("email").value.trim();
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
    const email = document.getElementById("email").value.trim();
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
    window.location.href = "login.html";
}

function recuperarSenha() {
    const email = document.getElementById("email").value.trim();
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
        window.location.href = "login.html";
    } else {
        alert("Email ou data de nascimento incorretos.");
    }
}

function protegerPagina() {
    const usuario = localStorage.getItem("usuarioLogado");

    if (usuario == null) {
        window.location.href = "index.html";
        return false;
    }

    return true;
}

function iniciarHome() {
    if (!protegerPagina()) {
        return;
    }

    const usuario = localStorage.getItem("usuarioLogado");
    const usuarioLogado = document.getElementById("usuarioLogado");

    if (usuarioLogado != null) {
        usuarioLogado.innerHTML = usuario;
    }

    const produtos = pegarProdutos();
    const movimentacoes = pegarMovimentacoes();

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

    for (let i = 0; i < movimentacoes.length; i++) {
        if (dataNosUltimosDias(movimentacoes[i].data, limite)) {
            if (movimentacoes[i].tipo == "entrada") {
                totalEntradas++;
            } else if (movimentacoes[i].tipo == "saida") {
                totalSaidas++;
            }
        }
    }

    document.getElementById("totalProdutos").innerHTML = totalProdutos;
    document.getElementById("totalEntradas").innerHTML = totalEntradas;
    document.getElementById("totalSaidas").innerHTML = totalSaidas;
}

function dataNosUltimosDias(dataTexto, limite) {
    if (dataTexto == "") {
        return false;
    }

    const partes = dataTexto.split("-");
    const data = new Date(partes[0], partes[1] - 1, partes[2]);

    return data >= limite;
}

function cadastrarEntrada() {
    if (!protegerPagina()) {
        return;
    }

    const codigo = document.getElementById("codigo").value.trim();
    const descricao = document.getElementById("descricao").value.trim();
    const unidade = document.getElementById("unidade").value;
    const quantidade = Number(document.getElementById("quantidade").value);
    const categoria = document.getElementById("categoria").value.trim();
    const dataEntrada = document.getElementById("dataEntrada").value;

    if (codigo == "" || descricao == "" || unidade == "" || quantidade <= 0 || categoria == "" || dataEntrada == "") {
        document.getElementById("mensagem").innerHTML = "Preencha os dados corretamente.";
        return;
    }

    const produtos = pegarProdutos();
    let produtoEncontrado = false;

    for (let i = 0; i < produtos.length; i++) {
        if (normalizarTexto(produtos[i].codigo) == normalizarTexto(codigo)) {
            if (produtos[i].unidade != unidade) {
                document.getElementById("mensagem").innerHTML = "A unidade deste produto e " + produtos[i].unidade + ".";
                return;
            }

            produtos[i].quantidade = Number(produtos[i].quantidade) + quantidade;
            produtos[i].descricao = descricao;
            produtos[i].categoria = categoria;
            produtos[i].dataEntrada = dataEntrada;
            produtoEncontrado = true;
            break;
        }
    }

    if (!produtoEncontrado) {
        produtos.push({
            codigo: codigo,
            descricao: descricao,
            unidade: unidade,
            quantidade: quantidade,
            categoria: categoria,
            dataEntrada: dataEntrada,
            dataSaida: ""
        });
    }

    salvarProdutos(produtos);

    const movimentacoes = pegarMovimentacoes();
    movimentacoes.push({
        tipo: "entrada",
        codigo: codigo,
        quantidade: quantidade,
        unidade: unidade,
        data: dataEntrada
    });
    salvarMovimentacoes(movimentacoes);

    document.getElementById("mensagem").innerHTML = "Produto cadastrado com sucesso.";

    document.getElementById("codigo").value = "";
    document.getElementById("descricao").value = "";
    document.getElementById("unidade").value = "";
    document.getElementById("quantidade").value = "";
    document.getElementById("categoria").value = "";
    document.getElementById("dataEntrada").value = "";
}

function mostrarEstoque(filtroAtual) {
    if (!protegerPagina()) {
        return;
    }

    const produtos = pegarProdutos();
    const tabela = document.getElementById("listaEstoque");
    const tabelaSaidas = document.getElementById("listaSaidas");
    const filtro = normalizarTexto(filtroAtual == undefined ? document.getElementById("pesquisaEstoque")?.value : filtroAtual);

    tabela.innerHTML = "";
    tabelaSaidas.innerHTML = "";

    for (let i = 0; i < produtos.length; i++) {
        const codigo = normalizarTexto(produtos[i].codigo);
        const descricao = normalizarTexto(produtos[i].descricao);

        if (filtro != "" && !codigo.includes(filtro) && !descricao.includes(filtro)) {
            continue;
        }

        if (Number(produtos[i].quantidade) > 0) {
            tabela.innerHTML +=
                "<tr>" +
                "<td>" + produtos[i].codigo + "</td>" +
                "<td>" + produtos[i].descricao + "</td>" +
                "<td>" + produtos[i].quantidade + "</td>" +
                "<td>" + produtos[i].unidade + "</td>" +
                "<td>" + produtos[i].categoria + "</td>" +
                "<td>" + produtos[i].dataEntrada + "</td>" +
                "<td>" + (produtos[i].dataSaida || "-") + "</td>" +
                "</tr>";
        }

        if (produtos[i].dataSaida != "") {
            tabelaSaidas.innerHTML +=
                "<tr>" +
                "<td>" + produtos[i].codigo + "</td>" +
                "<td>" + produtos[i].descricao + "</td>" +
                "<td>" + produtos[i].quantidade + "</td>" +
                "<td>" + produtos[i].unidade + "</td>" +
                "<td>" + produtos[i].dataSaida + "</td>" +
                "</tr>";
        }
    }
}

function pesquisarEstoque() {
    mostrarEstoque();
}

function buscarProdutoSaida() {
    if (!protegerPagina()) {
        return;
    }

    const busca = document.getElementById("codigoSaida").value.trim();
    const produtos = pegarProdutos();
    const unidade = document.getElementById("unidadeSaida");
    const nome = document.getElementById("nomeSaida");

    unidade.value = "";
    nome.innerHTML = "";

    for (let i = 0; i < produtos.length; i++) {
        if (normalizarTexto(produtos[i].codigo) == normalizarTexto(busca) || normalizarTexto(produtos[i].descricao) == normalizarTexto(busca)) {
            unidade.value = produtos[i].unidade;
            nome.innerHTML = "Produto encontrado: " + produtos[i].descricao;
            document.getElementById("codigoSaida").dataset.codigoEncontrado = produtos[i].codigo;
            return;
        }
    }

    delete document.getElementById("codigoSaida").dataset.codigoEncontrado;
    nome.innerHTML = "Produto nao encontrado.";
}

function registrarSaida() {
    if (!protegerPagina()) {
        return;
    }

    const campoBusca = document.getElementById("codigoSaida");
    const busca = campoBusca.value.trim();
    const quantidadeSaida = Number(document.getElementById("quantidadeSaida").value);
    const dataSaida = document.getElementById("dataSaidaRegistro").value;
    const codigoEncontrado = campoBusca.dataset.codigoEncontrado || "";

    if (busca == "" || quantidadeSaida <= 0 || dataSaida == "") {
        document.getElementById("mensagemSaida").innerHTML = "Preencha os dados corretamente.";
        return;
    }

    const produtos = pegarProdutos();
    let encontrado = false;
    let codigoUsado = "";

    for (let i = 0; i < produtos.length; i++) {
        const combinaBusca =
            normalizarTexto(produtos[i].codigo) == normalizarTexto(busca) ||
            normalizarTexto(produtos[i].descricao) == normalizarTexto(busca);

        if (combinaBusca || (codigoEncontrado != "" && produtos[i].codigo == codigoEncontrado)) {
            encontrado = true;
            codigoUsado = produtos[i].codigo;

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

        const movimentacoes = pegarMovimentacoes();
        const unidade = document.getElementById("unidadeSaida").value;

        movimentacoes.push({
            tipo: "saida",
            codigo: codigoUsado,
            quantidade: quantidadeSaida,
            unidade: unidade,
            data: dataSaida
        });
        salvarMovimentacoes(movimentacoes);

        document.getElementById("mensagemSaida").innerHTML = "Saida registrada com sucesso.";
        campoBusca.value = "";
        document.getElementById("quantidadeSaida").value = "";
        document.getElementById("dataSaidaRegistro").value = "";
        document.getElementById("unidadeSaida").value = "";
        document.getElementById("nomeSaida").innerHTML = "";
        delete campoBusca.dataset.codigoEncontrado;
    } else {
        document.getElementById("mensagemSaida").innerHTML = "Produto nao encontrado.";
    }
}

function buscarProdutoEdicao() {
    if (!protegerPagina()) {
        return;
    }

    const busca = document.getElementById("buscarEdicao").value.trim();
    const produtos = pegarProdutos();
    const mensagem = document.getElementById("mensagemEdicao");

    for (let i = 0; i < produtos.length; i++) {
        if (normalizarTexto(produtos[i].codigo) == normalizarTexto(busca) || normalizarTexto(produtos[i].descricao) == normalizarTexto(busca)) {
            document.getElementById("editarCodigoOriginal").value = produtos[i].codigo;
            document.getElementById("editarCodigoOriginalTexto").innerHTML = produtos[i].codigo;
            document.getElementById("editarDescricao").value = produtos[i].descricao;
            document.getElementById("editarUnidade").value = produtos[i].unidade;
            document.getElementById("editarQuantidade").value = produtos[i].quantidade;
            document.getElementById("editarCategoria").value = produtos[i].categoria;
            document.getElementById("formEdicao").hidden = false;
            mensagem.innerHTML = "Produto encontrado.";
            return;
        }
    }

    document.getElementById("formEdicao").hidden = true;
    mensagem.innerHTML = "Produto nao encontrado.";
}

function salvarEdicao() {
    if (!protegerPagina()) {
        return;
    }

    const codigoOriginal = document.getElementById("editarCodigoOriginal").value;
    const descricao = document.getElementById("editarDescricao").value.trim();
    const unidade = document.getElementById("editarUnidade").value;
    const quantidade = Number(document.getElementById("editarQuantidade").value);
    const categoria = document.getElementById("editarCategoria").value.trim();

    if (codigoOriginal == "" || descricao == "" || unidade == "" || quantidade < 0 || categoria == "") {
        document.getElementById("mensagemEdicao").innerHTML = "Preencha os dados corretamente.";
        return;
    }

    const produtos = pegarProdutos();
    let alterado = false;

    for (let i = 0; i < produtos.length; i++) {
        if (produtos[i].codigo == codigoOriginal) {
            produtos[i].descricao = descricao;
            produtos[i].unidade = unidade;
            produtos[i].quantidade = quantidade;
            produtos[i].categoria = categoria;
            alterado = true;
            break;
        }
    }

    if (alterado) {
        salvarProdutos(produtos);
        document.getElementById("mensagemEdicao").innerHTML = "Produto alterado com sucesso.";
    } else {
        document.getElementById("mensagemEdicao").innerHTML = "Produto nao encontrado.";
    }
}

function sair() {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "index.html";
}
