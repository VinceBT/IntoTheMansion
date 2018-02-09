function Player(model, x=-1, y=-1){
    this.name = "player";
    Entity.call(this,this.name,model,x,y);
    this.info.inputEnabled = true;
    this.info.events.onInputDown.add(this.onTap,this);
}

Player.prototype = {
  onTap: function(pointer,doubleTap){
    console.log(this.name,pointer);
  }
}