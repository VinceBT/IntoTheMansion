function LoopListener(model){
    function distance(a,b){
        var d = Math.pow((a.info.x - b.info.x),2) + Math.pow((a.info.y - b.info.y),2);
        return d;
    };
    setInterval(function(model,distance){
        for(var i = 0; i < model.entities.length;i++){
            if (model.entities[i].name == "trap" &&
                distance(model.player,model.entities[i]) <= Math.pow(model.skillmanager.getRadius(),2)
            ){
              model.entities[i].info.visible = model.skillmanager.reveal.chrono == 1 ? true:false;
            }
        }
    },200,model,distance);
}
