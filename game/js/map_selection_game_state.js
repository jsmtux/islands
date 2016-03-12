function MapSelectionGameState(renderer, game)
{
    THREEGameState.call(this, renderer, game);
    
    this.cur_cam_ = new MapCamera(this.game_.createCamera(), 300);
    this.scene_.add(this.cur_cam_.getInternal());
    
    var self = this;
    this.button_events_["LEFT"] = function()
    {
        var clicked = self.mousePick();
        if (clicked[0])
        {
            console.log(clicked[0].get_name());
            self.game_.addGameState(new MapGameState(self.renderer_, self.game_, clicked[0].get_name()), "map");
            self.game_.setCurrentState("map");
        }
    }
    
    this.createIslands();
}

MapSelectionGameState.prototype = Object.create(THREEGameState.prototype);
MapSelectionGameState.prototype.constructor = MapSelectionGameState;

MapSelectionGameState.prototype.update = function()
{
    this.cur_cam_.update(new THREE.Vector3(0,0,0));
    THREEGameState.prototype.update.call(this);
}

MapSelectionGameState.prototype.createIslands = function()
{
    var terrain_size = new THREE.Vector2(50, 50);

    for (var i = 0; i < 8; i++)
    {
        for (var j = 0; j < 8; j++)
        {
            var terrain_function = new NoiseFunction(1);
            var terrain_constructor = new TerrainConstructor(terrain_size, terrain_function, 1);
            var terrain = terrain_constructor.getInfo();
            this.game_scene_.setTerrainSize(new THREE.Vector2(200, 200));
            var island = this.game_scene_.addTerrainModel(terrain_function.getSeed(), terrain);
            island.setPosition(new THREE.Vector2(50 * i,50*j));
        }
    }
}