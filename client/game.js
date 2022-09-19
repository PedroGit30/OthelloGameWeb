class Game{

  constructor(){

    this.winCount = 0;
    this.loseCount = 0;
    this.drawCount = 0
    this.playerTurn = false;
    this.board = new Board();
    this.gameState = document.getElementById("gameState");
    document.getElementById("quitGame").addEventListener("click", () => this.quitGame());
    document.getElementById("login").addEventListener("click", () => this.login());
    document.getElementById("userName").addEventListener("keyup",evt => { if(evt.keyCode === 13) this.login();});
    document.getElementById("passw").addEventListener("keyup",evt => { if(evt.keyCode === 13) this.login();});
    document.getElementById("logout").addEventListener("click", () => this.logout());
    document.getElementById("skipPlay").addEventListener("click", () => this.skipPlay());
    document.getElementById("seeRank").addEventListener("click", () => this.getRank());
    document.getElementById("instructions").addEventListener("click", () => this.showInstruc());
    let b1 = document.getElementById("button1");
    let b2 = document.getElementById("button2");
    b1.addEventListener("click", () => Settings.importSettings(b1));
    b2.addEventListener("click", () => Settings.importSettings(b2));
    this.player = new Player("", null);
  }

  showInstruc(){

    document.getElementById("instPopup").classList.toggle("show");

  }

  getRank(){

    if(Settings.vsPC()) this.showRank();
    else ranking();

  }

  showRank(response){

    document.getElementById("rankPopup").classList.toggle("show");
    let rank = document.getElementById("rank");
    let table = document.createElement("table");
    rank.innerHTML = "";
    rank.appendChild(table);

    let createRow = function(n, v, g){

      let tr = document.createElement("tr");
      let th1 = document.createElement("th");
      let th2 = document.createElement("th");
      let th3 = document.createElement("th");

      th1.appendChild( document.createTextNode(n) );
      th2.appendChild( document.createTextNode(v) );
      th3.appendChild( document.createTextNode(g) );
      tr.appendChild(th1);
      tr.appendChild(th2);
      tr.appendChild(th3);
      table.appendChild(tr);
    }

    createRow("nick", "victories", "games");

    if(response !== undefined){
      for(let user of response.ranking){
        createRow(user.nick, user.victories, user.games);
      }
    }
    else{
      createRow( this.player.userName, player_victories, games );
      createRow( this.opponent.userName, pc_victories, games );
    }
  }

  logout(){

    this.quitGame();
    document.getElementById("notLogged").style.display = "block";
    document.getElementById("logged").style.display = "none";
    document.getElementById("showUserName").innerHTML = "";
    this.player.userName = "Player";
    this.player.passw = null;

  }

  login(){

    let userName = document.getElementById("userName").value;
    let passw = document.getElementById("passw").value;
    register( userName, passw );

  }

  loginSucess(userName, passw){

    document.getElementById("notLogged").style.display = "none";
    document.getElementById("logged").style.display = "block";
    document.getElementById("showUserName").appendChild(document.createTextNode("Welcome "+userName) );
    this.player.userName = userName;
    this.player.passw = passw;

  }

  loginFail(){

    let errorMessage = document.getElementById("errorMessage");
    errorMessage.style.display = "block";
    errorMessage.appendChild( document.createTextNode("wrong password") );
    document.getElementById("notLogged").style.display = "none";
    document.getElementById("logged").style.display = "none";

    setTimeout( () => {

      errorMessage.innerHTML = "";
      errorMessage.style.display = "none";
      document.getElementById("notLogged").style.display = "block";

    } ,2000)

  }

  endGame(playerName){

    this.board.clear();

    if(!Settings.vsPC()) eventSource.close();

    let m = document.getElementById("displayMesg");
    m.innerHTML = "";
    m.appendChild( document.createTextNode( "Game ended: " ) );

    if( playerName === null ){
      m.appendChild( document.createTextNode( "You draw" ) );
      this.drawCount++;
    }
    else if( playerName === this.player.userName ){
      m.appendChild(  document.createTextNode( "You won" ) );
      this.winCount++;
    }
    else{
      m.appendChild( document.createTextNode( "You lost" ) );
      this.loseCount++;
    }
  }

  getWinner(){

    let d = this.board.numberDarkDisc;
    let l = this.board.numberWhiteDisc;

    if(this.player.disc === settings.DISCCOLOR.LIGHT){
      if(l > d ){
        local_storage(0);
        return this.player.userName;
      }
      else if( d > l ){
        local_storage(1);
        return this.opponent.userName;
      }
      else return null;
    }
    else if(this.player.disc === settings.DISCCOLOR.DARK ){
      if(d > l ){
        local_storage(0);
        return this.player.userName;
      }
      else if( l > d ){
        local_storage(1);
        return this.opponent.userName;
      }
      else { local_storage(); return null; }
    }
  }

  skipPlay(){


    if(this.playerHasNoMove) {
      if(!Settings.vsPC()){
        notify(this.player.userName, this.player.passw, this.game, null);
      }
      else{
        this.playerTurn = !this.playerTurn;
        this.nextRound();
      }
      return;
    }
    document.getElementById("displayMesg").innerHTML = "";
    document.getElementById("displayMesg").appendChild( document.createTextNode( "You can only skip if you can't play" ) );
    setTimeout(() => { document.getElementById("displayMesg").innerHTML = ""; }, 2000);
  }


  quitGame(){

    if(!Settings.vsPC()){
      leave(this.player.userName, this.player.passw, this.game);
      this.loadScreen(false);
      this.cancelJoin = true;
      if(eventSource != undefined) eventSource.close();
    }
    this.board = new Board();
    document.getElementById("displayMesg").innerHTML = "";
    document.getElementById("gamePart").style.display = "none";
    document.getElementById("config").style.pointerEvents = "all";

  }

  startGame(){

    this.player.disc = Settings.getPlayerDisc();
    this.opponent = new Player(Settings.opponent, Settings.getOpponentDisc() );

    for(let row of this.board.board)
       for(let cell of row)
          cell.cellDraw.addEventListener("click", evt => this.cellClicked(cell) );

    this.board.showCell( [3,3], "white" );
    this.board.showCell( [4,4], "white" );
    this.board.showCell( [3,4], "black" );
    this.board.showCell( [4,3], "black" );

    if( Settings.playerStarts() ) this.playerTurn = true;
    else this.playerTurn = false;

    this.nextRound();
  }

  updateGameState(){

    let cDark = document.getElementById("numberBlackDiscs");
    let cWhite = document.getElementById("numberWhiteDiscs");
    let cEmpty = document.getElementById("emptyCells");

    let nDark = this.board.numberDarkDisc;
    let nWhite = this.board.numberWhiteDisc;
    let nEmpty = 64 - (this.board.numberDarkDisc + this.board.numberWhiteDisc);

    cDark.innerHTML = "";
    cWhite.innerHTML = "";
    cEmpty.innerHTML = "";

    cDark.appendChild( document.createTextNode(nDark) );
    cWhite.appendChild( document.createTextNode(nWhite) );
    cEmpty.appendChild( document.createTextNode(nEmpty) );
  }

  nextRound(){

    this.updateGameState();

    if( this.board.numberDarkDisc === 0 ) return this.endGame(this.getWinner());
    if( this.board.numberWhiteDisc === 0) return this.endGame(this.getWinner());
    if( this.board.numberDarkDisc + this.board.numberWhiteDisc === 64 ) return this.endGame(this.getWinner());
    if( this.playerHasNoMove && this.opponentHasNoMove ) return this.endGame(this.getWinner());

    this.play();
  }

  play(){

    if(this.playerTurn) {
      let t = document.getElementById("turn");
      if(this.player.disc === settings.DISCCOLOR.DARK) {
        t.className = "disc dark";
      }
      else t.className = "disc white";
      this.playerHasNoMove = !this.player.play(this.board);

    }
    else {
      let t = document.getElementById("turn");
      if(this.player.disc === settings.DISCCOLOR.DARK) {
        t.className = "disc white";
      }
      else t.className = "disc dark";

      if(Settings.vsPC()) {
        this.opponentHasNoMove = !this.opponent.play(this.board);
        this.playerTurn = !this.playerTurn;
        return this.nextRound();
      }
    }
  }

  cellClicked(clickedCell){

    if(!this.playerTurn) return;

    this.player.play(this.board, clickedCell);

    if(!Settings.vsPC()){
      notify(this.player.userName, this.player.passw, this.game, [clickedCell.x, clickedCell.y]);
      this.board.clear();
    }
    else{
      this.playerTurn = !this.playerTurn;
      this.nextRound();
    }
  }

  getSettings(){

    this.playerHasNoMove = false;
    this.opponentHasNoMove = false;
    this.cancelJoin = false;
    this.player.waitingForUserInput = false;

    if(Settings.vsPC()) {
      this.startGame();
    }
    else {
      if( this.player.passw === null ) {
        let errorMessage = document.getElementById("errorMessage2");
        errorMessage.appendChild( document.createTextNode("You need to be logged to play online") );
        setTimeout( () => errorMessage.innerHTML = "", 3000 );
        return;
      }
      join("PDGroup", this.player.userName, this.player.passw);
    }

    document.getElementById("gamePart").style.display = "block";
    document.getElementById("config").style.pointerEvents = "none";
    window.scrollTo(0,document.body.scrollHeight);
  }

  joinOnlineGame(joinResponse){

    if( this.cancelJoin ) return;
    this.loadScreen(true);

    if( joinResponse.color === "dark" ){
      Settings.playerDisc = settings.DISCCOLOR.DARK;
      Settings.opponentDisc = settings.DISCCOLOR.LIGHT;
    }
    else if( joinResponse.color === "light" ) {
      Settings.playerDisc = settings.DISCCOLOR.LIGHT;
      Settings.opponentDisc = settings.DISCCOLOR.DARK;
    }
    else {
      setTimeout( () => join("PDGroup", this.player.userName, this.player.passw) , 1000);
      return;
    }
    this.game = joinResponse.game;
    this.startOnlineGame();
  }

  startOnlineGame(){

    this.player.disc = Settings.getPlayerDisc();

    for(let row of this.board.board){
      for(let cell of row){
        cell.cellDraw.addEventListener("click", () => this.cellClicked(cell) );
      }
    }
    update(this.player.userName, this.game);
  }

  updateOnlineGame(event){

    this.loadScreen(false);
    let data = JSON.parse(event.data);
    console.log(data);

    if( data.skip ){
      this.playerHasNoMove = true;
    }

    let board = data.board;
    let turn = data.turn;
    let count = data.count;

    if( board != undefined ){
      for(let i = 0; i < 8; i++){
        for(let j = 0; j < 8; j++ ){
          let cell = board[i][j];
          if( cell === "empty" ) continue;
          if( cell === "light" ) this.board.showCell([i,j], "white");
          if( cell === "dark" ) this.board.showCell([i,j], "black");
        }
      }
    }
    if( count != undefined ){
      this.board.numberDarkDisc = count.dark;
      this.board.numberWhiteDisc = count.light;
      this.board.numberEmptyDisc = count.empty;
      this.updateGameState();
    }

    if( data.winner != undefined ){
      this.endGame(data.winner);
      return;
    }

    if( turn === this.player.userName ) this.playerTurn = true;
    else this.playerTurn = false;

    this.play();
  }

  loadScreen( flag ){

    if( flag === this.loading ) return;
    if( flag ) this.loading = true;
    else this.loading = false;

    if( flag ){
      document.getElementById("loadingText").style.display = "block";
      document.getElementById("loading").style.display = "block";
      document.getElementById("dashboard").className = "dashboard blur";
    }
    else{
      document.getElementById("loadingText").style.display = "none";
      document.getElementById("loading").style.display = "none";
      document.getElementById("dashboard").className = "dashboard";
      document.getElementById("dashboard").style.pointerEvents = "all";
    }
  }
}

var g = new Game()
