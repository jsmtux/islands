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

    var terrain_size = new THREE.Vector2(100, 100);

    var terrainFunction3 = new NoiseFunction(1/*, 0.1974621396511793*/);

    console.log(diffTime(t_start) + ": noise created");
    
    var terrain = createTerrain(terrain_size, terrainFunction3);

    var paths = [];
    var points = terrain.generatePoints();
    for (var i = 0; i < points.length; i++)
    {
        var cur = i;
        var next = (i + 1) % points.length;
        var path = aStar(terrain.heights_, terrain.tile_types_,points[cur], points[next], paths);
        paths = paths.concat(path);
    }
    
    scene = new THREE.Scene();
    var game_scene = new GameScene(scene);
    
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
    scene.add(camera);
    
    game_scene.addMap(terrain.tile_types_, terrain.heights_, paths, terrain_size);
    
    for (var i = 0; i < points.length; i++)
    {
        var tile = game_scene.addJSONModel('models/tree.json', "images/tree.png", 0.2);
        tile.setPosition(points[i].pos);
    }
    
    pc_tile = game_scene.addJSONModel('models/tree.json', "images/tree.png", 0.2);
    pc_tile.setPosition(new THREE.Vector2(20,20));

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);
}

function animate() {

    requestAnimationFrame(animate);
    render();

}

var alpha = 0;
function render() {
    renderer.render(scene, camera);
    //mesh.rotation.z += 0.005;
    var distance = 40;
    //alpha += 0.005;
    if (pc_tile === undefined)
    {
        camera.position.z = 20;
        camera.position.y = -(distance) * Math.cos(alpha);
        camera.position.x = (distance) * Math.sin(alpha);
        camera.lookAt(new THREE.Vector3(0,0,0));
    }
    else
    {
        var tile_pos = pc_tile.getPosition();
        if (key_states.UP)
        {
            tile_pos.x += 0.1;
        }
        if (key_states.DOWN)
        {
            tile_pos.x -= 0.1;
        }
        if (key_states.LEFT)
        {
            tile_pos.y += 0.1;
        }
        if (key_states.RIGHT)
        {
            tile_pos.y -= 0.1;
        }
        pc_tile.setPosition(tile_pos);
        var pos = pc_tile.getAbsolutePosition();
        camera.position.z = pos.z + 5;
        camera.position.y = pos.y + 5;
        camera.position.x = pos.x;
        camera.lookAt(pos);
    }
    camera.up.set(0,0,1);
}
