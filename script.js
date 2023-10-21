async function consumeApiWithAxios(url) {
    try {
        const response = await axios.get(url);
        console.log(`Nos dio respuesta l api${response.status}`);
        return response;
    } catch (error) {
        console.error(`Falló la petición a la API con error: ${error.message}`);
        alert("Ese pokemon no existe, revisa la ortografia,");
        return null; 
    }
}
async function procesarIdPokemon(resp) {
    const respApi = await resp;
    const datos = respApi.data;
    const pokeId = datos.id;
    return pokeId;
}
async function procesarHabilidadesPokemon(resp) {
    const respApi = await resp;
    const datos = respApi.data;
    const abilities = datos.abilities;
    const pokeAbility = abilities.slice(0, 3).map(ability => ability.ability.name);
    return pokeAbility
}
async function procesarMovimientosPokemon(resp) {
    const respApi = await resp;
    const datos = respApi.data;
    const moves = datos.moves;
    const pokeMove = moves.slice(0, 3).map(move => move.move.name);
    return pokeMove
}
async function procesarImagen(resp) {
    const respApi = await resp;
    const datos = respApi.data;
    const imgUrl = datos.sprites.front_default; 
    return imgUrl
}
async function procesarEvolucion(respSpecies) {
    const respApi = await respSpecies;
    const datosSpe = await respApi.data;
    const evolutionUrl = datosSpe.evolution_chain.url;
    return evolutionUrl
}
async function procesarDescrip(respSpeciess) {
    const respApi = await respSpeciess;
    const datosSpe = await respApi.data;
    for (const entry of datosSpe.flavor_text_entries) {
        if (entry.language.name === "en") {
          return entry.flavor_text;
        }
    }
    return "Descripción en inglés no encontrada";
}

async function extraerEvoluciones(respEvo) {
    const respApi = await respEvo;
    const datosEvo = await respApi.data;
    const pokeEvos = [datosEvo.chain.species.name];

    let currentEvolution = datosEvo.chain.evolves_to[0];
    while (currentEvolution) {
        pokeEvos.push(currentEvolution.species.name);
        currentEvolution = currentEvolution.evolves_to[0];
    }
    return pokeEvos
}

