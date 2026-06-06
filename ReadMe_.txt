# Pokédex App - Consumo da PokéAPI

Projeto acadêmico/pessoal desenvolvido para aplicar conhecimentos práticos de Desenvolvimento Web Frontend. 
O objetivo principal foi consumir uma API REST pública (a [PokéAPI](https://pokeapi.co/)) e renderizar os dados de forma dinâmica e interativa em uma interface amigável.

# Tecnologias Utilizadas:

Neste projeto, foi utilizado as seguintes tecnologias:

* **Next.js / React:** Framework principal do projeto. Escolhido pela facilidade na criação de componentes e gerenciamento de estado (`useState`, `useEffect`). O projeto utiliza a diretiva `"use client"` típica do App Router do Next.js.
* **JavaScript:** Lógica de requisições assíncronas (`fetch`, `Promises`).
* **Bootstrap 5:** Utilizado para estilização rápida e responsividade (sistema de grids, botões, cards e o modal), permitindo focar mais na lógica JavaScript do que na escrita de CSS do zero.
---

## Executando o projeto localmente:

Como este projeto foi construído utilizando **Next.js**, o processo para rodá-lo na sua máquina é bem simples. **Pré-requisitos:

** Você precisará ter o [Node.js](https://nodejs.org/) instalado na sua máquina.
1. **Clone ou baixe o repositório** para o seu computador.
2. Abra o terminal na pasta raiz do projeto.
3. **Instale as dependências:**
Execute o comando abaixo para que o Node baixe todos os pacotes necessários (React, Next, Bootstrap, etc.):

npm install

4. Inicie o servidor de desenvolvimento:

Diferente do React puro (Vite/Create React App) que costuma usar npm start ou npm run dev, no Next.js nós iniciamos o ambiente de desenvolvimento com:

5. Acesse a pasta / diretório local no terminal:

cd pokemon-list-paginacao

6. Em seguida, execute o comando no terminal:

npm run dev

7. Abra o seu navegador e acesse: http://localhost:3000

---

Resumo das Decisões de Implementação

Durante o desenvolvimento, me deparei com alguns desafios relacionados à estrutura da PokéAPI e precisei tomar decisões arquiteturais para garantir uma boa experiência de usuário (UX) e desempenho.
Abaixo, explico as principais:

1. Dupla Requisição para Listagem Padrão (Promise.all)
A rota principal da PokéAPI (/pokemon?limit=30) não retorna os detalhes do Pokémon (como as imagens, tipos e status), ela retorna apenas o nome e uma url.
• 	A Solução: Para montar os Cards, criei uma lógica que primeiro busca a lista geral e, logo em seguida, faz um .map() utilizando Promise.all para acessar a URL de cada Pokémon simultaneamente. Só atualizo o estado pokemons quando todos os dados detalhados terminam de baixar.
2. Filtro de Tipos e Proteção de Desempenho (.slice())
Um dos maiores desafios foi o filtro de tipos. O endpoint /type/{tipo} da PokéAPI não possui paginação nativa; ele retorna todos os Pokémon daquele tipo de uma vez só (às vezes mais de 100).
•	A Solução: Se eu tentasse buscar os detalhes de 150 Pokémon ao mesmo tempo, o navegador iria travar e a API poderia bloquear minha conexão. A decisão foi extrair os resultados e usar um .slice(0, 30) para buscar os detalhes e renderizar apenas os 30 primeiros resultados na tela. Isso garantiu que o app continuasse rápido e fluido.
3. Busca por Nome/ID via Endpoint Específico
Em vez de filtrar apenas a página que o usuário está vendo (client-side), decidi fazer a barra de busca atacar diretamente o endpoint /pokemon/{nome-ou-id}.
•	A Solução: Isso garante que o usuário consiga achar qualquer Pokémon do banco de dados da API, mesmo que ele não esteja na página atual. Caso o Pokémon não exista, o bloco .catch() captura o erro e previne que a aplicação quebre.
4. Gerenciamento do Estado de Carregamento (isLoading)
Como requisições à internet demoram alguns milissegundos (ou segundos, dependendo da rede), adicionei um estado isLoading.
•	A Solução: Antes de iniciar qualquer fetch, defino isLoading como true, ocultando a lista antiga e mostrando um Spinner do Bootstrap. Ele só volta para false dentro do último .then() ou .catch(). Isso evita a "piscada" de tela e dá um feedback visual claro ao usuário de que o sistema está trabalhando.

# IFPE Campus Jaboatão
Curso: Análise e Desenvolvimento de Sistemas
Disciplina: Programação Web 2
Prof: Josino Rodrigues
Aluno: Amaro Souza Jr
