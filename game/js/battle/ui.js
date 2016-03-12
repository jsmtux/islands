function Widget()
{
    this.row_type_ = false;
}

Widget.prototype.setElement = function(type, class_name)
{
    this.element_ = document.createElement(type);
    this.element_.className = class_name;
}

Widget.prototype.setParent = function(parent_element)
{
    this.parent_element_ = parent_element.element_;
    if (parent_element.row_type_ == true)
    {
        this.element_.style.display = "table-cell";
        this.element_.style.margin = "auto";
        parent_element.addElement(this);
    }
    this.reference_ = this.parent_element_.appendChild(this.element_);
}

Widget.prototype.remove = function()
{
    this.parent_element_.removeChild(this.reference_);
}

Widget.prototype.hide = function()
{
    if (this.prev_display_ === undefined)
    {
        this.prev_display_ = this.element_.style.display;
    }
    this.element_.style.display = "none";
}

Widget.prototype.show = function()
{
    this.element_.style.display = this.prev_display_ || "block";
}

function BodyElement(body_div)
{
    this.element_ = body_div;
}

BodyElement.prototype = Object.create(Widget.prototype);
BodyElement.prototype.constructor = BodyElement;

BodyElement.prototype.remove = function()
{
    console.log("root element cannot be removed");
}

function EmptyElement(parent_element)
{
    this.setElement("div");
    this.setParent(parent_element);
}

EmptyElement.prototype = Object.create(Widget.prototype);
EmptyElement.prototype.constructor = EmptyElement;

function MainWindow(parent_element)
{
    this.setElement("div", "window");
    this.setParent(parent_element);
}

MainWindow.prototype = Object.create(Widget.prototype);
MainWindow.prototype.constructor = MainWindow;

MainWindow.prototype.getRow = function()
{
    return new RowElement(this);
}

function ContainerElement(parent_element)
{
    this.setElement("div", "");
    this.setParent(parent_element);
}

ContainerElement.prototype = Object.create(Widget.prototype);
ContainerElement.prototype.constructor = ContainerElement;

function PanelElement(parent_element)
{
    this.setElement("div", "panel-element");
    this.setParent(parent_element);
}

PanelElement.prototype = Object.create(Widget.prototype);
PanelElement.prototype.constructor = ContainerElement;

function ProgressBar(parent_element)
{
    this.setElement("div", "progressbar");
    var back_element = document.createElement("div");
    back_element.className = "progress-back";
    var bar_element = document.createElement("div");
    bar_element.className = "progress-fill";
    var clear_element = document.createElement("div");
    clear_element.className = "clear-div";
    this.element_.appendChild(back_element);
    this.element_.appendChild(bar_element);
    this.element_.appendChild(clear_element);
    this.bar_element_ = bar_element;
    this.setParent(parent_element);
}

ProgressBar.prototype = Object.create(Widget.prototype);
ProgressBar.prototype.constructor = ProgressBar;

ProgressBar.prototype.setProgress = function(progress)
{
    this.bar_element_.style.width = progress*0.95+"%";
}

function RowElement(parent_element)
{
    this.row_type_ = true;
    this.setElement("div", "row_element");
    this.element_.style.display = "flex";
    this.element_.style.justifyContent = "space-around";
    this.element_.style.flexFlow = "row wrap";
    this.setParent(parent_element);
    this.contained_elements_ = [];
}

RowElement.prototype = Object.create(Widget.prototype);
RowElement.prototype.constructor = RowElement;

RowElement.prototype.addElement = function(element)
{
    this.contained_elements_.push(element);
    for (var i = 0; i < this.contained_elements_.length; i++)
    {
        var width = 90 / this.contained_elements_.length;
        this.contained_elements_[i].element_.style.width = width + "%";
    }
}

function Button(parent_element)
{
    this.setElement("div", "button");
    this.callback_;
    this.setParent(parent_element);
    var self = this;
    this.element_.onclick = function()
    {
        if (self.callback_ !== undefined)
        {
            self.callback_();
        }
    }
}

Button.prototype = Object.create(Widget.prototype);
Button.prototype.constructor = Button;

Button.prototype.setCallback = function(callback)
{
    this.callback_ = callback;
}

function TextElement(parent_element, text)
{
    this.setElement("div");
    this.element_.innerHTML = text;
    this.setParent(parent_element);
}

TextElement.prototype = Object.create(Widget.prototype);
TextElement.prototype.constructor = TextElement;

TextElement.prototype.setText = function(text)
{
    this.element_.innerHTML = text;
}

function ImageElement(parent_element, image_path)
{
    this.setElement("div");
    this.img_element_ = document.createElement("img");
    this.img_element_.src = image_path;
    this.element_.appendChild(this.img_element_);
    this.setParent(parent_element);
}

ImageElement.prototype = Object.create(Widget.prototype);
ImageElement.prototype.constructor = ImageElement;

ImageElement.prototype.setImage = function(path)
{
    this.img_element_.src = path;
}


