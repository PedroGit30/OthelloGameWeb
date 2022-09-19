
const settings = {
  OPPONENT : {
    PC: "pc",
    PLAYER: "player"
  },
  DISCCOLOR : {
    LIGHT: "white",
    DARK : "black"
  },
  DIFFICULTY: {
    EASY: "easy",
    HARD: "hard"
  }
};

class Settings{

  static importSettings( button ){

    let f = function( text, b1t, b2t ){
     document.getElementById("config").className = "config leave";
     setTimeout(() => {
       let t = document.getElementById("configText");
       t.innerHTML = "";
       t.appendChild(document.createTextNode(text));
       let b1 = document.getElementById("button1");
       let b2 = document.getElementById("button2");
       b1.innerHTML = "";
       b2.innerHTML = "";
       b1.appendChild( document.createTextNode(b1t) );
       b2.appendChild( document.createTextNode(b2t) );
       document.getElementById("config").className = "config enter";
     }, 1000);
   }

    if( button.textContent === "player" ) {
      this.opponent = settings.OPPONENT.PLAYER;
      return g.getSettings();
    }
    if( button.textContent === "pc" ) {
      this.opponent = settings.OPPONENT.PC;
      f("chose your disc color", "dark", "light");
    }
    if( button.textContent === "dark" ) {
      this.playerDisc = settings.DISCCOLOR.DARK;
      this.opponentDisc = settings.DISCCOLOR.LIGHT;
      f("chose the difficulty", "easy", "hard");
    }
    if( button.textContent === "light" ) {
      this.playerDisc = settings.DISCCOLOR.LIGHT;
      this.opponentDisc = settings.DISCCOLOR.DARK;
      f("chose the difficulty", "easy", "hard");
    }
    if( button.textContent === "easy" || button.textContent === "hard" ) {
      f("play against", "player", "pc");
      return g.getSettings();
    }
  }
  //returns the color of the disc of the opponent
  static getOpponentDisc(){
    return this.opponentDisc;
  }

  static vsPC(){
    return this.opponent === settings.OPPONENT.PC;
  }

  static playerStarts(){
    if(this.playerDisc === settings.DISCCOLOR.LIGHT) return false;
    return true;
  }

  static getPlayerDisc(){
    return this.playerDisc;
  }
}
