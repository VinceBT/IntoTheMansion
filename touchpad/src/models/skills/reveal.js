function Reveal(sm,x=-1, y=-1){
    this.name = "reveal";
    this.radius = 15*IntoTheMansion._TILE_SIZE;
    this.sm = sm;
    Skill.call(this);
    this.info = this.sm.model.add.button(x, y, this.name, this.onTap, this, 2, 0, 1);
    this.info.anchor.set(0.5,0.5);
    this.info.input.useHandCursor = true;
    this.info.visible = false;
    this.duration = 10000;
}

Reveal.prototype = {
    onTap: function(pointer,doubleTap){
        if(this.chrono == 0){
            this.chrono = 1;
            this.info.loadTexture(this.name+'-active', 0);
            this.sm.model.circle.visible = true;
            setTimeout(function(r){
                r.info.loadTexture(r.name, 0);
                r.sm.model.circle.visible = false;
                r.chrono = 2;
                setTimeout(function(r){
                    r.chrono = 0;
                },r.cooldown,r);

            },this.duration,this);
        }
    }

}
