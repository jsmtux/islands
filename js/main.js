
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

function setup()
{
    out_div = document.getElementById("out");
    
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    var game = new Game();
    game.addGameState(new MapSelectionGameState(renderer, game), "map_selection");
    game.setCurrentState("map_selection");
    
    animate();

    function render() {
        game.update();
    }

    function animate() {
        requestAnimationFrame(animate);
        render();
    }


    function handleKeyDown(event)
    {
        key_states[key_codes[event.keyCode]] = true;
        game.handleKeyDown(key_codes[event.keyCode]);
    }

    function handleKeyUp(event)
    {
        key_states[key_codes[event.keyCode]] = false;
    }

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
}

function diffTime(ini)
{
    return (new Date().getTime()) - ini;
}
