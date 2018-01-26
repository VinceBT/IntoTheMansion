function SkillManager(){
    this.skills = [];
}

SkillManager.prototype = {
  add: function(skill) {
    this.skills.push(skill);
  },
  isRemoveTrapActive: function(){
    for(var i = 0; i < this.skills.length; i ++){
      if(this.skills[i].name == 'remove-trap'){
        return this.skills[i].active;
      }
    }
  }
}
