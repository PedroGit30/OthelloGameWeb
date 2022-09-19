const empty = "empty";
const dark = "dark";
const light = "light";
const fi = ['+','+','+','-', '-', '-', '', ''];
const fy = ['+','-','', '+', '-', '', '+','-'];

module.exports = class{

  constructor(){

    this.board = [];
    this.moves = new Map();
    this.lightDiscs = 2;
    this.darkDiscs = 2;

    for(let i = 0; i < 8; i++){
      let line = [];
      for(let j = 0; j < 8; j++){
        line[j] = empty;
      }
      this.board[i] = line;
    }
    this.board[3][3] = light;
    this.board[3][4] = dark;
    this.board[4][3] = dark;
    this.board[4][4] = light;
  }

  checkBoard(x, y, fi, fj, playerDisc){

    let f = function(x,opr){

      switch(opr){
        case '+': return x+1;
        case '-': return x-1;
        default: return x;
      }

    }
    let discsToTurn = [];

    for (let i = x, j = y; this.inRange(i,j);i = f(i,fi), j = f(j,fj) ) {
      if(i === x && j === y ) continue;
      let cell = this.board[i][j];
      if(cell === empty) return null;
      if(cell !== playerDisc) { discsToTurn.push([i,j]); continue; }
      if(discsToTurn.length > 0 && cell === playerDisc) { return discsToTurn; }
      return null;
    }

    return null;
  }

  inRange(x,y){

    if( x >= 8 || y >= 8 || x < 0 || y < 0 ) return false;
    return true;

  }

  makeMove(row, column, color){
    let key = row*8+column;
    let move = this.moves.get(key);
    if(move === undefined) return false;
    this.board[Math.trunc(key/8)][key%8] = color;
    this.updateDiscsCount(color);
    for(let [x,y] of move){
      this.board[x][y] = color;
      this.updateDiscsCount(color, true);
    }
    this.moves.clear();
    return true;
  }

  noMoves(){

    return this.moves.size === 0;

  }

  isFull(){

    return this.darkDiscs + this.lightDiscs === 64;
  }


  updateDiscsCount(color, turned){

    if(color === dark) {
      this.darkDiscs++;
      if(turned) this.lightDiscs--;
    }
    else {
      this.lightDiscs++;
      if(turned) this.darkDiscs--;
    }
  }

  getPossibleMoves(playerDisc){

    let count = 0;

    for(let i = 0; i < 8; i++){
      for(let j = 0; j < 8; j++){

        let key = count;
        count++;
        let cell = this.board[i][j];
        if(cell === dark || cell === light) continue;

        for(let k = 0;k < fi.length; k++){

          let discsToTurn = this.checkBoard(i, j, fi[k] , fy[k], playerDisc);

          if(discsToTurn === null) continue;

          let inMap = this.moves.get(key);

          if(inMap !== undefined){
            this.moves.set(key, inMap.concat(discsToTurn));
          }
          else this.moves.set(key, discsToTurn );
        }

      }
    }
  }

}
