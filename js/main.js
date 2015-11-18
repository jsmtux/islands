var camera, scene, renderer, geometry, material, mesh;


function setup()
{
    out_div = document.getElementById("out");
    init();
    animate();
}

var mesh;

function diffTime(ini)
{
    return (new Date().getTime()) - ini;
}

function init() {
    var t_start = new Date().getTime();
    var random = new RandGenerator();

    var texloader = new THREE.TextureLoader();

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
    scene.add(camera);

    var terrainSize = new THREE.Vector2(100, 100);

    var terrainFunction3 = new NoiseFunction(1/*, 0.1974621396511793*/);

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
        var path = aStar(terrain.heights_, terrain.tile_types_,points[cur], points[next], paths);
        paths = paths.concat(path);
    }

    var material_manager = new MaterialManager(texloader);

    console.log(diffTime(t_start) + ": info loaded");
    
    var mesh_factory = new MeshFactory(material_manager);
    
    mesh = mesh_factory.createMesh(terrain.tile_types_, terrain.heights_, paths);
    console.log(diffTime(t_start) + ": mesh created");
    
    scene.add(mesh);
    
    var loader = new THREE.JSONLoader();
    loader.load('models/tree.json', function(tree_geom){
        var tree_mat = material_manager.loadTexturedMaterial("images/tree.png");
        var tree_mesh = new THREE.Mesh(tree_geom, tree_mat);
        tree_mesh.position.z = 1;
        tree_mesh.position.x = -50;
        tree_mesh.rotation.x = 45;
        scene.add(tree_mesh);
    });

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
    camera.position.z = 20;
    camera.position.y = -50 * Math.cos(alpha);
    camera.position.x = 50 * Math.sin(alpha);
    alpha += 0.005;
    camera.lookAt(new THREE.Vector3(0,0,0));
    camera.up.set(0,0,1);
}
