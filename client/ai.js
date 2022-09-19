class AI{

  constructor( difficulty ){
    this.difficulty = difficulty;
  }
  //choses the play that turns the higest amount of
  //adversary discs
  getPlay( board ){

    let key;
    let maxLength = 0;

    for( let kv of board.moves ){
      let k = kv[0];
      let v = kv[1];
      if( v.length > maxLength ) {
        maxLength = v.length;
        key = k;
      }
    }
    return [key.charAt(0),key.charAt(1)];
  }
}
