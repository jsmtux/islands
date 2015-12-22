function MapSelectionGameState(renderer, game)
{
    this.scene_ = new THREE.Scene();
    this.renderer_ = renderer;
    this.game_ = game;
    this.game_scene_ = new GameScene(this.scene_);
    
    this.camera_ = new MapCamera(this.game_.createCamera(), 300);
    this.scene_.add(this.camera_.getInternal());
    this.seed_;
    
    this.key_events_ = {};
    this.createIslands();
}

MapSelectionGameState.prototype = Object.create(GameState.prototype);
MapSelectionGameState.prototype.constructor = MapSelectionGameState;

MapSelectionGameState.prototype.update = function()
{
    this.camera_.update(new THREE.Vector3(0,0,0));
    this.renderer_.render(this.scene_, this.camera_.getInternal());
    if (key_states.P)
    {
        this.game_.addGameState(new MapGameState(this.renderer_, this.game_, this.seed_), "map");
        this.game_.setCurrentState("map");
    }
}

MapSelectionGameState.prototype.createIslands = function()
{
    var terrain_size = new THREE.Vector2(50, 50);

    for (var i = 0; i < 8; i++)
    {
        for (var j = 0; j < 8; j++)
        {
            var terrain_function = new NoiseFunction(1);
            if (this.seed_ === undefined)
            {
                this.seed_ = terrain_function.getSeed();
            }
            console.log(terrain_function.getSeed());
            var terrain_constructor = new TerrainConstructor(terrain_size, terrain_function, 1);
            var terrain = terrain_constructor.getInfo();
            this.game_scene_.setTerrainSize(new THREE.Vector2(200, 200));
            var island = this.game_scene_.addTerrainModel("island", terrain);
            island.setPosition(new THREE.Vector2(50 * i,50*j));
        }
    }
}