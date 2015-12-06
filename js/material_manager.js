function ModelManager()
{
    this.models_ = {};
    this.json_loader_ = new THREE.JSONLoader();
    this.loading_models_ = {};
}

ModelManager.prototype.load = function(path, callback)
{
    var ret = this.models_[path];
    if (ret !== undefined)
    {
        callback(ret.geom, ret.mat);
    }
    else
    {
        if (this.loading_models_[path] !== undefined)
        {
            this.loading_models_[path].push(callback);
        }
        else
        {
            this.loading_models_[path] = [callback];
            var self = this;
            this.json_loader_.load(path, function(geom, mat){
                self.models_[path] = {geom: geom, mat: mat};
                for (var i = 0; i < self.loading_models_[path].length; i++)
                {
                    self.loading_models_[path][i](geom, mat);
                }
                self.loading_models_[path] = undefined;
            });
        }
    }
}

function MaterialManager(texloader)
{
    this.texloader_ = texloader;
    this.materials_ = [];
    this.material_ind_multi_ = {};
    this.material_ind_ = {};
    this.vert_shader_multi_ = document.getElementById('vertex_shh').innerHTML;
    this.frag_shader_multi_ = document.getElementById('fragment_shh').innerHTML;
    this.cover_tex_ = texloader.load('images/path.png');
}

MaterialManager.prototype.loadTexturedMaterial = function(path, transparent)
{
    var ret = this.material_ind_[path];
    if (ret === undefined)
    {
        ret = new THREE.MeshBasicMaterial({
            map: this.texloader_.load(path), transparent: transparent});
        this.materials_.push(ret);
        this.material_ind_[path] = ret;
    }
    return ret;
}

MaterialManager.prototype.loadMultitexturedMaterial = function(path, path_2)
{
    var ret;
    if (this.material_ind_multi_[path])
    {
        ret = this.material_ind_multi_[path][path_2];
    }
    else
    {
        this.material_ind_multi_[path] = {};
    }

    if (ret === undefined)
    {
        var uniforms = {
            tOne: { type: "t", value: this.texloader_.load(path_2) },
            tSec: { type: "t", value: this.texloader_.load(path)}
        };
        var multitexture_material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: this.vert_shader_multi_,
            fragmentShader: this.frag_shader_multi_
        });

        this.materials_.push(multitexture_material);
        ret = this.materials_.length -1;
        this.material_ind_multi_[path][path_2] = ret;
    }
    
    return ret;
}