var camera, scene, renderer;


function setup()
{
    out_div = document.getElementById("out");
    init();
    animate();
}

function diffTime(ini)
{
    return (new Date().getTime()) - ini;
}

function init() {
    var t_start = new Date().getTime();
    var random = new RandGenerator();

    var terrain_size = new THREE.Vector2(100, 100);

    var terrainFunction3 = new NoiseFunction(1, 0.1974621396511793);

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
        console.log("point is at:");
        console.log(points[i]);
        tile.setPosition(points[i].pos);
    }

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
    var distance = 70;
    camera.position.z = 70;
    //camera.position.y = -(distance) * Math.cos(alpha);
    //camera.position.x = (distance) * Math.sin(alpha);
    //alpha += 0.005;
    camera.lookAt(new THREE.Vector3(0,0,0));
    //camera.up.set(0,0,1);
}
