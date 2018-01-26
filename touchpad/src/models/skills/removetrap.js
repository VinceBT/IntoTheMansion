function RemoveTrap(model, x=-1, y=-1){
    this.name = "remove-trap";
    Skill.call(this);
    this.info = model.add.button(x, y, this.name, this.onTap, this, 2, 0, 1);
    this.info.anchor.set(0.5,0);
    this.info.input.useHandCursor = true;
}

RemoveTrap.prototype = {
  onTap: function(pointer,doubleTap){
    if(!this.active){
      this.info.loadTexture(this.name+'-active', 0);
      this.active = true;
    }
    else{
      this.info.loadTexture(this.name, 0);
      this.active = false;
    }
  }

}
