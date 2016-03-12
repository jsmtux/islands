function TerrainConstructor(size, island_function, coast_width)
{
    this.size_ = size.clone().divideScalar(2);
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
            this.tile_types_[i][j] = this.heights_[i][j] > 0 ? TerrainConstructor.tileType.LAND: TerrainConstructor.tileType.WATER;
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
    
    this.setLake();
    this.setCoast(coast_width);
    this.initHeight();
    this.getProperties();
}

TerrainConstructor.tileType = {
    WATER: 0,
    LAND: 1,
    SAND: 2,
    SEA: 3
};

TerrainConstructor.prototype.getPosInFunction = function(i, j)
{
    return new THREE.Vector2((i/this.size_.x - 0.5)*2,((j+1)/this.size_.y - 0.5)*2);
};

TerrainConstructor.prototype.getProperties = function()
{
    var res = [];
    
    for (var i in this.tile_types_)
    {
        res[i] = [];
        for (var j in this.tile_types_)
        {
            res[i][j] = 0;
            var current_tile = this.tile_types_[i][j];
            if (current_tile === TerrainConstructor.tileType.LAND 
               || current_tile === TerrainConstructor.tileType.SAND)
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

TerrainConstructor.prototype.setLake = function()
{
    flood_fill(this.tile_types_, 0, 0, TerrainConstructor.tileType.WATER, TerrainConstructor.tileType.SEA);
}

TerrainConstructor.prototype.setCoast = function(width)
{
    if (width > 1)
    {
        this.coast_line_ =
                setBorder(this.tile_types_, TerrainConstructor.tileType.LAND, TerrainConstructor.tileType.SEA, -1);
        setBorder(this.tile_types_, TerrainConstructor.tileType.LAND, -1, TerrainConstructor.tileType.SAND);
        for (var i = 0; i < this.coast_line_.length; i++)
        {
            var current = this.coast_line_[i];
            this.tile_types_[current.x][current.y] = TerrainConstructor.tileType.SAND;
        }
    }
    else
    {
        this.coast_line_ =
                setBorder(this.tile_types_, TerrainConstructor.tileType.LAND, TerrainConstructor.tileType.SEA, TerrainConstructor.tileType.SAND);
    }
    return this.coast_line_;
}

TerrainConstructor.prototype.initHeight = function()
{
    this.heights_ = [];
    for (var i in this.tile_types_)
    {
        this.heights_[i] = [];
        for (var j in this.tile_types_[i])
        {
            i = parseInt(i);
            j = parseInt(j);
            if (this.tile_types_[i][j] === TerrainConstructor.tileType.SEA)
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

TerrainConstructor.prototype.generatePoints = function()
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

        if(this.tile_types_[cur_point.pos.x][cur_point.pos.y] !== TerrainConstructor.tileType.LAND);
        {
            for(var i = 0; i < 200; i++)
            {
                if (this.tile_types_[cur_point.pos.x + i] !== undefined && this.tile_types_[cur_point.pos.x + i][cur_point.pos.y] === TerrainConstructor.tileType.LAND)
                {
                    cur_point.pos = new THREE.Vector2(cur_point.pos.x + i, cur_point.pos.y);
                    break;
                }
                if (this.tile_types_[cur_point.pos.x - i] !== undefined && this.tile_types_[cur_point.pos.x - i][cur_point.pos.y] === TerrainConstructor.tileType.LAND)
                {
                    cur_point.pos = new THREE.Vector2(cur_point.pos.x - i, cur_point.pos.y);
                    break;
                }
                if (this.tile_types_[cur_point.pos.x][cur_point.pos.y + i] === TerrainConstructor.tileType.LAND)
                {
                    cur_point.pos = new THREE.Vector2(cur_point.pos.x, cur_point.pos.y + i);
                    break;
                }
                if (this.tile_types_[cur_point.pos.x][cur_point.pos.y - i] === TerrainConstructor.tileType.LAND)
                {
                    cur_point.pos = new THREE.Vector2(cur_point.pos.x, cur_point.pos.y - i);
                    break;
                }
            }
        }
    }

    for (var p = 0; p < 1; p++)
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
    
    //return coordinates need to be in the mesh coordinate system
    for(var i = 0; i < points.length; i++)
    {
        points[i].pos.multiplyScalar(2);
    }

    return points;
}

TerrainConstructor.prototype.getInfo = function(paths)
{
    var material_ind = {};
    material_ind[TerrainConstructor.tileType.WATER] = 'images/water.png';
    material_ind[TerrainConstructor.tileType.LAND] = 'images/ground.png';
    material_ind[TerrainConstructor.tileType.SAND] = 'images/sand.png';
    material_ind[TerrainConstructor.tileType.SEA] = 'images/water.png';

    var border_types = {
        SW:[1,0,0,0],
        SE:[0,1,0,0],
        NW:[0,0,1,0],
        NE:[0,0,0,1],
        EN:[0,1,1,1],
        WN:[1,0,1,1],
        ES:[1,1,0,1],
        WS:[1,1,1,0],
        S:[1,1,0,0],
        N:[0,0,1,1],
        W:[1,0,1,0],
        E:[0,1,0,1]
    };
    
    var opposite_borders = {
        SW:"EN",
        SE:"WN",
        NW:"ES",
        NE:"WS",
        EN:"SW",
        WN:"SE",
        ES:"NW",
        WS:"NE",
        S:"N",
        N:"S",
        W:"E",
        E:"W"
    };

    var sand_water_set = {
        SW:'images/sand_water_sw.png',
        SE:'images/sand_water_se.png',
        NW:'images/sand_water_nw.png',
        NE:'images/sand_water_ne.png',
        EN:'images/sand_water_en.png',
        WN:'images/sand_water_wn.png',
        ES:'images/sand_water_es.png',
        WS:'images/sand_water_ws.png',
        S:'images/sand_water_s.png',
        N:'images/sand_water_n.png',
        W:'images/sand_water_w.png',
        E:'images/sand_water_e.png'
    };

    var ground_sand_set = {
        E:'images/ground_sand_e.png',
        W:'images/ground_sand_w.png',
        N:'images/ground_sand_n.png',
        S:'images/ground_sand_s.png',
        NE:'images/ground_sand_en.png',
        NW:'images/ground_sand_wn.png',
        SE:'images/ground_sand_es.png',
        SW:'images/ground_sand_ws.png',
        EN:'images/ground_sand_ne.png',
        WN:'images/ground_sand_nw.png',
        ES:'images/ground_sand_se.png',
        WS:'images/ground_sand_sw.png'
    };

    var material_border = [];
    material_border[TerrainConstructor.tileType.SAND] = [];
    material_border[TerrainConstructor.tileType.SAND][TerrainConstructor.tileType.SEA] = sand_water_set;
    material_border[TerrainConstructor.tileType.LAND] = [];
    material_border[TerrainConstructor.tileType.LAND][TerrainConstructor.tileType.SAND] = ground_sand_set;
    
    var ret_url = [];
    var ret_over_url = [];
    var ret_can_walk = [];
    var ret_height = [];
    
    // Add materialIndex to face
    for (var i = 0; i < this.size_.x * 2; i++)
    {
        ret_url[i] = [];
        ret_over_url[i] = [];
        ret_can_walk[i] = [];
        ret_height[i] = [];
        for(var j = 0; j < this.size_.y * 2; j++)
        {
            var x = Math.floor(i/2);
            var y = Math.floor(j/2);
            
            var match_types = [];
            
            if ((i%2 !== 0 && j%2 !== 0) && (this.tile_types_[x+1] !== undefined))
            {
                match_types.push(this.tile_types_[x][y]);
                match_types.push(this.tile_types_[x+1][y]);
                match_types.push(this.tile_types_[x][y+1]);
                match_types.push(this.tile_types_[x+1][y+1]);
            }
            else if ((i%2 !== 0) && (this.tile_types_[x+1] !== undefined))
            {
                match_types.push(this.tile_types_[x][y]);
                match_types.push(this.tile_types_[x+1][y]);
                match_types.push(this.tile_types_[x][y]);
                match_types.push(this.tile_types_[x+1][y]);
            }
            else if (j%2 !== 0)
            {
                match_types.push(this.tile_types_[x][y]);
                match_types.push(this.tile_types_[x][y]);
                match_types.push(this.tile_types_[x][y+1]);
                match_types.push(this.tile_types_[x][y+1]);
            }
            else
            {
                match_types.push(this.tile_types_[x][y]);
                match_types.push(this.tile_types_[x][y]);
                match_types.push(this.tile_types_[x][y]);
                match_types.push(this.tile_types_[x][y]);
            }

            var ground_types = [];
            
            for(var ind = 0; ind < match_types.length; ind ++)
            {
                var type = ground_types.indexOf(match_types[ind]);
                if (type === -1 && match_types[ind] !== undefined)
                {
                    ground_types.push(match_types[ind]);
                }
            }
            
            for (var ind = 0; ind < match_types.length; ind ++)
            {
                if (match_types[ind] === ground_types[0] || match_types[ind] === undefined)
                {
                    match_types[ind] = 0;
                }
                else
                {
                    match_types[ind] = 1;
                }
            }
            
            var border_type;
            var keys = Object.keys(border_types);
            for (var a = 0; a < keys.length; a++)
            {
                var equals = true;
                for(var b = 0; b < border_types[keys[a]].length; b++)
                {
                    if (border_types[keys[a]][b] !== match_types[b])
                    {
                        equals = false;
                        break;
                    }
                }
                if (equals)
                {
                    border_type = keys[a];
                    break;
                }
            } 
            
            var index = material_ind[0];
            
            if (ground_types.length === 1)
            {
                index = material_ind[ground_types[0]];
            }
            else if (ground_types.length === 2)
            { 
                var mat_a = ground_types[0];
                var mat_b = ground_types[1];
                if (material_border[mat_a] !== undefined && material_border[mat_a][mat_b] !== undefined)
                {
                    var tmp = material_border[mat_a][mat_b][border_type];
                    if (tmp !== undefined)
                    {
                        index = tmp;
                    }
                }
                else if (material_border[mat_b] !== undefined && material_border[mat_b][mat_a] !== undefined)
                {
                    var tmp = material_border[mat_b][mat_a][opposite_borders[border_type]];
                    if (tmp !== undefined)
                    {
                        index = tmp;
                    }
                }
            }
            else
            {
                console.log("unhandled case for " + ground_types.length + "different ground types");
            }
            
            var can_walk = [TerrainConstructor.tileType.LAND, TerrainConstructor.tileType.SAND].indexOf(this.tile_types_[x][y]) !== -1 ? true : false;
            
            ret_url[i][j] = index;
            ret_over_url[i][j] = 0;
            ret_can_walk[i][j] = can_walk;
            ret_height[i][j] = this.heights_[x][y]*0.5;
        }
    }
    return new Terrain(this.size_.clone().multiplyScalar(2), ret_url, ret_over_url, ret_can_walk, ret_height, this.tile_types_);
}

