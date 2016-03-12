function UnitAction(name)
{
    this.name_ = name;
}

UnitAction.prototype.getName = function()
{
    return this.name_;
}

function AttackAction(name, val)
{
    UnitAction.call(this, name);
    this.value_ = val;
}

AttackAction.prototype = Object.create(UnitAction.prototype);
AttackAction.prototype.constructor = AttackAction;

AttackAction.prototype.exec = function(unit)
{
    unit.stats_.health -= this.value_ / (unit.defense_ + unit.stats_.defense);
}

function DefenseAttackAction(name, val)
{
    UnitAction.call(this, name);
    this.value_ = val;
}

DefenseAttackAction.prototype = Object.create(UnitAction.prototype);
DefenseAttackAction.prototype.constructor = DefenseAttackAction;

DefenseAttackAction.prototype.exec = function(unit)
{
    unit.stats_.defense -= this.value_;
}

