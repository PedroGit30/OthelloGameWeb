class Player{

//if player is huuman then execute onclick
//otherwise execute now.

  constructor(id, disc){

    if( id === "pc" ) { this.usingAi = true; this.userName = "PC"; }
    else { this.usingAi = false; this.userName = "Player"; }
    this.disc = disc;
    this.passw = null;
    if( this.usingAi ) this.ai = new AI(Settings.difficulty);

  }

  play( board, clickedCell ){

    if( this.waitingForUserInput ){
      this.makeMove(board, clickedCell);
      this.waitingForUserInput = false;
      return true;
    }
    if(!this.usingAi){
      board.getPossibleMoves( this.disc );
      if( board.moves.size === 0 ) return false;
      this.waitingForUserInput = true;
      return true;
    }
    board.getPossibleMoves(this.disc);
    if(board.moves.size === 0) return false;
    this.makeMove(board);
    return true;
  }

  makeMove( board, clickedCell ){

    let x,y;
    let move;

    if( this.usingAi ){
      [x,y] = this.ai.getPlay(board);
      move = board.moves.get(x+y);
    }
    else {
      [x,y] = [clickedCell.x,clickedCell.y];
      move = board.moves.get(x.toString()+y.toString());
    }
    board.showCell([x,y], this.disc);

    for(let cell of move ){
      board.showCell([cell.x,cell.y], this.disc);
    }
    board.moves.clear();
  }
}
