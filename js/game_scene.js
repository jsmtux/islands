function Tile(scene, name, block)
{
    this.position_ = new THREE.Vector2(0,0);
    this.rotation_ = new THREE.Vector3(0,0,0);
    this.mesh_;
    this.scene_ = scene;
    this.offset_ = new THREE.Vector3(0,0,0);
    this.block_ = block;
    this.name_ = name;
}

Tile.prototype.initialize = function(mesh)
{
    this.mesh_ = mesh; 
    this.setPosition(this.position_);
    this.setRotation(this.rotation_);
}

Tile.prototype.setPosition = function(pos)
{
    this.position_ = pos;
    if (this.mesh_)
    {
        var current_tile = this.scene_.getTerrain().getTile(Math.floor(pos.x),Math.floor(pos.y));
        this.mesh_.position.z = 0.5*current_tile.get_height() + this.offset_.z;
        this.mesh_.position.y = -this.position_.x + this.scene_.terrain_size_.y /2 + this.offset_.y;
        this.mesh_.position.x = this.position_.y - this.scene_.terrain_size_.x /2 + this.offset_.x;
    }
}

Tile.prototype.getPosition = function()
{
    return this.position_.clone();
}

Tile.prototype.setRotation = function(rotation)
{
    this.rotation_ = rotation;
    if (this.mesh_)
    {
        this.mesh_.rotation.x = rotation.x + Math.PI/2,0,0;
        this.mesh_.rotation.y = rotation.y;
        this.mesh_.rotation.z = rotation.z;
    }
}

Tile.prototype.getAbsolutePosition = function()
{
    var ret;
    if (this.mesh_)
    {
        ret = this.mesh_.position;
    }
    else
    {
        ret = new THREE.Vector3(0,0,0);
    }
    return ret;
}

Tile.prototype.setOffset = function(offset)
{
    this.offset_ = offset;
    this.setPosition(this.getPosition());
}

Tile.prototype.get_blocks = function()
{
    return this.block_;
}

Tile.prototype.get_name = function()
{
    return this.name_;
}

function AnimatedTile(scene, block)
{
    Tile.call(this, scene, block);
    this.animations_ = [];
    this.current_animation_;
}

AnimatedTile.prototype = Object.create(Tile.prototype);
AnimatedTile.prototype.constructor = AnimatedTile;

AnimatedTile.prototype.addAnimation = function(animation)
{
    this.animations_.push(animation);
}

AnimatedTile.prototype.setCurrentAnimation = function(index)
{
    this.current_animation_ = index;
}

AnimatedTile.prototype.update = function(time)
{
    if (this.current_animation_ !== undefined && this.animations_[this.current_animation_])
    {
        this.animations_[this.current_animation_].update(time);
    }
}

function GameScene(three_scene)
{
    this.static_tiles_ = [];
    this.three_scene_ = three_scene;
    this.terrain_info_;
    this.terrain_size_;
    this.tex_loader_ = new THREE.TextureLoader();
    this.material_manager_ = new MaterialManager(this.tex_loader_);
    this.mesh_factory_ = new MeshFactory(this.material_manager_);
    this.model_manager_ = new ModelManager();
}

GameScene.prototype.getTerrain = function()
{
    return this.terrain_info_;
}

GameScene.prototype.addMap = function(terrain_info, terrain_size)
{
    this.terrain_info_ = terrain_info;
    var mesh = this.mesh_factory_.createMesh(terrain_info);    
    this.three_scene_.add(mesh);
    this.terrain_size_ = terrain_size;
}

/*http://opengameart.org/content/medieval-house-pack*/
GameScene.prototype.addInternalJSONModel = function(ret, model_path, model_texture, modifiers, animated)
{
    var self = this;
    this.model_manager_.load(model_path, function(geom, mat){
        var transparent = modifiers && modifiers.transparent === true? true:false;
        var mat = self.material_manager_.loadTexturedMaterial(model_texture, transparent);
        if (animated)
        {
            mat.skinning = true;
            var new_mesh = new THREE.SkinnedMesh(geom, mat);
            new_mesh.doubleSided = true;
            for (var i = 0; i < geom.animations.length; i++)
            {
                var mixer = new THREE.AnimationMixer(new_mesh);
                mixer.addAction( new THREE.AnimationAction(geom.animations[i]));
                ret.addAnimation(mixer);
            }
        }
        else
        {
            var new_mesh = new THREE.Mesh(geom, mat);
        }
        ret.initialize(new_mesh);
        if (modifiers)
        {
            if (modifiers.scale)
            {
                new_mesh.scale.set(modifiers.scale,modifiers.scale,modifiers.scale);
            }
            if (modifiers.offset)
            {
                ret.setOffset(modifiers.offset);
            }
        }
        self.three_scene_.add(new_mesh);
    });
    return ret;
}

GameScene.prototype.addJSONModel = function(name, model_path, model_texture, modifiers)
{
    var block = modifiers !== undefined && modifiers.blocks === true;
    var new_tile = new Tile(this, name, block);
    this.static_tiles_.push(new_tile);
    return this.addInternalJSONModel(new_tile, model_path, model_texture, modifiers, false);
}

GameScene.prototype.addAnimatedJSONModel = function(name, model_path, model_texture, modifiers)
{
    var block = modifiers !== undefined && modifiers.blocks === true;
    var new_tile = new AnimatedTile(this, name, block);
    this.static_tiles_.push(new_tile);
    return this.addInternalJSONModel(new_tile, model_path, model_texture, modifiers, true);
}

GameScene.prototype.getCanWalk = function(position)
{
    var ret = this.terrain_info_.getTile(Math.floor(position.x), Math.floor(position.y)).get_can_walk();
    if (ret === true)
    {
        for (var i = 0; i < this.static_tiles_.length; i++)
        {
            var pos_x = Math.floor(position.x);
            var pos_y = Math.floor(position.y);
            if (this.static_tiles_[i].getPosition().equals(new THREE.Vector2(pos_x, pos_y)))
            {
                if(this.static_tiles_[i].get_blocks())
                {
                    ret = false;
                }
            }
        }
    }
    return ret;
}

GameScene.prototype.getCollidingTiles = function(position)
{
    var ret = [];
    for (var i = 0; i < this.static_tiles_.length; i++)
    {
        var pos_x = Math.floor(position.x);
        var pos_y = Math.floor(position.y);
        if (this.static_tiles_[i].getPosition().equals(new THREE.Vector2(pos_x, pos_y)))
        {
            ret.push(this.static_tiles_[i]);
        }
    }
    return ret;
}