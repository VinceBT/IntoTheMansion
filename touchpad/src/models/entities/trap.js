function Trap(model,id, x=-1, y=-1){
    this.model = model;
    this.id = id;
    this.name = "trap";
    Entity.call(this,this.name,model,x,y);
    this.info.inputEnabled = true;
    this.info.events.onInputDown.add(this.onTap,this);
    this.info.visible = false;
}

Trap.prototype = {
  onTap: function(pointer,doubleTap){
    if(this.model.skillmanager.isRemoveTrapActive()){
      IntoTheMansion.socket.emit("REMOVE_TRAP",{"id":this.id});
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