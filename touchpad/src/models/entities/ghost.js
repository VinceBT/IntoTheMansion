function Ghost(model,id=0,x=-1, y=-1){
    this.id = id;
    this.name = "ghost";
    Entity.call(this,this.name,model,x,y);
    this.info.inputEnabled = true;
    this.info.events.onInputDown.add(this.onTap, this);
}

Ghost.prototype = {
  onTap: function(pointer,doubleTap){
    console.log(this.name,pointer);
  }
}