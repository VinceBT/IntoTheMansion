function Entity(name, model, x, y){
    this.info = model.add.sprite(x,y, name);
    this.info.anchor.setTo(0.5, 0.5);
    this.info.visible = true;
    if(name != "ghost" && name != "player")
        model.entities.push(this);
}

Entity.prototype = {
}
