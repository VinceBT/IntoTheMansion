function Trap(model,id, x, y){
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
      IntoTheMansion.socket.emit("REMOVE_TRAP",{"id":this.id, byAlly:true});
      this.info.destroy();
      for(var i = 0; i < this.model.entities.length; i++){
        if(this.model.entities[i] == this){
          this.model.entities.splice(i,1);
          break;
        }
      }
        this.model.skillmanager.remove.chrono = 1;
        this.model.skillmanager.remove.info.loadTexture(this.model.skillmanager.remove.name, 0);
        setTimeout(function(r){
            r.chrono = 0;

        },this.model.skillmanager.remove.cooldown,this.model.skillmanager.remove)
    }
  }
}
