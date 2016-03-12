var attacks = {
    basic_attack: new AttackAction("basic atk", 5),
    defense_attack: new DefenseAttackAction("basic def atk", 0.05)
}

var units = {  
}

function initUnits()
{
    var base_unit = new UnitDefinition("TreeMonster", 25, 2, 1, 0.2, "html_images/389.gif");
    base_unit.addAction(attacks.basic_attack);
    base_unit.addAction(attacks.defense_attack);
    
    units["tree_monster"] = base_unit;

    var unit_2 = new UnitDefinition("GrassMonster", 25, 2, 1, 0.2, "html_images/650.gif");
    unit_2.addAction(attacks.basic_attack);
    unit_2.addAction(attacks.defense_attack);
    
    units["grass_monster"] = unit_2;
}
initUnits();