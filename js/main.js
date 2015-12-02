var camera, scene, renderer;

var key_codes = {
    38: "UP",
    40: "DOWN",
    37: "LEFT",
    39: "RIGHT"
};

var key_states = {
    UP:false,
    DOWN:false,
    LEFT:false,
    RIGHT:false
};

function handleKeyDown(event)
{
    key_states[key_codes[event.keyCode]] = true;
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

    var terrainFunction3 = new NoiseFunction(1, 0.8079815409146249);
    
    var terrain = new TerrainConstructor(terrain_size, terrainFunction3);

    console.log(diffTime(t_start) + ": Base Terrain created");

    var paths = [];
    var points = terrain.generatePoints();
    for (var i = 0; i < points.length; i++)
    {
        var cur = i;
        var next = (i + 1) % points.length;
        var path = terrain.aStar(points[cur], points[next], paths);
        paths = paths.concat(path);
    }
    
    console.log(diffTime(t_start) + ": Terrain paths created");

    console.log(diffTime(t_start) + ": Terrain elements created");
    
    scene = new THREE.Scene();
    var game_scene = new GameScene(scene);
    
    var terrain_info = terrain.getInfo();

    for (var i = 0; i < terrain_size.x*2; i++)
    {
        for (var j = 0; j < terrain_size.y*2; j++)
        {
            var pos = new THREE.Vector2(Math.floor(i/2), Math.floor(j/2));
            if(findInList(paths, pos) !== undefined)
            {
                terrain_info.over_urls_[i][j] = "images/path.png";
            }
        }
    }

    game_scene.addMap(terrain_info, terrain_size);
    
    console.log(diffTime(t_start) + ": Terrain mesh created");

    for (var i = 0; i < points.length; i++)
    {
        var tile = game_scene.addJSONModel('models/tree.json', "images/tree.png", {scale:0.6, offset:new THREE.Vector3(0.4,-0.4,0.0)});
        tile.setPosition(points[i].pos.multiplyScalar(2));
    }
    
    pc_tile = game_scene.addAnimatedJSONModel('models/archer.json', "images/archer.png", {scale:0.12, offset:new THREE.Vector3(0.0,0.0,1.4)});
    pc_tile.setPosition(new THREE.Vector2(20,20));
    
    console.log(diffTime(t_start) + ": Elements added");

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    var scene_camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
    //camera = new MapCamera(scene_camera, 100);
    camera = new CharacterCamera(scene_camera, 7);
    scene.add(camera.getInternal());

    document.body.appendChild(renderer.domElement);
}

function animate() {

    requestAnimationFrame(animate);
    render();

}

var alpha = 0;
function render() {
    renderer.render(scene, camera.getInternal());
    //mesh.rotation.z += 0.005;
    var pos_look_at;
    if (pc_tile !== undefined)
    {
        pos_look_at = pc_tile.getAbsolutePosition();
    }
    camera.update(pos_look_at);
    var distance = 5;
    //alpha += 0.005;
    if (pc_tile !== undefined)
    {
        pc_tile.setCurrentAnimation(4);
        var tile_pos = pc_tile.getPosition();
        if (key_states.UP)
        {
            pc_tile.setCurrentAnimation(6);
            tile_pos.x += 0.2;
            pc_tile.setRotation(new THREE.Vector3(0,0,0));
        }
        if (key_states.DOWN)
        {
            pc_tile.setCurrentAnimation(6);
            tile_pos.x -= 0.2;
            pc_tile.setRotation(new THREE.Vector3(0,Math.PI,0));
        }
        if (key_states.LEFT)
        {
            pc_tile.setCurrentAnimation(6);
            tile_pos.y += 0.2;
            pc_tile.setRotation(new THREE.Vector3(0,Math.PI / 2,0));
        }
        if (key_states.RIGHT)
        {
            pc_tile.setCurrentAnimation(6);
            tile_pos.y -= 0.2;
            pc_tile.setRotation(new THREE.Vector3(0,-Math.PI / 2,0));
        }
        pc_tile.update(0.02);
        pc_tile.setPosition(tile_pos);  
    }
}
