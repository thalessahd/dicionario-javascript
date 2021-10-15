//Lendo JSON com as chaves.
var chaves = JSON.parse(data);

//Variável para o controle de associações repetidas.
var mem_associacoes = new Object();

//Variáveis do botão deletar;
var texto_bt_deletar = "X";
var style_botaoDeletar = "bt_deletar";

//Função verifica se associação inserida já está na variável mem_associacoes. 
function verifica_associacao(chave,valor) {
	for(i in mem_associacoes[chave]) {
		if(mem_associacoes[chave][i]==valor) {
			return false; //Associação igual não é permitida.
		}
	}
	return true; //Associação não repetida.
}

//Função adiciona associação na variável mem_associacoes
function adiciona_mem(chave,valor) {
	if(mem_associacoes[chave]==undefined) { //Chave não existe.
		mem_associacoes[chave] = [];
		mem_associacoes[chave].push(valor); //Adiciona associação na variável.
		return true; //Adicionou.
	}else { //Chave existe. Precisa verificar se não é associação repetida.
		var verificado = verifica_associacao(chave,valor);
		if(verificado) {
			mem_associacoes[chave].push(valor);
			return true; //Adicionou.
		}else {
			return false; //Não adicionou.
		}
	}
}

//Função remove associação da variável mem_associacoes.
function remove_mem(chave,valor) {
	for(i in mem_associacoes[chave]) {
		if(mem_associacoes[chave][i]==valor) {
			mem_associacoes[chave].splice(i,1);
			break;
		}
	}
}

//Função deleta linha da tabela.
function funcBotaoDeletar(elem) {
	var chave = elem.childNodes[1]["innerText"];
	var valor  = elem.childNodes[0]["innerText"];
	remove_mem(chave,valor); //Remove associação da variável mem_associacoes.
	elem.remove(); //Remove linha da tabela.
}

//Função que coloca os dados do JSON na option de um select.
function carregaToOption(jsonObj) {
	var dado;
	for(var i in jsonObj["valores"]) {
		dado = jsonObj["valores"][i];
		document.write("<option value='"+dado+"'>"+dado+"</option>");
	}
}

//Função que pega dado digitado pelo usuário ou dado da datalist + dado selecionado pelo usuário e escreve na tabela.
function escreve() {
	//Dados de entrada.
	var valor = document.getElementById("input_valor");
	if(valor.value.length==0) {
		alert("Campo valor não pode estar em branco.");
		return;
	}
	var chave = document.getElementById("select_chave");
	
	//Controle para não permitir associações idênticas na tabela.
	var statusAdc = adiciona_mem(chave.value,valor.value);
	if(!statusAdc) {
		alert("Associação já criada.");
		return;
	}
	
	//Montar dados da tabela.
	var table = document.getElementById("tabelaAssociacoes");
	var tr = document.createElement("tr"); //Cria linha.
	var td1 = document.createElement("td"); //Cria coluna 1.
	td1.innerHTML = valor.value; //Preenche coluna 1.
	var td2 = document.createElement("td"); //Cria coluna 2.
	td2.innerHTML = chave.value; //Preenche coluna 2.
	
	//Montar botão para deletar a linha
	var botaoDeletar = document.createElement("a");
	botaoDeletar.setAttribute("class",style_botaoDeletar);
	botaoDeletar.innerHTML = texto_bt_deletar;
	botaoDeletar.onclick = function() { //Função deleta linha.
		funcBotaoDeletar(tr);
	}
	
	//Insere botaoDeletar na terceira coluna da tabela.
	var td3 = document.createElement("td");
	td3.setAttribute("class","col_deletar");
	td3.appendChild(botaoDeletar);
	
	//Finaliza linha(tr).
	tr.appendChild(td1);
	tr.appendChild(td2);
	tr.appendChild(td3);
	//Insere linha na tabela.
	table.appendChild(tr);
	//Limpa campo valor.
	valor.value ="";
}

//Função gerar arquivo e fazer download do mesmo.
//Fonte: https://stackoverflow.com/questions/28464449/how-to-save-json-data-locally-on-the-machine
function saveText(text, filename) {
	var a = document.createElement('a');
	a.setAttribute('href', 'data:text/plain;charset=utf-8,'+encodeURIComponent(text));
	a.setAttribute('download', filename);
	a.click()
}

//Função gera e baixa um arquivo JSON com os dados da tabela.
function gerarJson() {
	var saida = new Object(); //Variável JSON
	saida.associacoes =[];
	var tabela = document.getElementById("tabelaAssociacoes");
	var tam = tabela.childNodes.length
	if(tam<=2) {
		alert("Tabela de associações vazia. Insira ao menos 1 associação.");
		return;
	}
	for(var i=2;i<tam;i++) {
		var elem = tabela.childNodes[i]; //Pega linha da tabela
		var valor = elem.childNodes[0]["innerText"];
		var chave = elem.childNodes[1]["innerText"];
		
		//Adiciona valores no JSON
		var campo = new Object();
		campo[chave] = valor;
		saida["associacoes"].push(campo);	
	}
	
	//Download
	saveText(JSON.stringify(saida,undefined,4),"associacoes.json");
	
	//Debug
	console.log( JSON.stringify(saida,undefined,4) );
}

