function Camera(camera)
{
    this.camera_ = camera;
    this.distance_ = 3;
}

Camera.prototype.update = function(look_at)
{
    console.log("Unimplemented look at function");
}

Camera.prototype.getInternal = function()
{
    return this.camera_;
}

function MapCamera(camera, distance)
{
    Camera.call(this, camera);
    this.distance_ = distance;
}

MapCamera.prototype = Object.create(Camera.prototype);
MapCamera.prototype.constructor = MapCamera;

MapCamera.prototype.update = function()
{
    var alpha = 0;
    this.camera_.position.z = this.distance_;
    this.camera_.position.y = 0;
    this.camera_.position.x = 0;
    this.camera_.lookAt(new THREE.Vector3(0,0,0));
    this.camera_.up.set(0,0,1);
}

function CharacterCamera(camera, distance)
{
    Camera.call(this, camera);
    this.distance_ = distance;    
}

CharacterCamera.prototype = Object.create(Camera.prototype);
CharacterCamera.prototype.constructor = CharacterCamera;

CharacterCamera.prototype.update = function(look_at)
{
    this.camera_.position.z = look_at.z + this.distance_ * 1.4;
    this.camera_.position.y = look_at.y + this.distance_;
    this.camera_.position.x = look_at.x;
    this.camera_.lookAt(look_at);
    this.camera_.up.set(0,0,1);
}
