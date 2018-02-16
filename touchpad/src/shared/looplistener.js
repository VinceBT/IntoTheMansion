function LoopListener(model){
    function distance(a,b){
        var d = (a.info.x - b.info.x)**2 + (a.info.y - b.info.y)**2;
        return d;
    };
    setInterval(function(model,distance){
        for(var i = 0; i < model.entities.length;i++){
            if (model.entities[i].name == "trap" &&
                distance(model.player,model.entities[i]) <= model.skillmanager.getRadius()**2
            ){
              model.entities[i].info.visible = model.skillmanager.reveal.chrono == 1 ? true:false;
            }
        }
    },200,model,distance);
}
