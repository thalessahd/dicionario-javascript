# Dicionário com Javascript
Aplicação em javascript que simula uma espécie de dicionário. O usuário pode associar valores (texto) a chaves (texto pré-definido). As associações são exibidas numa tabela.

## Funcionalidades
* Adicionar associação (valor, chave)
* Excluir associação
* Importar valores
* Importar associações
* Baixar associações (Gerar JSON)

## Arquivos

### De importação
* Formato dos arquivos de importação de associações
```JSON
{
    "associacoes":[
        {
            "string":"string"
        }
    ]
}
```
Arquivo exemplo
> import_associacoes.json

* Formato dos arquivos de importação de valores
```text
string
string
string
string
```
Arquivo exemplo
> import_termos.txt  

### De configuração
* Formato do arquivo de chaves pré-definidas
```js
data = '{ "valores": [ "string" ] }'
```
Arquivo exemplo
> js/chaves.json  