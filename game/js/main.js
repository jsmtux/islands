
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

var mouse_buttons = {
    0: "LEFT",
    1: "MIDDLE",
    2: "RIGHT"
}

var mouse_state = new THREE.Vector2(0,0);

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

    function handleMouseMove( event )
    {
        mouse_state.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse_state.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }
    
    function handleMouseDown(event)
    {
        game.handleMouseDown(mouse_buttons[event.button]);
    }

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    document.onmousemove = handleMouseMove;
    document.onmousedown = handleMouseDown;
}

function diffTime(ini)
{
    return (new Date().getTime()) - ini;
}
