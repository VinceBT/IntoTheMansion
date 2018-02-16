function Skill(){
    this.active = false;
    this.cooldown = 10000;
    this.chrono = 0;
}

Skill.prototype = {
    start: function(){
        this.chrono = new Date();
    },
    timeRemaining: function(){
            return new Date().getTime() - this.chrono.getTime();
    },
    reset: function(){
        if(this.chrono > 0 && this.timeRemaining() > this.cooldown){
            this.chrono = 0;
            return true;
        }
        else return false;
    }
}
