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

function flood_fill(map_data, x, y, base, replacement)
{
    var ret = [];
    var open_nodes = [new THREE.Vector2(x,y)];
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
