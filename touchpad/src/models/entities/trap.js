function Trap(model,id,player, x=-1, y=-1){
    this.model = model;
    this.id = id;
    this.referer = player;
    this.name = "trap";
    Entity.call(this,this.name,model,x,y);
    model.entities.push(this);
    this.info.inputEnabled = true;
    this.info.events.onInputDown.add(this.onTap,this);
}

Trap.prototype = {
  onTap: function(pointer,doubleTap){
    if(this.model.skillmanager.isRemoveTrapActive()){
      this.model.socket.emit("REMOVE_TRAP",{"id":this.id});
      this.info.destroy();
      for(var i = 0; i < this.model.entities.length; i++){
        if(this.model.entities[i] == this){
          this.model.entities.splice(i,1);
          break;
        }
      }
    }
  }
}