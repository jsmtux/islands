function start_battle(){

    var body_element = new BodyElement(document.body);
    
	function showActions(parent_element, text, list, cb)
	{
        var actions_window = new MainWindow(parent_element);
        new TextElement(actions_window.getRow(), text);
        var button_box = actions_window.getRow();
        var button1 = new Button(button_box);
        if (list[0])
        {
            button1.setCallback(function(){cb(0)});
            new TextElement(button1, list[0]);
        }
        var button2 = new Button(button_box);
        if (list[1])
        {
            button2.setCallback(function(){cb(1)});
            new TextElement(button2, list[1]);
        }
        var button_box_2 = actions_window.getRow();
        var button3 = new Button(button_box_2);
        if (list[2])
        {
            button3.setCallback(function(){cb(2)});
            new TextElement(button3, list[2]);
        }
        var button4 = new Button(button_box_2);
        if (list[3])
        {
            button4.setCallback(function(){cb(3)});
            new TextElement(button4, list[3]);
        }
        return actions_window;
	}
    
    function ActionControls(parent_element)
    {
        this.parent_element_ = parent_element;
        this.element_;
    }
    
    ActionControls.prototype.chooseAction = function(list, callback)
    {
        var texts = [];
        for (var i = 0; i < list.length; i++)
        {
            texts.push(list[i].getName());
        }
        this.remove();
        this.element_ = showActions(this.parent_element_, "Choose action", texts, callback);
    }
    
    ActionControls.prototype.remove = function()
    {
        if (this.element_)
        {
            this.element_.remove()
        }
        this.element_ = undefined;
    }

    action_contols = new ActionControls(body_element);
	var player_a = new PC(function(list, cb){action_contols.chooseAction(list, cb)});
	var player_b = new NPC();

	var basic_attack = new AttackAction("basic atk", 5);
	var defense_attack = new DefenseAttackAction("basic def atk", 0.05);

	var base_unit = new UnitDefinition("TreeMonster", 25, 2, 1, 0.2, "html_images/389.gif");
	base_unit.addAction(basic_attack);
	base_unit.addAction(defense_attack);
        
        var unit_2 = new UnitDefinition("GrassMonster", 25, 2, 1, 0.2, "html_images/650.gif");
        unit_2.addAction(basic_attack);
        unit_2.addAction(defense_attack);
	
	var unit_a = new Unit(base_unit);
	var unit_b = new Unit(unit_2);
	var unit_c = new Unit(base_unit);
	var unit_d = new Unit(unit_2);

	player_a.units_.push(unit_a);
	player_a.units_.push(unit_d);
	player_b.units_.push(unit_b);
	player_b.units_.push(unit_c);
	
    var battle = new Battle(player_a, player_b, body_element);
    
    
	function iterate()
	{
	    battle.iteration(iterate);
	}		

	iterate();
}
