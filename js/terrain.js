function TerrainTile(terrain, i, j)
{
    this.terrain_ = terrain;
    this.i_ = i;
    this.j_ = j
}

TerrainTile.prototype.get_url = function()
{
    return this.terrain_.urls_[this.i_][this.j_];
}

TerrainTile.prototype.get_over_url = function()
{
    return this.terrain_.over_urls_[this.i_][this.j_];
}

TerrainTile.prototype.set_over_url = function(value)
{
    this.terrain_.over_urls_[this.i_][this.j_] = value;
}

TerrainTile.prototype.get_can_walk = function()
{
    return this.terrain_.can_walks_[this.i_][this.j_];
}

TerrainTile.prototype.get_height = function()
{
    return this.terrain_.heights_[this.i_][this.j_];
}

function Terrain(size, urls, over_urls, heights, can_walks)
{
    this.size_ = size;
    this.urls_ = urls;
    this.over_urls_ = over_urls;
    this.heights_ = heights;
    this.can_walks_ = can_walks;
}

Terrain.prototype.getTile = function(i, j)
{
    return new TerrainTile(this, i, j);
}

Terrain.prototype.getSize = function()
{
    return this.size_;
}

Terrain.prototype.aStar = function(init, end)
{
    init.g = 0;
    var distance = new THREE.Vector2();
    distance.copy(init.pos);
    distance.sub(end.pos);
    init.f = init.h = distance.lengthManhattan();

    var self = this;
    function getNeighborNodes(node)
    {
        var ret = [];
        var x = parseInt(node.pos.x);
        var y = parseInt(node.pos.y);

        if(self.urls_[x-1] && self.urls_[x-1][y]) {
            ret.push(new THREE.Vector2(x-1,y));
        }
        if(self.urls_[x+1] && self.urls_[x+1][y]) {
            ret.push(new THREE.Vector2(x+1,y));
        }
        if(self.urls_[x][y-1]) {
            ret.push(new THREE.Vector2(x,y-1));
        }
        if(self.urls_[x][y+1]) {
            ret.push(new THREE.Vector2(x,y+1));
        }

        return ret;
    }
    var open_list = [];
    var closed_list = [];
    open_list.push(init);

    while(open_list.length > 0)
    {
        function get_lowest()
        {
            var low_ind = 0;
            for (var i = 0; i < open_list.length; i++)
            {
                if(open_list[i].f < open_list[low_ind].f)
                {
                    low_ind = i;
                }
            }
            return low_ind;
        }

        var low_ind = get_lowest();
        var cur_node = open_list[low_ind];

        if (cur_node.pos.equals(end.pos))
        {
            var ret = [];
            while(!cur_node.pos.equals(init.pos))
            {
                ret.push(cur_node);
                cur_node = cur_node.parent;
            }
            return ret;
        }

        function remove_one()
        {
            open_list.splice(low_ind, 1);
            closed_list.push(cur_node);
        };
        remove_one();

        function processNeighbors(neighbors)
        {
            for (var i = 0; i < neighbors.length; i++)
            {
                var neighbor = neighbors[i];
                if (findInList(closed_list, neighbor) !== undefined || !self.getTile(neighbor.x,neighbor.y).get_can_walk())
                {
                    continue;
                }

                var g_score;
                function check_path()
                {
                    if (self.getTile(neighbor.x,neighbor.y).get_over_url() === 1)
                    {
                        g_score = cur_node.g;
                    }
                    else
                    {
                        g_score = cur_node.g + 1;
                    }
                }
                check_path();
                var best_score = false;

                var equal_neighbor = findInList(open_list, neighbor);
                if (equal_neighbor === undefined)
                {
                    best_score = true;
                    equal_neighbor = {};
                    equal_neighbor.h = neighbor.lengthManhattan(end.pos);
                    equal_neighbor.pos = neighbor;
                    open_list.push(equal_neighbor);
                }
                else if (g_score < equal_neighbor.g)
                {
                    best_score = true;
                }

                if (best_score)
                {
                    equal_neighbor.parent = cur_node;
                    equal_neighbor.g = g_score;
                    equal_neighbor.f = neighbor.g + neighbor.h;
                }
            }
        }
        processNeighbors(getNeighborNodes(cur_node));
    }

    console.log("path not found between " + init.pos.x + " and " + end.pos.x);
    return [];
}