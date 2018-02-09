function Entity(name, model, x=-1, y=-1){
    this.info = model.add.sprite(x,y, name);
    this.info.anchor.setTo(0.5, 0.5);
    this.info.visible = true;
    model.entities.push(this);
}

Entity.prototype = {
}
