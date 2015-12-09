function Unit(unitDefinition, name)
{
    this.name_ = name || unitDefinition.name_;
    this.type_ = unitDefinition.name_;
    this.actions_ = unitDefinition.actions_;
    this.energy_ = unitDefinition.energy_;
    this.defense_ = unitDefinition.defense_;
    this.attack_ = unitDefinition.attack_;
    this.speed_ = unitDefinition.speed_;
    this.stats_ ={
        "health":this.energy_,
        "defense":0,
        "attack":0,
        "speed":0,
    }
}

Unit.prototype.isAlive = function()
{
    return this.stats_.health > 0;
}

Unit.prototype.receiveAction = function(action, enemy)
{
    if (Math.random() > this.speed_)
    {
    	action.exec(this);
    }
    else
    {
        //print("avoided attack");
    }
}

Unit.prototype.getName = function()
{
    return this.name_;
}

Unit.prototype.getHealthPercentage = function()
{
    return (this.stats_.health / this.energy_) * 100;
}