//Função pega o arquivo inserido pelo usuário e preenche a tabela com os dados do arquivo. O arquivo precisa ser um JSON em formato definido.
function carrega_associacao() {
	var arq = document.getElementById("fileAssociacoes").files[0];
	if(arq==null) {
		alert("Por favor insira um arquivo.");
		return;
	}
	var reader = new FileReader();
	reader.readAsText(arq);

	reader.onload = function() { //Função ativada ao carregar o arquivo corretamente
		var texto = reader.result;
		var texto_json = JSON.parse(texto);
		
		//Olha todo o conteúdo do arquivo procurando por associações idênticas entre
		//o arquivo e a tabela, caso encontre não carrega o arquivo pra tabela.
		//Não verifica se há associações idênticas dentro do arquivo. Isso é feito
		//no for posterior.
		for (i in texto_json["associacoes"]) {
			var chave = Object.keys(texto_json["associacoes"][i]);
			var valor = texto_json["associacoes"][i][chave];
			
			//Controle para não permitir associações idênticas entre o arquivo e a tabela.
			var verificacao = verifica_associacao(chave,valor);
			if(!verificacao) {
				alert("O arquivo lido contém associações já presentes na tabela.");
				printaFileCarregamento("resultCarregarFileAssociacao",arq.name,1);
				return;
			}
		}
		
		for (i in texto_json["associacoes"]) {
			var chave = Object.keys(texto_json["associacoes"][i]);
			var valor = texto_json["associacoes"][i][chave];
			
			//Controle para não permitir associações idênticas no arquivo.
			var statusAdc = adiciona_mem(chave,valor);
			if(!statusAdc) {
				//Só entra nesse if quando o arquivo importado 
				//possui associações idênticas.
				alert("Associação duplicada encontrada no arquivo inserido. Processo interrompido.");
				printaFileCarregamento("resultCarregarFileAssociacao",arq.name,1);
				return;
			}
			
			//Montar dados da tabela.
			var table = document.getElementById("tabelaAssociacoes");
			const tr = document.createElement("tr"); //Cria linha. PRECISA SER const.
			var td1 = document.createElement("td"); //Cria coluna 1.
			td1.innerHTML = valor; //Preenche coluna 1.
			var td2 = document.createElement("td"); //Cria coluna 2.
			td2.innerHTML = chave; //Preenche coluna 2.
			
			//Montar botão para deletar a linha
			var botaoDeletar = document.createElement("a");
			botaoDeletar.setAttribute("class",style_botaoDeletar);
			botaoDeletar.innerHTML = texto_bt_deletar;
			botaoDeletar.onclick = function() { //Função deleta linha.
				funcBotaoDeletar(tr);
			};
			
			//Insere botaoDeletar na terceira coluna da tabela.
			var td3 = document.createElement("td");
			td3.setAttribute("class","col_deletar");
			td3.appendChild(botaoDeletar);
			
			//Finaliza linha(tr).
			tr.appendChild(td1);
			tr.appendChild(td2);
			tr.appendChild(td3);
			//Insere linha na tabela.
			table.appendChild(tr);	
		}
		//Mensagem indicando que o carregamento do arquivo deu certo.
		printaFileCarregamento("resultCarregarFileAssociacao",arq.name,0);
	};

	reader.onerror = function() {
		console.log(reader.error);
	};
}

//Função pega o arquivo inserido pelo usuário e preenche a datalist com os dados do arquivo. O arquivo precisa ser uma lista de palavras, uma por linha.
function carrega_termos() {
	var arq = document.getElementById("fileTermos").files[0];
	if(arq==null) {
		alert("Por favor insira um arquivo.");
		return;
	}
	
	var reader = new FileReader();
	reader.readAsText(arq);

	reader.onload = function() { //Função ativada ao carregar o arquivo corretamente
		var texto = reader.result;
		var lista_termos = texto.split(/\r\n|\r|\n/); //Pega cada linha do arquivo.
		for (l in lista_termos) {
			var termo = lista_termos[l];
			var option = document.createElement("option");
			option.setAttribute("id", termo);
			option.setAttribute("value", termo);
			option.innerHTML = termo;
			var datalist = document.getElementById("valor");
			datalist.appendChild(option);
		}
		
		//Mensagem indicando que o carregamento do arquivo deu certo.
		printaFileCarregamento("resultCarregarFileTermos",arq.name,0);
	};

	reader.onerror = function() {
		console.log(reader.error);
	};
}

//Função exibe uma mensagem contendo o arq_name com o id_name recebido.
function printaFileCarregamento(id_name, arq_name, erro) {
	var printa = document.getElementById(id_name);
	printa.style.fontWeight = "bold";
	if(!erro) {
		printa.style.color = "black";
		printa.innerHTML = '</br></br>"'+arq_name+'"'+" carregado com sucesso.";
	}else {
		printa.style.color = "red";
		printa.innerHTML = '</br></br>"'+arq_name+'"'+" não foi carregado corretamente.";
	}
}

//Função exibe status de importação.
function printaStatusFile(id_file,id_a) {
	var a = document.getElementById(id_a);
	var arq = document.getElementById(id_file).files[0];
	if(arq==null) {
		a.innerHTML = "Nenhum arquivo selecionado."
		return;
	}
	a.innerHTML = arq.name;
}