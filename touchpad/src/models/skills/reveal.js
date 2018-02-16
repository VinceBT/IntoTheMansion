function Reveal(sm,x=-1, y=-1){
    this.name = "reveal";
    this.radius = 40*IntoTheMansion._TILE_SIZE;
    this.sm = sm;
    Skill.call(this);
    this.info = this.sm.model.add.button(x, y, this.name, this.onTap, this, 2, 0, 1);
    this.info.anchor.set(0,0);
    this.info.input.useHandCursor = true;
    this.info.visible = false;
}

Reveal.prototype = {
    onTap: function(pointer,doubleTap){
        if(!this.active){
            this.sm.disableAll();
            this.info.loadTexture(this.name+'-active', 0);
            this.active = true;
            this.sm.model.circle.visible = true;
        }
        else{
            this.info.loadTexture(this.name, 0);
            this.active = false;
            this.sm.model.circle.visible = false;
        }
    }

}
