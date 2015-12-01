function matrixContains(mat, number)
{
    var ret = [];
    for (var i = 0; i < mat.length; i++)
    {
        for (var j = 0; j < mat[i].length; j++)
        {
            if (mat[i][j] === number)
            {
                ret.push(new THREE.Vector2(i,j));
            }
        }
    }
    return ret;
}

function findInList(list, pos)
{
    for (var i = 0; i < list.length; i++)
    {
        if (list[i].pos.equals(pos))
        {
            return list[i];
        }
    }
    return undefined;
}

function flood_fill(map_data, i, j, base, replacement)
{
    var ret = [];
    var open_nodes = [new THREE.Vector2(i,j)];
    while (open_nodes.length > 0)
    {
        var cur = open_nodes.pop();
        var i = cur.x;
        var j = cur.y;
        if(map_data[i] !== undefined && map_data[i][j] !== undefined)
        {
            if (map_data[i][j] === base)
            {
                ret.push(new THREE.Vector2(i,j));
                map_data[i][j] = replacement;
                open_nodes.push(new THREE.Vector2(i,j+1));
                open_nodes.push(new THREE.Vector2(i,j-1));
                open_nodes.push(new THREE.Vector2(i+1,j));
                open_nodes.push(new THREE.Vector2(i-1,j));
            }
        }
    }
    return ret;
}

function flood_fill_elements(data, key, replacement)
{
    var ret = [];
    var cur_island = 0;
    for (var i = 0; i < data.length; i++)
    {
        for (var j = 0; j < data[i].length; j++)
        {
            if (data[i][j] === key)
            {
                ret[cur_island] = flood_fill(data, i, j,  key, replacement);
                cur_island ++;
            }
        }
    }
    return ret;
}

function getNeighbors(array, x, y)
{
    x = parseInt(x);
    y = parseInt(y);
    var ret = [];
    for (var i = -1; i < 2; i++)
    {
        ret[i+1] = [];
        for(var j = -1; j < 2; j++)
        {
            try
            {
            	ret[i+1][j+1] = array[x+i][y+j];
                if (ret[i+1][j+1] === undefined)
                {
                    ret[i+1][j+1] = -1;
                }
            }
            catch(err)
            {
                ret[i+1][j+1] = -1;
            }
        }
    }
    return ret;
}

function setBorder(array, in_type, out_type, border_type, fill_type)
{
    var ret = [];
    for (var i = 0; i < array.length; i++)
    {
        for (var j = 0; j < array[i].length; j++)
        {
            if (array[i][j] === in_type)
            {
                var neighbors = getNeighbors(array, i, j);
                if (matrixContains(neighbors, out_type).length !== 0)
                {
                    array[i][j] = border_type;
                    ret.push(new THREE.Vector2(i,j));
                }
                if (fill_type !== undefined)
                {
                    var pos = matrixContains(neighbors, fill_type);
                    if (pos.length !== 0)
                    {
                        flood_fill(array, i + pos[0].x - 1,
                            j + pos[0].y - 1,
                            fill_type, border_type);
                    }
                }
            }
        }
    }   
    return ret;
}

function getMidPoint(points)
{
    var ret = new THREE.Vector2();
    var len = points.length;
    for (var i = 0; i < len; i++)
    {
        ret.add(points[i].multiplyScalar(1/len));
    }
    return ret;
}

function aStar(data, terrain_data, init, end, exisiting_path)
{
    init.g = 0;
    var distance = new THREE.Vector2();
    distance.copy(init.pos);
    distance.sub(end.pos);
    init.f = init.h = distance.lengthManhattan();

    function getNeighborNodes(node)
    {
        var ret = [];
        var x = parseInt(node.pos.x);
        var y = parseInt(node.pos.y);

        if(data[x-1] && data[x-1][y]) {
            ret.push(new THREE.Vector2(x-1,y));
        }
        if(data[x+1] && data[x+1][y]) {
            ret.push(new THREE.Vector2(x+1,y));
        }
        if(data[x][y-1]) {
            ret.push(new THREE.Vector2(x,y-1));
        }
        if(data[x][y+1]) {
            ret.push(new THREE.Vector2(x,y+1));
        }

        return ret;
    }
    var open_list = [];
    var closed_list = [];
    open_list.push(init);

    while(open_list.length > 0)
    {
        var low_ind = 0;
        for (var i = 0; i < open_list.length; i++)
        {
            if(open_list[i].f < open_list[low_ind].f)
            {
                low_ind = i;
            }
        }

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

        open_list.splice(low_ind, 1);
        closed_list.push(cur_node);
        var neighbors = getNeighborNodes(cur_node);

        for (var i = 0; i < neighbors.length; i++)
        {
            var neighbor = neighbors[i];
            var terrain_type = terrain_data[neighbor.x][neighbor.y];
            if (findInList(closed_list, neighbor) !== undefined 
                    || (terrain_type !== TerrainConstructor.tileType.LAND 
                        && terrain_type !== TerrainConstructor.tileType.SAND))
            {
                continue;
            }

            var g_score;
            if (findInList(exisiting_path, neighbor) !== undefined)
            {
                g_score = cur_node.g;
            }
            else
            {
                g_score = cur_node.g + 15;
            }
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

    console.log("path not found between " + init.pos.x + " and " + end.pos.x);
    return [];
}

