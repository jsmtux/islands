function Terrain(size, island_function)
{
    this.size_ = size;
    this.island_function_ = island_function;
    this.heights_ = [];
    this.coast_line_ = [];
    this.mid_points_ = [];

    //generate shape according to function
    this.tile_types_ = [];
    
    for(var i = 0; i < this.size_.x; i++)
    {
        this.tile_types_[i] = [];
        this.heights_[i] = [];
        var prev_going_up = undefined;
        for(var j = 0; j < this.size_.y; j++)
        {
            var pos = this.getPosInFunction(i,j);
            this.heights_[i][j] = this.island_function_.getValue(pos);
            this.tile_types_[i][j] = this.heights_[i][j] > 0 ? Terrain.tileType.LAND: Terrain.tileType.WATER;
        }
    }
    var tmp_mid_points_x = [];
    for(var i = 0; i < this.size_.x; i++)
    {
        var prev_going_up = undefined;
        for(var j = 0; j < this.size_.y - 1; j++)
        {
            var going_up = this.heights_[i][j] < this.heights_[i][j+1];
            if (prev_going_up === undefined)
            {
                prev_going_up = going_up;
            }
            if (prev_going_up !== going_up)
            {
                tmp_mid_points_x.push(new THREE.Vector2(i,j));
            }
            prev_going_up = going_up;
        }
    }
    
    
    var tmp_mid_points_y = [];
    for(var j = 0; j < this.size_.y; j++)
    {
        var prev_going_up = undefined;
        for(var i = 0; i < this.size_.x - 1; i++)
        {
            var pos = this.getPosInFunction(i,j);
            var going_up = this.heights_[i][j] < this.heights_[i+1][j];
            if (prev_going_up === undefined)
            {
                prev_going_up = going_up;
            }
            if (prev_going_up !== going_up)
            {
                tmp_mid_points_y.push(new THREE.Vector2(i,j));
            }
            prev_going_up = going_up;
        }
    }
    for (var i = 0; i < tmp_mid_points_x.length; i++)
    {
        for (var j = 0; j < tmp_mid_points_y.length; j++)
        {
            if (tmp_mid_points_x[i].equals(tmp_mid_points_y[j]))
            {
                this.mid_points_.push(tmp_mid_points_x[i]);
                break;
            }
        }
    }
}

Terrain.tileType = {
    WATER: 0,
    LAND: 1,
    SAND: 2,
    SEA: 3
};

Terrain.prototype.getPosInFunction = function(i, j)
{
    return new THREE.Vector2((i/this.size_.x - 0.5)*2,((j+1)/this.size_.y - 0.5)*2);
};

Terrain.prototype.getProperties = function()
{
    var res = [];
    
    for (var i in this.tile_types_)
    {
        res[i] = [];
        for (var j in this.tile_types_)
        {
            res[i][j] = 0;
            var current_tile = this.tile_types_[i][j];
            if (current_tile === Terrain.tileType.LAND 
               || current_tile === Terrain.tileType.SAND)
            {
                res[i][j] = 1;
            }
        }
    }
    var cur_island = 2;
    var stats = [];
    for (var i in res)
    {
        for (var j in res[i])
        {
            if (res[i][j] === 1)
            {
    		stats[cur_island - 2] = flood_fill(res, parseInt(i), parseInt(j), 1, cur_island++);
            }
        }
    }
    console.log("There are " + stats.length + " islands");
    for (var i in stats)
    {
        console.log("island " + i + " has size " + stats[i].length);
    }
}

Terrain.prototype.setLake = function()
{
    flood_fill(this.tile_types_, 0, 0, Terrain.tileType.WATER, Terrain.tileType.SEA);
}

Terrain.prototype.setCoast = function()
{
    this.coast_line_ =
            setBorder(this.tile_types_, Terrain.tileType.LAND, Terrain.tileType.SEA, Terrain.tileType.SAND);
    return this.coast_line_;
}

Terrain.prototype.initHeight = function()
{
    this.heights_ = [];
    for (var i in this.tile_types_)
    {
        this.heights_[i] = [];
        for (var j in this.tile_types_[i])
        {
            i = parseInt(i);
            j = parseInt(j);
            if (this.tile_types_[i][j] === Terrain.tileType.SEA)
            {
                this.heights_[i][j] = 0;
            }
            else
            {
                this.heights_[i][j] = 1;
            }
        }
    }
}

Terrain.prototype.setHeight = function()
{
}

Terrain.prototype.generatePoints = function()
{
    var points = []; 
    for (var i = 0; i < this.mid_points_.length; i++)
    {
        var point = this.mid_points_[i];
        var node = {};
        node.pos = point;
        points.push(node);
    }
    console.log("got " + this.mid_points_.length + " mid points");

    for (var ind = 0; ind < points.length; ind++)
    {
        var cur_point = points[ind];

        if(this.tile_types_[cur_point.pos.x][cur_point.pos.y] !== Terrain.tileType.LAND);
        {
            for(var i = 0; i < 200; i++)
            {
                if (this.tile_types_[cur_point.pos.x + i] !== undefined && this.tile_types_[cur_point.pos.x + i][cur_point.pos.y] === Terrain.tileType.LAND)
                {
                    cur_point.pos = new THREE.Vector2(cur_point.pos.x + i, cur_point.pos.y);
                    break;
                }
                if (this.tile_types_[cur_point.pos.x - i] !== undefined && this.tile_types_[cur_point.pos.x - i][cur_point.pos.y] === Terrain.tileType.LAND)
                {
                    cur_point.pos = new THREE.Vector2(cur_point.pos.x - i, cur_point.pos.y);
                    break;
                }
                if (this.tile_types_[cur_point.pos.x][cur_point.pos.y + i] === Terrain.tileType.LAND)
                {
                    cur_point.pos = new THREE.Vector2(cur_point.pos.x, cur_point.pos.y + i);
                    break;
                }
                if (this.tile_types_[cur_point.pos.x][cur_point.pos.y - i] === Terrain.tileType.LAND)
                {
                    cur_point.pos = new THREE.Vector2(cur_point.pos.x, cur_point.pos.y - i);
                    break;
                }
            }
        }
    }

    for (var p = 0; p < 3; p++)
    {
        var max_len = 0;
        var max_ind = 0;
        for (var i = 0; i < this.coast_line_.length; i++)
        {
            var len = undefined;
            for (var x = 0; x < points.length; x++)
            {
                var cur_len = points[x].pos.distanceToSquared(this.coast_line_[i]);
                if (len === undefined || cur_len < len)
                {
                    len = cur_len;
                }
            }
            if (len > max_len)
            {
                max_len = len;
                max_ind = i;
            }
        }
        var node = {};
        node.pos = this.coast_line_[max_ind];
        points.push(node);
    }

    return points;
}

function createTerrain(size, terrain_function)
{
    var terrain = new Terrain(size, terrain_function);
    terrain.setLake();
    terrain.setCoast();
    terrain.initHeight();
    terrain.setHeight();
    terrain.getProperties();
    
    return terrain;
}
