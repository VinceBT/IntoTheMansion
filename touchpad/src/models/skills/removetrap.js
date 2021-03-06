function RemoveTrap(sm,x, y){
    this.name = "remove-trap";
    this.sm = sm;
    Skill.call(this);
    this.info = this.sm.model.add.button(x, y, this.name, this.onTap, this, 2, 0, 1);
    this.info.anchor.set(0.5,0.5);
    this.info.input.useHandCursor = true;
    this.info.visible = false;
    this.cooldown = 1000;
}

RemoveTrap.prototype = {
  onTap: function(pointer,doubleTap){
    if(!this.active){
        this.sm.disableAll();
        this.info.loadTexture(this.name+'-active', 0);
        this.active = true;
    }
    else{
      this.info.loadTexture(this.name, 0);
      this.active = false;
    }
  }

}