function display(imgUrl,pokeAbility,searchTerm,pokeMove, pokeDescrip,resultadosContainer){
    const contenedor = document.createElement('div');
    const userImg = document.createElement('div');
    userImg.setAttribute('class', 'user-pic');
    contenedor.setAttribute('class', 'container');
    const user = document.createElement('div');
    user.setAttribute('class', 'user');
    const img = document.createElement('img');
    img.setAttribute('src', imgUrl);
    const userName = document.createElement('div');
    userName.setAttribute('class', 'user-name');
    const nombrePokemon = document.createElement('p');
    nombrePokemon.innerHTML = `<strong>Name: </strong>${searchTerm.toUpperCase()}`;
    const habilidadPokemon = document.createElement('p');
    habilidadPokemon.innerHTML = `<strong>Abilities: </strong>${pokeAbility[0]}, ${pokeAbility[1]}`;
    const movimientoPokemon = document.createElement('p');
    movimientoPokemon.innerHTML = `<strong>Moves: </strong>${pokeMove[0]}`;
    const pokeDescription = document.createElement('p');
    pokeDescription.innerHTML = `<strong>Descript: </strong>${pokeDescrip}`;
    userName.appendChild(nombrePokemon);
    userImg.appendChild(img);
    userName.appendChild(habilidadPokemon);
    userName.appendChild(movimientoPokemon);
    userName.appendChild(pokeDescription);
    user.appendChild(userImg);
    user.appendChild(userName);
    contenedor.appendChild(user);
    resultadosContainer.appendChild(contenedor); 
}
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const main = document.querySelector('main');
    const resultadosContainer = document.createElement('div'); 
    resultadosContainer.setAttribute('class', 'result-container');
    main.appendChild(resultadosContainer); 
    var evolutionButton;
    function resetState() {
        if (resultadosContainer.firstChild) {
            resultadosContainer.removeChild(resultadosContainer.firstChild);
        }
        if (evolutionButton) {
            evolutionButton.remove();
        }
        searchInput.value = ''; 
    }


    searchButton.addEventListener('click', async function() {
        
        var searchTerm = searchInput.value.toLowerCase();
        var url = `https://pokeapi.co/api/v2/pokemon/${searchTerm}`;
        var respuestaPeticion = await consumeApiWithAxios(url);
        var pokeId = await procesarIdPokemon(respuestaPeticion);
        var pokeAbility = await procesarHabilidadesPokemon(respuestaPeticion);
        var pokeMove = await procesarMovimientosPokemon(respuestaPeticion);
        var imgUrl = await procesarImagen(respuestaPeticion);
        var urlSpecies = `https://pokeapi.co/api/v2/pokemon-species/${pokeId}/`;
        var respuestaPeticionSpecies = await consumeApiWithAxios(urlSpecies);
        var respuestaSpecies = await procesarEvolucion(respuestaPeticionSpecies);
        var pokeDescrip = await procesarDescrip(respuestaPeticionSpecies);
        var respuestaPeticionEvo = await consumeApiWithAxios(respuestaSpecies);
        var pokeEvos = await extraerEvoluciones(respuestaPeticionEvo);
        var condicion = (valor) => valor === searchTerm;
        var posicion = pokeEvos.findIndex(condicion);
        var lenEvos = pokeEvos.length-1;
        
        if (resultadosContainer.firstChild) {
            resultadosContainer.removeChild(resultadosContainer.firstChild);
        }

        display(imgUrl,pokeAbility,searchTerm,pokeMove,pokeDescrip,resultadosContainer);
        if (evolutionButton) {
            evolutionButton.remove(); 
        }
        if (lenEvos>posicion) {
            console.log(lenEvos);
            console.log(posicion);
            evolutionButton = document.createElement('button');
            evolutionButton.setAttribute('class', 'user-evolution');
            evolutionButton.innerText = 'Evolucionar'; 
            evolutionButton.addEventListener('click', async function() {
                posicion = posicion + 1 ;
                searchTerm = pokeEvos[posicion];
                 url = `https://pokeapi.co/api/v2/pokemon/${searchTerm}`;
                 respuestaPeticion = await consumeApiWithAxios(url);
                 pokeId = await procesarIdPokemon(respuestaPeticion);
                 pokeAbility = await procesarHabilidadesPokemon(respuestaPeticion);
                 pokeMove = await procesarMovimientosPokemon(respuestaPeticion);
                 imgUrl = await procesarImagen(respuestaPeticion);
                 urlSpecies = `https://pokeapi.co/api/v2/pokemon-species/${pokeId}/`;
                 respuestaPeticionSpecies = await consumeApiWithAxios(urlSpecies);
                 respuestaSpecies = await procesarEvolucion(respuestaPeticionSpecies);
                 pokeDescrip = await procesarDescrip(respuestaPeticionSpecies);
                 respuestaPeticionEvo = await consumeApiWithAxios(respuestaSpecies);
                 pokeEvos = await extraerEvoluciones(respuestaPeticionEvo);
                 condicion = (valor) => valor === searchTerm;
                posicion = pokeEvos.findIndex(condicion);
                lenEvosenEvos = pokeEvos.length-1;
                if (resultadosContainer.firstChild) {
                    resultadosContainer.removeChild(resultadosContainer.firstChild);
                }
                display(imgUrl,pokeAbility,searchTerm,pokeMove,pokeDescrip,resultadosContainer);
                if (lenEvos<=posicion) {
                    if (evolutionButton) {
                        evolutionButton.remove(); 
                    }
                }

            });
            main.appendChild(evolutionButton);
            
        }
        const resetButton = document.createElement('button');
        resetButton.innerText = 'Restablecer';
        resetButton.addEventListener('click', resetState);
        resetButton.style.position = 'fixed';
        resetButton.style.top = '10px';
        resetButton.style.right = '10px';
        document.body.appendChild(resetButton);
    });
    
});