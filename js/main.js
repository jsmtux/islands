var cur_cam;
var scene_camera, map_camera;
var game_scene;
var scene, renderer;

var key_codes = {
    38: "UP",
    40: "DOWN",
    37: "LEFT",
    39: "RIGHT",
    80: "P"
};

var key_states = {
    UP:false,
    DOWN:false,
    LEFT:false,
    RIGHT:false,
    P: false
};

var key_events = {};

function handleKeyDown(event)
{
    key_states[key_codes[event.keyCode]] = true;
    if (key_codes[event.keyCode] !== undefined && key_events[key_codes[event.keyCode]] !== undefined)
    {
        console.log("defined callback!!");
        key_events[key_codes[event.keyCode]]();
    }
}

function handleKeyUp(event)
{
    key_states[key_codes[event.keyCode]] = false;
}

function setup()
{
    out_div = document.getElementById("out");
    init();
    animate();
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
}

function diffTime(ini)
{
    return (new Date().getTime()) - ini;
}

var pc_tile;

function init() {
    var t_start = new Date().getTime();
    var random = new RandGenerator();

    var terrain_size = new THREE.Vector2(200, 200);
/*0.5252345739863813 lake*/
    var terrainFunction3 = new NoiseFunction(1, 0.061479425290599465);
    
    var terrain_constructor = new TerrainConstructor(terrain_size, terrainFunction3);

    console.log(diffTime(t_start) + ": Base Terrain created");
    
    scene = new THREE.Scene();
    game_scene = new GameScene(scene);
    
    var terrain = terrain_constructor.getInfo();
    console.log(diffTime(t_start) + ": Generated info");

    var points = terrain_constructor.generatePoints();
    var character_position = points[0];

    console.log(diffTime(t_start) + ": Generated points");

    var full_path = [];
    var paths = [];
    for (var i = 0; i < points.length; i++)
    {
        var cur = i;
        var next = (i + 1) % points.length;
        var path = terrain.aStar(points[cur], points[next]);
        full_path.concat(path);
        paths.push(path);
        console.log(diffTime(t_start) + ": Path generated");
    }
    
    function addBush(position)
    {
        if (game_scene.getCollidingTiles(position).length === 0)
        {
            var tile = game_scene.addJSONModel('bush','models/bush.json', "images/bush.png", {scale:0.1, offset:new THREE.Vector3(0.4,-0.4,0.3), transparent:true});
            tile.setPosition(position);
        }
    }

    for (var i = 0; i < paths.length; i++)
    {
        var prev_pos = undefined;
        for (var x = 0; x < paths[i].length; x++)
        {
            var position = paths[i][x].pos;
            var new_pos = position.clone();
            var normal;
            if (prev_pos !== undefined)
            {
                var direction = new_pos.clone().sub(prev_pos);
                normal = new THREE.Vector2(direction.y, -direction.x);
                var noise_value = noise.simplex2(0,x/10);
                new_pos.add(normal.clone().multiplyScalar(noise_value));
                new_pos = new THREE.Vector2(Math.floor(new_pos.x), Math.floor(new_pos.y));
            }
            prev_pos = position;
            position = new_pos;
            if (normal !== undefined)
            {
                var size = 4;
                size += Math.abs(noise.simplex2(x/30,0)*8);
                for (var ind = 0; ind < size; ind++)
                {
                    var pos = position.clone().add(normal.clone().multiplyScalar(ind-Math.floor(size/2)));
                    var tile = terrain.getTile(Math.floor(pos.x), Math.floor(pos.y));
                    if (tile.get_can_walk())
                    {
                        if (noise.simplex2(x/30,0)>0.5)
                        {
                            addBush(new THREE.Vector2(Math.floor(pos.x), Math.floor(pos.y)));
                        }
                        tile.set_over_url(1);
                    }
                }
            }
        }
    }
    console.log(diffTime(t_start) + ": Terrain paths created");

    function addTreeCallback(position)
    {
        var tile;
        if (terrain.getTile(position.x, position.y).get_tile_type() === TerrainConstructor.tileType.LAND)
        {
            tile = game_scene.addJSONModel('tree', 'models/tree.json', "images/tree.png", {scale:0.6, offset:new THREE.Vector3(0.4,-0.4,0.0), blocks:true});
        }
        else
        {
            var tile = game_scene.addJSONModel('rock','models/rock.json', "images/rock.png", {scale:0.4, offset:new THREE.Vector3(0.4,-0.4,0.0), blocks:true});
        }
        tile.setPosition(position);        
    }
   
    terrain.initPaths(addTreeCallback);
    
    console.log(diffTime(t_start) + ": Terrain paths improved");

    game_scene.addMap(terrain, terrain_size);
    
    console.log(diffTime(t_start) + ": Terrain mesh created");
    
    pc_tile = game_scene.addAnimatedJSONModel("pc", 'models/archer.json', "images/archer.png", {scale:0.1, offset:new THREE.Vector3(0.0,0.0,1.4)});
    pc_tile.setPosition(character_position.pos);
    
    console.log(diffTime(t_start) + ": Elements added");

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    scene_camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
    map_camera = new MapCamera(scene_camera, 300);
    var scene_camera_2 = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
    var character_camera = new CharacterCamera(scene_camera_2, 7);
    scene.add(map_camera.getInternal());
    scene.add(character_camera.getInternal());

    document.body.appendChild(renderer.domElement);
    
    cur_cam = character_camera;
    key_events["P"] = function(){
        if (cur_cam === map_camera)
        {
            cur_cam = character_camera;
        }
        else
        {
            cur_cam = map_camera;
        }
    };
}

