class Cell {

  constructor(x, y, cellDraw){

    this.cellDraw = cellDraw;
    this.x = x;
    this.y = y;

  }

  ativate(){

    this.cellDraw.style.pointerEvents = "all";

  }

  desactivate(){

    this.cellDraw.style.pointerEvents = "none";

  }

  setColor(color){
    this.cellDraw.style.backgroundColor = color;
  }

  hasDisc(){
    return this.cellDraw.children[0].style.display === "block";
  }

  showDisc(){
    this.cellDraw.children[0].style.display = "block";
  }

  setDiscColor( color ){
    this.cellDraw.children[0].style.backgroundColor = color;
  }

  getDiscColor(){
    return this.cellDraw.children[0].style.backgroundColor;
  }

}
