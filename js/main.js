var camera, scene, renderer, geometry, material, mesh;

function matrixContains(mat, number)
{
    var ret = [];
    for (var i in mat)
    {
        for (var j in mat[i])
        {
            if (mat[i][j] === number)
            {
                ret.push(new THREE.Vector2(i,j));
            }
        }
    }
    return ret;
}

function flood_fill(map_data, i, j, base, replacement)
{
    var ret = 0;
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
                ret ++;
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

function setBorder(array, out_type, in_type, border_type, fill_type)
{
    var ret = [];
    for (var i in array)
    {
        for (var j in array[i])
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
                        flood_fill(array, parseInt(i) + parseInt(pos[0].x) - 1,
                            parseInt(j) + parseInt(pos[0].y) - 1,
                            fill_type, border_type);
                    }
                }
            }
        }
    }   
    return ret;
}

function setup()
{
    init();
    animate();
}

function RoundFunction(rad)
{
    this.rad_ = rad;
}

RoundFunction.prototype.isGround = function(position)
{
    return position.length() < this.rad_;
}

function RadialFunction(island_factor, rand)
{
    this.island_factor_ = island_factor;
    this.rand_ = rand;
    
    this.bumps_ = this.rand_.next(1, 6);
    this.bumps_ = Math.floor(this.bumps_);
    
    this.start_angle_ = this.rand_.next(0, 2*Math.PI);
    this.dip_angle_ = this.rand_.next(0, 2*Math.PI);
    this.dip_width_ = this.rand_.next(0.2, 0.7);
}

RadialFunction.prototype.isGround = function(pos)
{
    var angle = Math.atan2(pos.y, pos.x);
    var length = 0.5 * (Math.max(Math.abs(pos.x), Math.abs(pos.y)) + pos.length());

    var r1 = 0.5 + 0.4*Math.sin(this.start_angle_ + this.bumps_*angle + Math.cos((this.bumps_+3)*angle));
    var r2 = 0.7 - 0.2*Math.sin(this.start_angle_ + this.bumps_*angle - Math.sin((this.bumps_+2)*angle));
    
    if (Math.abs(angle - this.dip_angle_) < this.dip_width_
            || Math.abs(angle - this.dip_angle_ + 2 * Math.PI) < this.dip_width_
            || Math.abs(angle - this.dip_angle_ - 2 * Math.PI) < this.dip_width_)
    {
        r1 = r2 = 0.2;
    }

    return (length < r1 || (length > r1*this.island_factor_ && length < r2));
}

function NoiseFunction(skip, seed)
{
    if (seed === undefined)
    {
        seed = Math.random();
        console.log("Seed is: " + seed);
    }
    noise.seed(seed);
    this.skip_ = skip;
}

NoiseFunction.prototype.isGround = function(pos)
{
    var raw_noise = (noise.simplex2(pos.x*this.skip_, pos.y*this.skip_) + 1) / 2;
    return raw_noise > (0.3+0.9*Math.pow(pos.length(),3));
};

function Terrain(size, island_function)
{
    this.size_ = size;
    this.island_function_ = island_function;
    this.heights_;
    this.coast_line_;

    //generate shape according to function
    this.tile_types_ = [];
    for(var i = 0; i < this.size_.x; i++)
    {
        this.tile_types_[i] = [];
        for(var j = 0; j < this.size_.y; j++)
        {
            var pos = new THREE.Vector2((i/this.size_.x - 0.5)*2,(j/this.size_.y - 0.5)*2)
            this.tile_types_[i][j] = this.island_function_.isGround(pos) ? 
                Terrain.tileType.LAND: Terrain.tileType.WATER;
        }
    }
}

Terrain.tileType = {
    WATER: 0,
    LAND: 1,
    SAND: 2,
    SEA: 3
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
        console.log("island " + i + " has size " + stats[i]);
    }
}

