function UnitDefinition(name, energy, defense, attack, speed, image)
{
    this.name_ = name;
    this.actions_ = [];
    this.energy_ = energy;
    this.defense_ = defense;
    this.attack_ = attack;
    this.speed_ = speed;
    this.image_ = image;
}

UnitDefinition.prototype.addAction = function(action)
{
    this.actions_.push(action);
}


