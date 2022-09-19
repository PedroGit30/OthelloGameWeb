const fs   = require('fs');
const conf = require('./conf.js');
const User = require('./user.js');
const Board = require('./board.js')
const crypt = require('./encription.js');
const empty = "empty";
const dark = "dark";
const light = "light";
const error = 400;
const wrongPass = 401;
const success = 200;

module.exports = class {

  constructor(){

    this.deserialize();
    this.games = new Map();
    this.waitList = [];

  }

  serialize(newUser, newRanking){

    const encoding = "utf8";
    const pathname = conf.appFiles;

    let replacer = function(key, value) {
      const originalObject = this[key];
      if(originalObject instanceof Map) {
        return {
          dataType: 'Map',
          value: Array.from(originalObject.entries())
        };
      } else {
        return value;
      }
    }

    let user = JSON.stringify(newUser, replacer);
    let ranking = JSON.stringify(newRanking, replacer);

    if( newUser ){
      fs.writeFile(pathname + '/users.txt', user , encoding, () => {});
    }
    if(newRanking){
      fs.writeFile(pathname + '/ranking.txt', ranking , encoding, () => {});
    }
  }
  deserialize(){

    const encoding = "utf8";
    const pathname = conf.appFiles;

    let reviver = function(key, value) {
      if(typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
          return new Map(value.value);
        }
      }
      return value;
    }

    fs.readFile(pathname + '/users.txt', encoding, (err,data) => {
      if(err){
        this.users = new Map();
      }
      else{
        this.users = JSON.parse(data, reviver);
      }
    } );

    fs.readFile(pathname + '/ranking.txt', encoding, (err,data) => {
      if(err){
        this.ranking = new Map();
      }
      else{
        this.ranking = JSON.parse(data,reviver);
      }
    } );

  }

  checkPass(encryptedPass, pass){

    return ( crypt.decrypt(encryptedPass) === pass )

  }

  addUser(nick, pass){

    if(!this.checkArgs([nick,pass])) return { code: error };

    let user = this.users.get(nick);

    if( user === undefined ) {
      let newUser = this.users.set(nick,new User(nick,pass));
      let rank = { nick: nick, victories: 0, games: 0 };
      let newRanking = this.ranking.set(nick,rank);
      this.serialize(newUser, newRanking);
      return { code: success };
    }
    else if( this.checkPass(user.pass, pass) ) return { code: success };
    return { code: wrongPass };

  }

  getRanking(){

    let resp = { ranking: [] };

    for( let rank of this.ranking.values() ){
      resp.ranking.push(rank);
    }

    return {resp: resp, code: success};
  }

  joinGame(group, nick, pass){

    if(!this.checkArgs([group, nick, pass])) { code: error };

    if(this.addUser(nick, pass).code !== 200) { code: wrongPass };

    let resp = { game: "", color: "" };

    if( this.waitList.includes(nick) ){
      resp.game = this.users.get(nick).hash;
      resp.color = "dark";
      return { resp: resp, code: success };
    }

    if(this.waitList.length === 0){

      let hash = this.users.get(nick).hash;
      this.waitList.push(nick);

      resp.game = hash;
      resp.color = dark;

      this.games.set( hash, {
        p1: null,
        p2: null,
        p1Con: null,
        p2Con: null,
        board: null,
        count: null,
        turn: null
      } )
    }
    else{

      let p1Name = this.waitList.pop();
      let hash = this.users.get(p1Name).hash;
      let game = this.games.get(hash);

      this.users.get(nick).hash = hash;
      resp.color = light;
      resp.game = hash;
      game.turn = p1Name;
      game.p1 = p1Name;
      game.p2 = nick;
      game.board = new Board();
      game.count = { dark: 2, light: 2, empty: 60};

    }

    return { resp: resp, code: success };
  }

  removeGame(gameHash){

    this.games.delete(gameHash);

  }

  startGame(nick, gameHash, connect){

    let game = this.games.get(gameHash);
    if(game === undefined) return { error: "invalid game" };
    let p2Name = game.p1;
    let resp = null;

    if( p2Name === null ){
      game.p1Con = connect;
    }
    else{
      game.p2Con = connect;
      let obj = { turn: game.p1, board: game.board.board, count: game.count };
      resp = { resp: obj, p1Con : game.p1Con, p2Con : game.p2Con }
      game.board.getPossibleMoves(dark);
    }
    return resp;
  }

  nextTurn(game){

    if(game.turn === game.p1) return game.p2;
    return game.p1;

  }

  update(gameHash){

    if(!this.checkArgs([gameHash])) return false;

    let game = this.games.get(gameHash);
    if(game === undefined) return false;

    let obj = { turn: game.turn, board: game.board.board, count: game.count };
    let resp = { resp: obj, p1Con : game.p1Con, p2Con : game.p2Con };

    if(game.board.noMoves()){
      if(this.skipped) obj.winner = this.endGame(gameHash,this.getWinner(game));
      obj.skip = true;
      this.skipped = true;
    }
    else this.skipped = false;

    if(game.board.isFull()) obj.winner = this.endGame(gameHash,this.getWinner(game));
    return resp;
  }

  endGame(gameHash, winner){

    let game = this.games.get(gameHash);

    this.ranking.get(game.p1).games++;
    this.ranking.get(game.p2).games++;

    if(winner !== null){
      let player = this.ranking.get(winner);
      player.victories++;
    }
    this.serialize(undefined, this.ranking);
    this.removeGame(gameHash);
    if(winner === null) return null;
    return winner;

  }

  getWinner(game){

    if(game.count.dark > game.count.light) return game.p1;
    else if(game.count.dark < game.count.light) return game.p2;
    else return null;

  }

  getPlayerColor(game){

    let color;
    if(game.turn === game.p1) color = dark;
    else color = light;
    return color;
  }

  leave(nick, pass, gameHash, timeout){

    if(!this.checkArgs([nick,pass, gameHash])) return { code: error };

    if(this.addUser(nick, pass).code !== 200) { code: wrongPass };

    let game = this.games.get(gameHash);

    if(game === undefined) return { code: error };

    let p1Con = game.p1Con;
    let p2Con = game.p2Con;
    let winner;

    if(game.p1 === null) {
      this.waitList.splice(this.waitList.indexOf(nick),1);
      this.removeGame(gameHash);
      return { code: error };
    }
    else{
      if(timeout) winner = nick;
      else {
        if(nick === game.p1) winner = game.p2;
        else winner = game.p1;
      }
      this.endGame(gameHash, nick);
    }
    return { code: success, resp: { p1Con: p1Con, p2Con: p2Con, win: { winner: winner } } };
  }

  starTimer(nick, pass, gameHash, sendEvent){

    if(this.addUser(nick, pass).code !== 200) return false;

    if(!this.checkArgs([nick,pass, gameHash, sendEvent])) return false;

    let game = this.games.get(gameHash);
    if(game === undefined) return false;

    if(game.timer !== undefined) {
      clearTimeout(game.timer);
    }
    let timer = setTimeout( () => {
      let leave = this.leave(nick,pass,gameHash, true);
      let resp = leave.resp;
      let status = leave.code;
      if( status === success ) sendEvent(resp.p1Con, resp.p2Con, resp.win);
    }, 120000 );
    game.timer = timer;
  }

  checkArgs( args ){

    for(let arg of args){
      if(arg === undefined) return false;
    }
    return true;
  }

  processNotify(nick, pass, gameHash, move){

    if(!this.checkArgs([nick,pass, gameHash, move])) return { code: error };

    if(this.addUser(nick, pass).code !== 200) { code: wrongPass };

    let game = this.games.get(gameHash);
    if(game === undefined) return { code: error };

    if( game.turn !== nick ) return { code: error };

    if(move !== null){
      let validMove = game.board.makeMove(move.row, move.column, this.getPlayerColor(game));
      if(!validMove) return { code: error };
    }

    let darkDiscs = game.board.darkDiscs;
    let lightDiscs = game.board.lightDiscs;

    game.count.dark = darkDiscs;
    game.count.light = lightDiscs;
    game.count.empty = 64 - (darkDiscs + lightDiscs);

    game.turn = this.nextTurn(game);
    game.board.getPossibleMoves(this.getPlayerColor(game));

    return { code: success, resp: {} };
  }

}
