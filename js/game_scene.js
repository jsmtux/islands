function Tile(scene)
{
    this.position_ = new THREE.Vector2(0,0);
    this.rotation_ = new THREE.Vector3(0,0,0);
    this.mesh_;
    this.scene_ = scene;
    this.offset_ = new THREE.Vector3(0,0,0);
}

Tile.prototype.initialize = function(mesh)
{
    console.log("tile called");
    this.mesh_ = mesh; 
    this.setPosition(this.position_);
    this.setRotation(this.rotation_);
}

Tile.prototype.setPosition = function(pos)
{
    this.position_ = pos;
    if (this.mesh_)
    {
        this.mesh_.position.z = 0.5 * this.scene_.heights_[Math.floor(pos.x)][Math.floor(pos.y)] + this.offset_.z;
        this.mesh_.position.y = -this.position_.x + this.scene_.terrain_size_.x /2 + this.offset_.y;
        this.mesh_.position.x = this.position_.y - this.scene_.terrain_size_.x /2 + this.offset_.x;
    }
}

Tile.prototype.getPosition = function()
{
    return this.position_;
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
}

function AnimatedTile(scene)
{
    Tile.call(this, scene);
}

AnimatedTile.prototype = Object.create(Tile.prototype);
AnimatedTile.prototype.constructor = AnimatedTile;

AnimatedTile.prototype.setAnimationMixer = function(mixer)
{
    this.mixer_ = mixer;
}

AnimatedTile.prototype.update = function(time)
{
    if (this.mixer_)
    {
        this.mixer_.update(time);
    }
}

function GameScene(three_scene)
{
    this.three_scene_ = three_scene;
    this.heights_;
    this.terrain_size_;
    this.tex_loader_ = new THREE.TextureLoader();
    this.material_manager_ = new MaterialManager(this.tex_loader_);
    this.mesh_factory_ = new MeshFactory(this.material_manager_);
    this.json_loader_ = new THREE.JSONLoader();
}

GameScene.prototype.addMap = function(tile_types, tile_heights, paths, terrain_size)
{
    this.heights_ = tile_heights;
    var mesh = this.mesh_factory_.createMesh(tile_types, tile_heights, paths);    
    this.three_scene_.add(mesh);
    this.terrain_size_ = terrain_size;
}

GameScene.prototype.addInternalJSONModel = function(ret, model_path, model_texture, modifiers, animated)
{
    var self = this;
    this.json_loader_.load(model_path, function(geom, mat){
        var mat = self.material_manager_.loadTexturedMaterial(model_texture);
        if (animated)
        {
            mat.skinning = true;
            var new_mesh = new THREE.SkinnedMesh(geom, mat);
            new_mesh.doubleSided = true;
            var mixer = new THREE.AnimationMixer( new_mesh );
            mixer.addAction( new THREE.AnimationAction( geom.animations[ 6 ] ) );
            ret.setAnimationMixer(mixer);
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

GameScene.prototype.addJSONModel = function(model_path, model_texture, modifiers)
{
    return this.addInternalJSONModel(new Tile(this), model_path, model_texture, modifiers, false);
}

GameScene.prototype.addAnimatedJSONModel = function(model_path, model_texture, modifiers)
{
    return this.addInternalJSONModel(new AnimatedTile(this), model_path, model_texture, modifiers, true);
}