function animate() {

    requestAnimationFrame(animate);
    render();

}

var alpha = 0;
var prev_bush = undefined;
function render() {
    renderer.render(scene, cur_cam.getInternal());
    //mesh.rotation.z += 0.005;
    var pos_look_at;
    if (pc_tile !== undefined)
    {
        pos_look_at = pc_tile.getAbsolutePosition();
    }
    cur_cam.update(pos_look_at);
    var distance = 5;
    //alpha += 0.005;
    if (pc_tile !== undefined)
    {
        pc_tile.setCurrentAnimation(4);
        var tile_pos = pc_tile.getPosition();
        if (key_states.UP)
        {
            pc_tile.setCurrentAnimation(6);
            tile_pos.x += 0.05;
            pc_tile.setRotation(new THREE.Vector3(0,0,0));
        }
        if (key_states.DOWN)
        {
            pc_tile.setCurrentAnimation(6);
            tile_pos.x -= 0.05;
            pc_tile.setRotation(new THREE.Vector3(0,Math.PI,0));
        }
        if (key_states.LEFT)
        {
            pc_tile.setCurrentAnimation(6);
            tile_pos.y += 0.05;
            pc_tile.setRotation(new THREE.Vector3(0,Math.PI / 2,0));
        }
        if (key_states.RIGHT)
        {
            pc_tile.setCurrentAnimation(6);
            tile_pos.y -= 0.05;
            pc_tile.setRotation(new THREE.Vector3(0,-Math.PI / 2,0));
        }
        pc_tile.update(0.015);
        if (game_scene.getCanWalk(tile_pos))
        {
            pc_tile.setPosition(tile_pos);
        }
        var near_elements = game_scene.getCollidingTiles(tile_pos);
        for (var i = 0; i < near_elements.length; i++)
        {
            if (near_elements[i].get_name() === 'bush')
            {
                if(prev_bush === undefined || prev_bush !== near_elements[i])
                {
                    prev_bush = near_elements[i];
                    if (Math.random() > 0.7)
                    {
                        console.log("launch monster fight");
                    }
                }
            }
        }
    }
}
