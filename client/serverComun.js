
const server = "http://localhost:8147/";

function register( nick , pass ){

  let obj = { nick: nick, pass: pass };

  fetch( server+"register", {

    method : 'POST',
    body : JSON.stringify(obj)

  } )
  .then ( response => response.json() )
  .then ( json => {
    console.log(json);
    if(json.error === undefined) g.loginSucess(nick,pass);
    else g.loginFail();
  } )
  .catch( console.log );

}

function ranking(){

  fetch( server+"ranking" , {

    method : 'POST',
    body : "{}"

  })
  .then ( response => response.json() )
  .then ( json => { console.log(json); g.showRank(json); } )
  .catch( console.log );
}


function join(group, nick, pass){

  let obj = { group: group, nick: nick, pass: pass };

  fetch( server+"join" , {

    method : 'POST',
    body : JSON.stringify(obj)

  })
  .then ( response => response.json() )
  .then ( json => { console.log(json); g.joinOnlineGame(json); } )
  .catch( console.log );
}

function leave(nick, pass, game){

  let obj = { nick: nick, pass: pass, game: game };

  fetch( server+"leave" , {

    method : 'POST',
    body : JSON.stringify(obj)

  })
  .then ( response => response.json() )
  .then ( json => console.log(json) )
  .catch( console.log );

}

function notify(nick, pass, game, move){

  let obj;
  if( move === null)
  obj = { nick: nick, pass: pass, game: game, move: null };
  else
  obj = { nick: nick, pass: pass, game: game, move: { row: move[0], column: move[1] } };

  fetch( server+"notify" , {

    method : 'POST',
    body : JSON.stringify(obj)

  })
  .then ( response => response.json() )
  .then ( json => console.log(json) )
  .catch( console.log );
}

var eventSource;

function update(nick, game){

  eventSource = new EventSource(server+"update?nick="+nick+"&game="+game);

  eventSource.onmessage = event => g.updateOnlineGame(event);


}
