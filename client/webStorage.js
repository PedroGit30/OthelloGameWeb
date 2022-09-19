
var player_victories;
var pc_victories;
// var player_defeats;
// var pc_defeats;
var games;

//se for um novo usuário, cria as variaveis local storage e inicia-as a 0
//se for um usario em que os items ja foram criados, a funçao nao faz nada
function load_local_storage(){
  if(!localStorage.getItem("player_vit")){
    localStorage.setItem("player_vit", 0);
    localStorage.setItem("pc_vit", 0);
    localStorage.setItem("games", 0);
  }

  player_victories = parseInt(localStorage.getItem("player_vit"));
  pc_victories = parseInt(localStorage.getItem("pc_vit"));
  games = parseInt(localStorage.getItem("games"));

}

function clear_local_storage(){
  localStorage.clear();
}

//função que faz update dos valores em local storage

// player_pc = 0 - player
// player_pc = 1 - pc
// victory_defeat = 0 - victory
// victory_defeat = 1 - defeat

function local_storage(player_pc){

  load_local_storage();

  if(player_pc == 0) player_victories++;
  else if(player_pc == 1) pc_victories++;
  games++;

  localStorage.setItem("player_vit", player_victories);
  localStorage.setItem("pc_vit", pc_victories);
  localStorage.setItem("games", games);

}

//testar se é preciso criar local storage
load_local_storage();

//chamar a função local_storage quando algum jogo contra o pc terminar
