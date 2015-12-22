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

function GameState()
{
}

GameState.prototype.update = function()
{
    console.log("Unimplemented update function on gamestate");
}
