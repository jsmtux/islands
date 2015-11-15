var camera, scene, renderer, geometry, material, mesh;


function setup()
{
    out_div = document.getElementById("out");
    init();
    animate();
}

function MaterialManager(texloader)
{
    this.texloader_ = texloader;
    this.materials_ = [];
    this.material_ind_ = {};
    this.vert_shader_ = document.getElementById('vertex_shh').innerHTML;
    this.frag_shader_ = document.getElementById('fragment_shh').innerHTML;
    this.cover_tex_ = texloader.load('images/path.png');
}

MaterialManager.prototype.loadMaterial = function(path, road)
{
    var ret;
    if (this.material_ind_[path])
    {
        ret = this.material_ind_[path][road];
    }
    else
    {
        this.material_ind_[path] = {};
    }

    if (ret === undefined)
    {
        var uniforms = {
            tOne: { type: "t", value: this.texloader_.load(road) },
            tSec: { type: "t", value: this.texloader_.load(path)}
        };
        var multitexture_material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: this.vert_shader_,
            fragmentShader: this.frag_shader_
        });

        this.materials_.push(multitexture_material);
        ret = this.materials_.length -1;
        this.material_ind_[path][road] = ret;
    }
    
    return ret;
}

function createMesh(tile_types, heights, paths)
{
    var texloader = new THREE.TextureLoader();
    var matloader = new MaterialManager(texloader);
    var geometry = new THREE.PlaneGeometry(500, 500, tile_types[0].length * 2, tile_types.length * 2);

    var material_ind = {};
    material_ind[Terrain.tileType.WATER] = 'images/water.png';
    material_ind[Terrain.tileType.LAND] = 'images/ground.png';
    material_ind[Terrain.tileType.SAND] = 'images/sand.png';
    material_ind[Terrain.tileType.SEA] = 'images/water.png';

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
    material_border[Terrain.tileType.SAND] = [];
    material_border[Terrain.tileType.SAND][Terrain.tileType.SEA] = sand_water_set;
    material_border[Terrain.tileType.LAND] = [];
    material_border[Terrain.tileType.LAND][Terrain.tileType.SAND] = ground_sand_set;

    var uvs = [new THREE.Vector2(0,0),
        new THREE.Vector2(1,0),
        new THREE.Vector2(1,1),
        new THREE.Vector2(0,1)];
    
    // Add materialIndex to face
    for (var i = 0; i < tile_types.length * 2; i++)
    {
        for(var j = 0; j < tile_types[0].length * 2; j++)
        {
            var face_ind = (i * tile_types[0].length * 2 + j) * 2;
            var x = Math.floor(i/2);
            var y = Math.floor(j/2);
            
            var match_types = [];
            
            if ((i%2 !== 0 && j%2 !== 0) && (tile_types[x+1] !== undefined))
            {
                match_types.push(tile_types[x][y]);
                match_types.push(tile_types[x+1][y]);
                match_types.push(tile_types[x][y+1]);
                match_types.push(tile_types[x+1][y+1]);
            }
            else if ((i%2 !== 0) && (tile_types[x+1] !== undefined))
            {
                match_types.push(tile_types[x][y]);
                match_types.push(tile_types[x+1][y]);
                match_types.push(tile_types[x][y]);
                match_types.push(tile_types[x+1][y]);
            }
            else if (j%2 !== 0)
            {
                match_types.push(tile_types[x][y]);
                match_types.push(tile_types[x][y]);
                match_types.push(tile_types[x][y+1]);
                match_types.push(tile_types[x][y+1]);
            }
            else
            {
                match_types.push(tile_types[x][y]);
                match_types.push(tile_types[x][y]);
                match_types.push(tile_types[x][y]);
                match_types.push(tile_types[x][y]);
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
            
            var index = 0;
            
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
            
            var path_url = "images/empty.png";
            if (findInList(paths, new THREE.Vector2(x,y)))
            {
                path_url = "images/path.png";
            }
            var mat =  matloader.loadMaterial(index,path_url);
            
            geometry.faces[face_ind].materialIndex = mat;
            geometry.faceVertexUvs[0][face_ind] = [uvs[0], uvs[1], uvs[3]];
            geometry.faces[face_ind + 1].materialIndex = mat;
            geometry.faceVertexUvs[0][face_ind+1] = [uvs[1], uvs[2], uvs[3]];

            if (i%2 === 0 && j%2 === 0)
            {
                if (heights !== undefined)
                {
                    var height = heights[x][y]*1.5;
                    geometry.vertices[geometry.faces[face_ind].a].z = height;
                    geometry.vertices[geometry.faces[face_ind].b].z = height;
                    geometry.vertices[geometry.faces[face_ind].c].z = height;
                    geometry.vertices[geometry.faces[face_ind+1].a].z = height;
                    geometry.vertices[geometry.faces[face_ind+1].b].z = height;
                    geometry.vertices[geometry.faces[face_ind+1].c].z = height;
                }
            }

        }
    }
    // mesh
    return new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(matloader.materials_));
}

var mesh;

function diffTime(ini)
{
    return (new Date().getTime()) - ini;
}

function init() {
    var t_start = new Date().getTime();
    var random = new RandGenerator();

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 400;
    scene.add(camera);

    var terrainSize = new THREE.Vector2(50, 50);

    var terrainFunction3 = new NoiseFunction(1);

    console.log(diffTime(t_start) + ": noise created");
    var terrain = new Terrain(terrainSize, terrainFunction3);
    terrain.setLake();
    terrain.setCoast();
    terrain.initHeight();
    terrain.setHeight();
    terrain.getProperties();

    var points = terrain.generatePoints();
    var paths = [];
    for (var i = 0; i < points.length; i++)
    {
        var cur = i;
        var next = (i + 1) % points.length;
        var path = aStar(terrain.heights_, terrain.tile_types_,points[cur], points[next]);
        paths = paths.concat(path);
    }

    console.log(diffTime(t_start) + ": info loaded");
    mesh = createMesh(terrain.tile_types_, terrain.heights_, paths);
    console.log(diffTime(t_start) + ": mesh created");

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
