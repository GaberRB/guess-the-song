# Guess The Song API

Esse repositório contém a implementação de uma API de jogo chamada Guess The Song, desenvolvida em Java utilizando o framework Spring.

A funcionalidade principal da API é acessar a API do Deezer através do endpoint "playlist", que espera receber um gênero musical (por exemplo: Rock, Pop, Eletrônico) e retorna uma lista de músicas com a preview em mp3 do gênero informado.

## Como usar

Para utilizar a API, é necessário ter uma conta válida no Deezer e obter uma chave de acesso (access token). Com essa chave, é possível fazer requisições para o endpoint "playlist" passando o gênero desejado como parâmetro.

Exemplo de requisição:
GET https://guess-the-song.com/playlist/rock

## Contribuições

Esse projeto é open source e aceita contribuições de todos os interessados. Se você tiver sugestões de melhoria ou encontrar bugs, sinta-se à vontade para abrir uma issue ou enviar um pull request.

![Guess The Song](https://media.giphy.com/media/3lxD1O74siiz5FvrJs/giphy-downsized-large.gif)

