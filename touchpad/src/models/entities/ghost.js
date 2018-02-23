function Ghost(model,id,x, y){
    this.id = id;
    this.name = "ghost";
    Entity.call(this,this.name,model,x,y);
    this.info.inputEnabled = true;
    this.info.events.onInputDown.add(this.onTap, this);
    this.start_x = x;
    this.start_y = y;
}

Ghost.prototype = {
  onTap: function(pointer,doubleTap){
    console.log(this.name,pointer);
  }
}