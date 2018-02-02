function SkillManager(model){
    this.model = model;
    this.group = this.model.add.group();
    this.skills = [];
    this.addRemoveTrap();
    this.addShowPath();
    this.addRemoveTrap();
    this.addShowPath();
    this.addRemoveTrap();
    this.addShowPath();
}

SkillManager.prototype = {
  addRemoveTrap: function() {
      var tmp = this.model.cache.getImage('remove-trap');
      var skill = new RemoveTrap(this,tmp.width * this.skills.length,this.model.world._height);
      this.skills.push(skill);
  },
  isRemoveTrapActive: function(){
    for(var i = 0; i < this.skills.length; i ++){
      if(this.skills[i].name == 'remove-trap'){
        return this.skills[i].active;
      }
    }
  },
    addShowPath: function() {
        var tmp = this.model.cache.getImage('show-path');
        var skill = new ShowPath(this,tmp.width * this.skills.length,this.model.world._height);
        this.skills.push(skill);
    },
    isShowPathActive: function(){
        for(var i = 0; i < this.skills.length; i ++){
            if(this.skills[i].name == 'show-path'){
                return this.skills[i].active;
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
  display: function(){
      this.model.world.bringToTop(this.group);
  }
}
