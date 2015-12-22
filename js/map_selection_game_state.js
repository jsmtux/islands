function MapSelectionGameState(renderer, game)
{
    this.scene_ = new THREE.Scene();
    this.renderer_ = renderer;
    this.game_ = game;
    
    var scene_camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
    this.map_camera_ = new MapCamera(scene_camera, 300);
    this.scene_.add(this.map_camera_.getInternal());
}

MapSelectionGameState.prototype = Object.create(GameState.prototype);
MapSelectionGameState.prototype.constructor = MapSelectionGameState;

MapSelectionGameState.prototype.update = function()
{
}

