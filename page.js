"use client" // indica ao framework que é 'client component, importante p/ interatividade (cliques em botões) e estados do React


// Importações:
import { useEffect, useState } from 'react';
import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';

// Effect roda funções em momentos específicos, State cria variáveis que ao mudarem de valor fazem a tela se atualizar sozinha

export default function Home() {

  //  Estados:
  const [selectedPokemon, setSelectedPokemon] = useState(null); // Armazena o objeto do Pokémon clicado; controla a abertura do modal
  const [pokemons, setPokemons] = useState([]); // Guarda lista de pokémons que serão exibidos nos cards; começa como um array vazio
  const [nextPage, setNextPage] = useState(null); 
  const [previousPage, setPreviousPage] = useState(null); //Guardam links da API de paginação e controlam se os botões ficam ativ/desativ.
  const [isLoading, setIsLoading] = useState(true); // Exibe o spinner "Buscando dados..." imediatamente enquanto carrega a leva de dados
  const [termoPesquisa, setTermoPesquisa] = useState(''); // Armazena o texto em tempo real (Nome ou ID) do termo da pesquisa
  const [tipos, setTipos] = useState([]); // Armazena a lista de todos os tipos trazidos da API para preencher o filtro <select>
  const [tipoSelecionado, setTipoSelecionado] = useState(''); //guarda o tipo selecionado ativo no filtro

  useEffect(() => {
    fetchPokemons('https://pokeapi.co/api/v2/pokemon?limit=30');
    carregarTipos(); // Carrega os tipos ao iniciar o componente
  }, []);


  // Função buscar Pokémon específico pelo nome ou ID, chamada ao submeter o formulário de busca 
  const buscarPokemon = (e) => {
    e.preventDefault(); // Evita que a página recarregue ao submeter o formulário

    if (termoPesquisa.trim() === '') {
      // se o campo de pesquisa estiver vazio, recarrega a lista padrão
      fetchPokemons('https://pokeapi.co/api/v2/pokemon?limit=30');
      return;
    }

    setIsLoading(true); // Liga o aviso de carregamento
    const valorBuscar = termoPesquisa.toLowerCase().trim();

    fetch(`https://pokeapi.co/api/v2/pokemon/${valorBuscar}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Pokémon não encontrado');
        }
        return response.json();
      })
      .then(data => {
        setPokemons([data]);
        // Exibe apenas o Pokémon encontrado
        setNextPage(null); // Desabilita a próxima página
        setPreviousPage(null); // Desabilita a página anterior
        setIsLoading(false); // Desliga o aviso de carregamento
      })
      .catch(error => {
        console.error('Erro ao buscar Pokémon:', error);
        setIsLoading(false);
      });
  };



  // Busca a lista de tipos para preencher o <select>
  const carregarTipos = () => {
    fetch('https://pokeapi.co/api/v2/type')
      .then(response => response.json())
      .then(data => {
        // Filtra para remover tipos especiais como 'unknown' e 'shadow' se quiser
        const tiposValidos = data.results.filter(t => t.name !== 'unknown' && t.name !== 'shadow');
        setTipos(tiposValidos);
      })
      .catch(err => console.error("Erro ao carregar tipos:", err));
  };



  // Função Filtrar Pokémons por Tipo
  const filtrarPorTipo = (nomeTipo) => {
    setTipoSelecionado(nomeTipo);
    setTermoPesquisa(''); // Limpa a barra de busca por texto

    if (!nomeTipo) {
      // Se selecionado "Todos os tipos", volta para a paginação padrão
      fetchPokemons('https://pokeapi.co/api/v2/pokemon?limit=30');
      return;
    }

    setIsLoading(true);

    // A API retorna uma lista de pokémons que pertencem a este tipo
    fetch(`https://pokeapi.co/api/v2/type/${nomeTipo}`)
      .then(response => response.json())
      .then(data => {
        // Implementado a exibição dos 30 primeiros, do tipo, para não sobrecarregar
        const limitados = data.pokemon.slice(0, 30);
        
        const fetches = limitados.map(p => 
          fetch(p.pokemon.url).then(response => response.json())
        );

        Promise.all(fetches).then(pokemonData => {
          setPokemons(pokemonData);
          setIsLoading(false);
        });

        // A rota de tipos não pagina do mesmo jeito, os botões de próxima/anterior limpam
        setNextPage(null);
        setPreviousPage(null);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  };



  const fetchPokemons = (url) => {
    setIsLoading(true); // 1. Liga o aviso de carregamento

    fetch(url)
      .then(response => response.json())
      .then(data => {
        const fetches = data.results.map(pokemon =>
          fetch(pokemon.url).then(response => response.json())
        );

        // 2. Quando terminar de baixar todas as imagens e detalhes...
        Promise.all(fetches).then(pokemonData => {
          setPokemons(pokemonData);
          setIsLoading(false); // 3. Desliga o aviso de carregamento
        });

        setNextPage(data.next);
        setPreviousPage(data.previous);
      });
  };


  // Voltar pagina
  const handlePreviousPage = () => {
    if (previousPage) {
      fetchPokemons(previousPage);
    }
  };


  // Avançar pagina 
  const handleNextPage = () => {
    if (nextPage) {
      fetchPokemons(nextPage);
    }
  };

  

  return (

    <div className="container">
      <Head>
        <title>Lista de Pokémons</title>
      </Head>
      <h1 className="my-4 text-center">PokéAPI - Lista de Pokémons</h1>

      {/* Campo de Busca e Filtros */}
      <div className="row justify-content-center mb-4 g-3">
        {/* Busca por Nome/ID */}
        <div className="col-md-5">
          <form onSubmit={buscarPokemon} className="d-flex gap-2">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Buscar por Nome ou ID..." 
              value={termoPesquisa}
              onChange={(e) => setTermoPesquisa(e.target.value)}
            />
            <button type="submit" className="btn btn-success">Buscar</button>
          </form>
        </div>

        {/* Filtro por Tipo */}
        <div className="col-md-3">
          <select 
            className="form-select text-capitalize" 
            value={tipoSelecionado}
            onChange={(e) => filtrarPorTipo(e.target.value)}
          >
            <option value="">Todos os tipos</option>
            {tipos.map(tipo => (
              <option key={tipo.name} value={tipo.name}>
                {tipo.name}
              </option>
            ))}
          </select>
        </div>
      </div>
            
      {/* BLOCO DE CARREGAMENTO: Só aparece se isLoading for true */}
      {isLoading && (
        <div className="d-flex flex-column justify-content-center align-items-center my-5">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
          <h5 className="text-muted">Buscando dados na Pokédex...</h5>
        </div>
      )}
      <div className="row">

        {!isLoading && pokemons.map(pokemon => (
          <div
            key={pokemon.id}
            className="col-md-4 pokemon-card mb-4"
            onClick={() => setSelectedPokemon(pokemon)} // Salva o pokémon clicado no estado
            style={{ cursor: 'pointer' }}               // Muda o cursor para indicar que é clicável
          >
            <div className="card h-100 d-flex flex-column p-3">
              <img
                src={pokemon.sprites.other.dream_world.front_default}
                className="card-img-top img-fluid"
                alt={pokemon.name}
                style={{ height: '200px', objectFit: 'contain' }}
              />

              <h5 className="card-title text-capitalize mt-3">{pokemon.name}</h5>
              <p className="card-text">ID: {pokemon.id}</p>

              {/* BLOCO PARA OS TIPOS */}
              <div className="mb-3">
                {pokemon.types?.map((t) => (
                  <span key={t.type.name} className="badge bg-secondary me-1 text-capitalize">
                    {t.type.name}
                  </span>
                ))}
              </div>
              <div className="card-body d-flex flex-column">
                {/* Espaço para textos adicionais, se necessário*/}
              </div>
            </div>
          </div>
        ))}

      </div>
      <div className="d-flex justify-content-between my-4">
        <button className="btn btn-primary" onClick={handlePreviousPage} disabled={!previousPage}>
          Anterior
        </button>
        <button className="btn btn-primary" onClick={handleNextPage} disabled={!nextPage}>
          Próxima
        </button>
      </div>
      {/* MODAL DE DETALHES (Adicion antes de fechar o container principal) */}
      {selectedPokemon && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">

              {/* Cabeçalho do Modal */}
              <div className="modal-header">
                <h5 className="modal-title text-capitalize">{selectedPokemon.name} (# {selectedPokemon.id})</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedPokemon(null)}></button>
              </div>

              {/* Corpo do Modal */}
              <div className="modal-body text-center">
                {/* Exibindo Sprite de Frente e de Verso lado a lado */}
                <div className="d-flex justify-content-center gap-3 mb-3">
                  <div>
                    <img src={selectedPokemon.sprites.front_default} alt="Frente" width="120" />
                    <small className="d-block text-muted">Frente</small>
                  </div>
                  {selectedPokemon.sprites.back_default && (
                    <div>
                      <img src={selectedPokemon.sprites.back_default} alt="Verso" width="120" />
                      <small className="d-block text-muted">Verso</small>
                    </div>
                  )}
                </div>

                {/* Informações Físicas */}
                <div className="row mb-3 bg-light p-2 rounded mx-1">
                  <div className="col-6">
                    <strong>Altura:</strong> {selectedPokemon.height / 10} m
                  </div>
                  <div className="col-6">
                    <strong>Peso:</strong> {selectedPokemon.weight / 10} kg
                  </div>
                </div>

                {/* Habilidades */}
                <div className="mb-3 text-start">
                  <strong>Habilidades:</strong>
                  <p className="text-capitalize mb-0">
                    {selectedPokemon.abilities.map(a => a.ability.name).join(', ')}
                  </p>
                </div>

                {/* Estatísticas de Base */}
                <div className="text-start">
                  <strong>Estatísticas Base:</strong>
                  {selectedPokemon.stats.map((s) => (
                    <div key={s.stat.name} className="mb-2">
                      <div className="d-flex justify-content-between">
                        <small className="text-capitalize">{s.stat.name}</small>
                        <small className="fw-bold">{s.base_stat}</small>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div
                          className="progress-bar bg-success"
                          role="progressbar"
                          style={{ width: `${Math.min((s.base_stat / 150) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* Rodapé do Modal */}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedPokemon(null)}>
                  Fechar
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>

  );
}