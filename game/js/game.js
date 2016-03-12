function Game()
{
    this.game_states_ = {}
    this.current_state_;
}

Game.prototype.addGameState = function(game_state, name)
{
    this.game_states_[name] = game_state;
}

Game.prototype.setCurrentState = function(name)
{
    console.log("setting current state to " + name);
    this.current_state_ = name;
}

Game.prototype.update = function()
{
    var cur_state = this.game_states_[this.current_state_];
    if (cur_state !== undefined)
    {
        cur_state.update();
    }
}

Game.prototype.handleKeyDown = function(key_code)
{
    if (this.game_states_[this.current_state_])
    {
        var state_key_events = this.game_states_[this.current_state_].key_events_;
        if (key_code !== undefined && state_key_events[key_code] !== undefined)
        {
            state_key_events[key_code]();
        }
    }
}

Game.prototype.handleMouseDown = function(button)
{
    if (this.game_states_[this.current_state_])
    {
        var state_button_events = this.game_states_[this.current_state_].button_events_;
        if (button !== undefined && state_button_events[button] !== undefined)
        {
            state_button_events[button]();
        }
    }    
}

Game.prototype.createCamera = function()
{
    return new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
}

function GameState(renderer, game)
{
    this.game_ = game;
    this.scene_ = new THREE.Scene();
    this.renderer_ = renderer;
    this.game_scene_ = new GameScene(this.scene_);
    this.key_events_ = {};
    this.button_events_ = {};
}

GameState.prototype.update = function()
{
    console.log("Unimplemented update function on gamestate");
}

function THREEGameState(renderer, game)
{
    GameState.call(this, renderer, game);    
}

THREEGameState.prototype = Object.create(GameState.prototype);
THREEGameState.prototype.constructor = THREEGameState;

THREEGameState.prototype.mousePick = function()
{
    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera( mouse_state, this.cur_cam_.getInternal());
    var intersections = raycaster.intersectObjects( this.scene_.children );
    return this.game_scene_.getTilesForMeshes(intersections);;
}

THREEGameState.prototype.update = function()
{
    this.renderer_.render(this.scene_, this.cur_cam_.getInternal());
}