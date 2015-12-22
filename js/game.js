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

Game.prototype.createCamera = function()
{
    return new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
}

function GameState()
{
}

GameState.prototype.update = function()
{
    console.log("Unimplemented update function on gamestate");
}
