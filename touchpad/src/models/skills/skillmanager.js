function SkillManager(model){
    this.model = model;
    this.name = "skills";
    this.active = false;
    this.group = this.model.add.group();
    this.skills = [];
    this.info = this.model.add.button(10, 10, this.name, this.onTap, this, 2, 0, 1);
    this.info.anchor.set(0,0);
    this.info.input.enableDrag(true);
    this.info.input.dragStopBlocksInputUp = true;
    this.info.input.useHandCursor = true;
    this.info.input.dragDistanceThreshold = 5;
    this.info.events.onDragStart.add(this.onDragStart, this);
    this.info.events.onDragStop.add(this.onDragStop, this);
    this.radius;
    this.addShowPath();
    this.addReveal();
    this.addRemoveTrap();


}

SkillManager.prototype = {
    onDragStart: function(){
        this.info.loadTexture(this.name, 0);
        this.hideSkills();

    },
    onDragStop: function(){
        if(this.active){
            this.info.loadTexture(this.name+'-active', 0);
            this.showSkills();
        }
    },
    showSkills: function(){
        for(var i = 0; i < this.skills.length;i++){
            var tmp = this.model.cache.getImage(this.skills[i].name);
            this.skills[i].info.x = this.info.x+(i+1)*(tmp.width+10) + 10
            this.skills[i].info.y = this.info.y;
            this.skills[i].info.visible = true;

        }
    },
    hideSkills: function(){
        for(var i = 0; i < this.skills.length;i++){
            this.skills[i].info.visible = false;
        }
    },
    onTap: function(){
        if(!this.active){
            this.info.loadTexture(this.name+'-active', 0);
            this.active = true;
            this.showSkills();
        }
        else{
            this.info.loadTexture(this.name, 0);
            this.active = false;
            this.hideSkills();
        }

    },
  addRemoveTrap: function() {
      var tmp = this.model.cache.getImage('remove-trap');
      var skill = new RemoveTrap(this,this.info.x+(this.skills.length+1)*tmp.width+10,this.info.y);
      this.skills.push(skill);
  },
  isRemoveTrapActive: function(){
    for(var i = 0; i < this.skills.length; i ++){
      if(this.skills[i].name == 'remove-trap'){
        return this.skills[i].active && this.active && !this.info.input.isDragged;
      }
    }
  },
    addShowPath: function() {
        var tmp = this.model.cache.getImage('show-path');
        var skill = new ShowPath(this,this.info.x+(this.skills.length+1)*tmp.width+10,this.info.y);
        this.skills.push(skill);
    },
    isShowPathActive: function(){
        for(var i = 0; i < this.skills.length; i ++){
            if(this.skills[i].name == 'show-path'){
                return this.skills[i].active && this.active && !this.info.input.isDragged;
            }
        }
    },
    addReveal: function() {
        var tmp = this.model.cache.getImage('reveal');
        var skill = new Reveal(this,this.info.x+(this.skills.length+1)*tmp.width+10,this.info.y);
        this.skills.push(skill);
    },
    isRevealActive: function(){
        for(var i = 0; i < this.skills.length; i ++){
            if(this.skills[i].name == 'reveal'){
                return this.skills[i].active && this.active && !this.info.input.isDragged;
            }
        }
    },
    disableAll: function(){
        for(var i = 0; i < this.skills.length; i ++){
            if(this.skills[i].active) {
                this.skills[i].info.loadTexture(this.skills[i].name, 0);
                this.skills[i].active = false;
            }
        }
    },
    getShowPathSkill: function(){
        for(var i = 0; i < this.skills.length; i ++) {
            if (this.skills[i].name == 'show-path') {
                return this.skills[i];
            }
        }
    },
    getRadius: function(){
        if(this.radius) return this.radius;
        for(var i = 0; i < this.skills.length; i ++){
            if(this.skills[i].name == 'reveal'){
                this.radius = this.skills[i].radius;
                return this.skills[i].radius;
            }
        }
    },
  display: function(){
      this.model.world.bringToTop(this.group);
  }
}
