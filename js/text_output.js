var out_div;

function print(text)
{
    out_div.innerHTML += text;
}

TerrainConstructor.prototype.print = function(path)
{
    if (path === undefined)
    {
        path = [];
    }
    for (var i = 0; i < this.tile_types_.length; i++)
    {
        for (var j = 0; j < this.tile_types_[i].length; j++)
        {
        
            var char = this.tile_types_[i][j];
            if (findInList(path, new THREE.Vector2(i, j)))
            {
                char = "x";
            }
            else
            {
                switch (char)
                {
                    case 0:
                        char = '*';
                        break;
                    case 1:
                        char = '#';
                        break;
                    case 2:
                        char = '/';
                        break;
                    case 3:
                        char = '.';
                        break;
                }
            }
            print(char + "  ");
        }
        print("<br>");
    }
}

TerrainConstructor.prototype.printHeight = function(path)
{
    if (path === undefined)
    {
        path = [];
    }
    for (var i = 0; i < this.tile_types_.length; i++)
    {
        for (var j = 0; j < this.tile_types_[i].length; j++)
        {
            var char = Math.floor(this.heights_[i][j]);
            if (findInList(path, new THREE.Vector2(i, j)))
            {
                char = "x";
            }
            print(char + "  ");
        }
        print("<br>");
    }
}

