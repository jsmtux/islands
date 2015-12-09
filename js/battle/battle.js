function UnitDisplay(parent_element, right_aligned)
{
    var row_element_player = new RowElement(parent_element);
    var self = this;

    function add_space()
    {
        new EmptyElement(row_element_player);
        new EmptyElement(row_element_player);
    }
    
    function add_info()
    {
        var container_element_player = new ContainerElement(row_element_player);
        self.name_element_ = new TextElement(container_element_player);
        new TextElement(container_element_player, "health");

        self.progress_bar_ = new ProgressBar(container_element_player);
        
        self.image_element_ = new ImageElement(row_element_player);
    }
    if (right_aligned)
    {
        add_space();
        add_info();
    }
    else
    {
        add_info();
        add_space();
    }
}

UnitDisplay.prototype.update = function(unit)
{
    this.progress_bar_.setProgress(unit.getHealthPercentage());
    this.name_element_.setText(unit.getName());
    this.image_element_.setImage(unit.getImage());
}

function Battle(player_a, player_b, parent_element)
{
    this.player_a_ = player_a;
    this.player_b_ = player_b;
    this.unit_a_display_ = new UnitDisplay(parent_element, false);
    this.unit_b_display_ = new UnitDisplay(parent_element, true);
}

Battle.prototype.iteration = function(cb)
{
    var unit_a = this.player_a_.getCurrentUnit();
    var unit_b = this.player_b_.getCurrentUnit();
    if (unit_a && unit_b)
    {
		this.updateView(unit_a, unit_b);
        ret = true;
        var this_ptr = this;
        this.player_a_.iteration(unit_b, function()
        {
            this_ptr.player_b_.iteration(unit_a, function()
            {
                this_ptr.updateView(unit_a, unit_b);
                cb();
            })
        });
    }
    else
    {
        console.log("battle ended");
    }
}

Battle.prototype.updateView = function(unit_a, unit_b)
{
    this.unit_a_display_.update(unit_a);
    this.unit_b_display_.update(unit_b);
}
