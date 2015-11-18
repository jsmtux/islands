function Tile(scene)
{
    this.position_ = new THREE.Vector2(0,0);
    this.mesh_;
    this.scene_ = scene;
}

Tile.prototype.initialize = function(mesh)
{
    this.mesh_ = mesh; 
    this.mesh_.rotation.x = (90 * Math.PI)/180;
    this.setPosition(this.position_);
}

Tile.prototype.setPosition = function(pos)
{
    this.position_ = pos;
    if (this.mesh_)
    {
        this.mesh_.position.z = 10;
        this.mesh_.position.y = -this.position_.x + this.scene_.terrain_size_.x /2;
        this.mesh_.position.x = this.position_.y - this.scene_.terrain_size_.x /2;         
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
    var mesh = this.mesh_factory_.createMesh(tile_types, tile_heights, paths);    
    this.three_scene_.add(mesh);
    this.terrain_size_ = terrain_size;
}

GameScene.prototype.addJSONModel = function(model_path, model_texture, scale)
{
    var ret = new Tile(this);
    var self = this;
    this.json_loader_.load(model_path, function(tree_geom){
        var mat = self.material_manager_.loadTexturedMaterial(model_texture);
        var new_mesh = new THREE.Mesh(tree_geom, mat);
        ret.initialize(new_mesh);
        new_mesh.scale.set(scale,scale,scale);
        self.three_scene_.add(new_mesh);
    });
    return ret;
}