Terrain.prototype.setLake = function()
{
    flood_fill(this.tile_types_, 0, 0, Terrain.tileType.WATER, Terrain.tileType.SEA);
}

Terrain.prototype.setCoast = function()
{
    this.coast_line_ =
            setBorder(this.tile_types_, Terrain.tileType.SEA, Terrain.tileType.LAND, Terrain.tileType.SAND);
}

Terrain.prototype.setHeight = function()
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
            else if (this.tile_types_[i][j] === Terrain.tileType.WATER)
            {
                this.heights_[i][j] = -2;
            }
            else
            {
                this.heights_[i][j] = -1;
            }
        }
    }
    var max_height = 1;
    var last_changed = [];
    do {
        last_changed = setBorder(this.heights_, max_height-1, -1, max_height, -2);
        max_height++;
    }
    while (last_changed.length !== 0);
}

function createMesh(tile_types, heights)
{
    var texloader = new THREE.TextureLoader();
    var water = texloader.load('images/water.png');
    var ground = texloader.load('images/ground.png');
    var sand = texloader.load('images/sand.png');
    // geometry
    var geometry = new THREE.PlaneGeometry(500, 500, tile_types.length, tile_types[0].length);

    // materials
    var materials = [];
    materials.push(new THREE.MeshBasicMaterial({
        map: water}));
    materials.push(new THREE.MeshBasicMaterial({
        map: ground}));
    materials.push(new THREE.MeshBasicMaterial({
        map: sand}));

    var material_ind = {};
    material_ind[Terrain.tileType.LAND] = 1;
    material_ind[Terrain.tileType.SAND] = 2;
    material_ind[Terrain.tileType.SEA] = 0;
    material_ind[Terrain.tileType.WATER] = 0;

    var uvs = [new THREE.Vector2(0,0),
        new THREE.Vector2(1,0),
        new THREE.Vector2(1,1),
        new THREE.Vector2(0,1)];
    
    // Add materialIndex to face
    var l = geometry.faces.length / 2;
    for (var i = 0; i < l; i++) {
        var j = 2 * i;
        var x = Math.floor(i / tile_types.length);
        var y = i % tile_types.length;
        var index = material_ind[tile_types[y][x]];
        geometry.faces[j].materialIndex = index;
        geometry.faceVertexUvs[0][j] = [uvs[0], uvs[1], uvs[3]];
        geometry.faces[j + 1].materialIndex = index;
        geometry.faceVertexUvs[0][j+1] = [uvs[1], uvs[2], uvs[3]];  
        
        if (heights !== undefined)
        {
            var height = heights[y][x]*3;
            geometry.vertices[geometry.faces[j].a].z = height;
            geometry.vertices[geometry.faces[j].b].z = height;
            geometry.vertices[geometry.faces[j].c].z = height;
            geometry.vertices[geometry.faces[j+1].a].z = height;
            geometry.vertices[geometry.faces[j+1].b].z = height;
            geometry.vertices[geometry.faces[j+1].c].z = height;
        }
    }

    // mesh
    return new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
}

var mesh;

function init() {
    var random = new RandGenerator();

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 600;
    scene.add(camera);

    var terrainSize = new THREE.Vector2(100, 100);
    
    var terrainFunction = new RoundFunction(0.5);
    var terrainFunction2 = new RadialFunction(1.07, random);
    //lake island:, 0.702325296588242
    var terrainFunction3 = new NoiseFunction(1);

    var terrain = new Terrain(terrainSize, terrainFunction3);
    terrain.setLake();
    terrain.setCoast();
    terrain.setHeight();
    terrain.getProperties();
    mesh = createMesh(terrain.tile_types_, terrain.heights_);
    
    mesh.rotation.x = -Math.PI / 2.5;
    
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

}

function animate() {

    requestAnimationFrame(animate);
    render();

}

function render() {
    renderer.render(scene, camera);
    mesh.rotation.z += 0.005;
}
