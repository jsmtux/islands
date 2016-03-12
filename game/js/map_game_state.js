function MapGameState(renderer, game, seed)
{
    THREEGameState.call(this, renderer, game);
    this.prev_bush_;
    
    this.initTerrain(seed);
    
    this.map_camera_ = new MapCamera(this.game_.createCamera(), 200);
    this.character_camera_ = new CharacterCamera(this.game_.createCamera(), 7);
    this.scene_.add(this.map_camera_.getInternal());
    this.scene_.add(this.character_camera_.getInternal());
    this.cur_cam_ = this.map_camera_;
    
    var unit_a = new Unit(units.grass_monster);
    var unit_d = new Unit(units.tree_monster);
    this.pc_units_ = [unit_a, unit_d];
        
    var self = this;

    this.key_events_["P"] = function(){
        if (self.cur_cam_ === self.map_camera_)
        {
            self.cur_cam_ = self.character_camera_;
        }
        else
        {
            self.cur_cam_ = self.map_camera_;
        }
    };
}

MapGameState.prototype = Object.create(THREEGameState.prototype);
MapGameState.prototype.constructor = MapGameState;

MapGameState.prototype.initTerrain = function(seed)
{
    var t_start = new Date().getTime();

    var terrain_size = new THREE.Vector2(200, 200);
/*0.5252345739863813 lake*/
    var terrainFunction3 = new NoiseFunction(1, seed);
    
    var terrain_constructor = new TerrainConstructor(terrain_size, terrainFunction3, 1);

    console.log(diffTime(t_start) + ": Base Terrain created");
    
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
    
    var self = this;
    function addBush(position)
    {
        if (self.game_scene_.getCollidingTiles(position).length === 0)
        {
            var tile = self.game_scene_.addJSONModel('bush','models/bush.json', "images/bush.png", {scale:0.1, offset:new THREE.Vector3(0.4,-0.4,0.3), transparent:true});
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
            tile = self.game_scene_.addJSONModel('tree', 'models/tree.json', "images/tree.png", {scale:0.6, offset:new THREE.Vector3(0.4,-0.4,0.0), blocks:true});
        }
        else
        {
            var tile = self.game_scene_.addJSONModel('rock','models/rock.json', "images/rock.png", {scale:0.4, offset:new THREE.Vector3(0.4,-0.4,0.0), blocks:true});
        }
        tile.setPosition(position);        
    }
   
    terrain.initPaths(addTreeCallback);
    
    console.log(diffTime(t_start) + ": Terrain paths improved");

    this.game_scene_.addMap(terrain, terrain_size);
    
    console.log(diffTime(t_start) + ": Terrain mesh created");
    
    pc_tile = this.game_scene_.addAnimatedJSONModel("pc", 'models/archer.json', "images/archer.png", {scale:0.1, offset:new THREE.Vector3(0.0,0.0,1.4)});
    pc_tile.setPosition(character_position.pos);
    
    console.log(diffTime(t_start) + ": Elements added");
}

MapGameState.prototype.update = function()
{
    THREEGameState.prototype.update.call(this);
    var pos_look_at;
    if (pc_tile !== undefined)
    {
        pos_look_at = pc_tile.getAbsolutePosition();
    }
    this.cur_cam_.update(pos_look_at);
    //mesh.rotation.z += 0.005;
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
        if (this.game_scene_.getCanWalk(tile_pos))
        {
            pc_tile.setPosition(tile_pos);
        }
        var near_elements = this.game_scene_.getCollidingTiles(tile_pos);
        for (var i = 0; i < near_elements.length; i++)
        {
            if (near_elements[i].get_name() === 'bush')
            {
                if(this.prev_bush_ === undefined || this.prev_bush_ !== near_elements[i])
                {
                    this.prev_bush_ = near_elements[i];
                    if (Math.random() > 0.7)
                    {
                        console.log("launch monster fight");
                        start_battle(this.game_, this.pc_units_);
                    }
                }
            }
        }
    }
}
