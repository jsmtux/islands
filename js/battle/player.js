function intRandom(min, max)
{
    return Math.floor(Math.random() * (max - min) + min);
}

function Player()
{
    this.units_ = [];
}

Player.prototype.getCurrentUnit = function()
{
    var ret = undefined;
    for (var i in this.units_)
    {
        if (this.units_[i].isAlive())
        {
            ret = this.units_[i];
            break;
        }
    }
    return ret;
}

Player.prototype.getUnits = function()
{
    return this.units_;
}

function NPC()
{
    Player.call(this);
}

NPC.prototype = Object.create(Player.prototype);
NPC.prototype.constructor = NPC;

NPC.prototype.iteration = function(enemy, cb)
{
    var current_unit = this.getCurrentUnit();
    if (current_unit)
    {
        var action_id = intRandom(0, current_unit.actions_.length);
        var action = current_unit.actions_[action_id];
        //print("Enemy used " + action.getName());
        enemy.receiveAction(action);
    }
    cb();
}

function PC(action_callback)
{
    Player.call(this);
    this.action_callback_ = action_callback;
    this.current_unit_ = 0;
    this.items_ = [];
}

PC.prototype = Object.create(Player.prototype);
PC.prototype.constructor = PC;

PC.prototype.iteration = function(enemy, cb)
{
    var actions = [];
    var attack_action = {};
    attack_action.getName = function(){return "Attack";};
    actions.push(attack_action);
    var change_action = {};
    change_action.getName = function(){return "Change";};
    actions.push(change_action);
    var item_action = {};
    item_action.getName = function(){return "Use Item";};
    actions.push(item_action);
    var escape_action = {};
    escape_action.getName = function(){return "Run";};
    actions.push(escape_action);
    
    var self = this;
    this.action_callback_(actions, function(action_id)
    {
        if (action_id === 0)
        {
            self.attack(enemy, cb);
        }
        if (action_id === 1)
        {
            self.chooseMonster(cb);
        }
        if (action_id === 2)
        {
            self.useItem(cb);
        }
    });
}

PC.prototype.chooseMonster = function(cb)
{
    var actions = [];
    for (var i in this.units_)
    {
        var unit = {};
        var self = this;
        var name = function(unit_id){return self.units_[unit_id].type_}(i);
        unit.getName = function(){return name;};
        actions.push(unit);
    }
    
    var self = this;
    this.action_callback_(actions, function(unit_id)
    {
        self.current_unit_ = unit_id;
    	cb();
    });
}

PC.prototype.useItem = function(cb)
{
    var actions = [];
    for (var i in this.items_)
    {
        var unit = {};
        var self = this;
        var name = function(unit_id){return self.units_[unit_id].type_}(i);
        unit.getName = function(){return name;};
        actions.push(unit);
    }
    
    var self = this;
    this.action_callback_(actions, function(unit_id)
    {
        self.current_unit_ = unit_id;
    	cb();
    });
}

PC.prototype.attack = function(enemy, cb)
{
    var current_unit = this.getCurrentUnit();
    this.action_callback_(current_unit.actions_, function(action_id)
    {
        var action = current_unit.actions_[action_id];
        //print("PC used " + action.getName());
        enemy.receiveAction(action);
        cb();
    });
}

PC.prototype.getCurrentUnit = function()
{
    var ret = this.units_[this.current_unit_];
    if (ret.isAlive() == false)
    {
        for (var i in this.units_)
        {
            if (this.units_[i].isAlive())
            {
                this.current_unit_ = i;
                ret = this.units_[i];
                break;
            }
        }
    }
    return ret;
}

