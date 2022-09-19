const cellColor = "green";
const ativeCellColor = "blue";

class Board {

  constructor(){

    this.n = 8;                                          //size of board
    this.board = new Array(this.n);                      //gameboard
    this.moves = new Map();                              //maps cell -> [cell..]
    this.numberDarkDisc = 0;
    this.numberWhiteDisc = 0;
    this.numberEmptyDisc = 64;
    this.drawBoard();
  }

  drawBoard(){

    let board = document.getElementById("board");
    board.innerHTML = "";

    for(let i = 0; i < this.n; i++){

      this.board[i] = new Array(this.n);

      for(let j = 0; j < this.n; j++){
        let cell = document.createElement("div");
        let disc = document.createElement("span");
        cell.className = "cell";
        disc.className = "discBoard";
        board.appendChild(cell);
        cell.appendChild(disc);
        this.board[i][j] = new Cell(i,j,cell);
      }
    }
  }

  /*
  funtion that receives a cell, two char fi,fj = '+','-','' such that:
  fi = '+' : i++         fj = '+' : j++
  fi = '-' : i--              ...
  fi = ''  : i = i            ...
  and the color of the disc of the current player.
  The funtion looks in the given direction for a possible play
  and if it finds, returns the cells that have to be turn to make that play
  */
  checkBoard(initCell, fi, fj, playerDisc){

    let f = function(x,opr){

      switch(opr){
        case '+': return x+1;
        case '-': return x-1;
        default: return x;
      }

    }
    let discsToTurn = [];

    for (let i = initCell.x, j = initCell.y; this.inRange(i,j);i = f(i,fi), j = f(j,fj) ) {
      let cell = this.board[i][j];
      if(cell === initCell) continue;
      if(!cell.hasDisc()) { return null; }
      if(cell.getDiscColor() !== playerDisc) { discsToTurn.push(cell); continue; }
      if(discsToTurn.length > 0 && cell.getDiscColor() === playerDisc) { return discsToTurn; }
      return null;
    }

    return null;
  }

  inRange(x,y){

    if( x >= this.n || y >= this.n || x < 0 || y < 0 ) return false;
    return true;

  }

  /*
  funtion that for each cell cheeks the row, column and diagonals to
  find all the cells that are possible plays, activates those cells
  and makes them blue. Saves the cells that have to turn for every cell
  that is a possible play in this.moves that maps one cell to a list of
  cells that have to turn(change color).
  */
  getPossibleMoves(playerDisc){

    const fi = ['+','+','+','-', '-', '-', '', ''];
    const fy = ['+','-','', '+', '-', '', '+','-'];

    for(let row of this.board){
      for(let cell of row){

        let key = cell.x.toString()+cell.y.toString();

        for(let i = 0;i < fi.length; i++){

          if(cell.hasDisc()) continue;

          let discsToTurn = this.checkBoard(cell, fi[i] , fy[i], playerDisc);

          if(discsToTurn === null) continue;

          let inMap = this.moves.get(key);

          if(inMap !== undefined) {
            this.moves.set(key, inMap.concat(discsToTurn));
          }
          else{
            this.moves.set(key, discsToTurn );
          }
        }

        if( this.moves.get(key) === undefined ) {
          cell.desactivate();
          cell.setColor(cellColor);
        }
        else {
          cell.ativate();
          cell.setColor(ativeCellColor);
        }
      }
    }
  }
  /*
  funtions that given a point [x,y] and a discColor
  makes the disc visible and with the chosen color.
  */
  showCell( point, playerDisc ){

    let x = point[0];
    let y = point[1];

    let cell = this.board[x][y];

    if(cell.hasDisc() && (cell.getDiscColor() !== playerDisc) ){
      if(playerDisc == "black") this.numberWhiteDisc--;
      if(playerDisc == "white") this.numberDarkDisc--;
    }

    if(playerDisc == "black") this.numberDarkDisc++;
    if(playerDisc == "white") this.numberWhiteDisc++;

    cell.setDiscColor(playerDisc);
    cell.showDisc();

  }

  clear(){

    for(let row of this.board){
      for( let cell of row ){
        cell.desactivate();
        cell.setColor(cellColor);
      }
    }
  }

}
