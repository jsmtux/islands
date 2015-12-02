function MeshFactory(matloader)
{
    this.matloader_ = matloader;
}

MeshFactory.prototype.createMesh = function(terrain)
{
    var size_x = terrain.getSize().x;
    var size_y = terrain.getSize().y;
    var geometry = new THREE.PlaneGeometry(size_x , size_y, size_y, size_x);

    var uvs = [new THREE.Vector2(0,0),
        new THREE.Vector2(1,0),
        new THREE.Vector2(1,1),
        new THREE.Vector2(0,1)];
    
    for (var i = 0; i < size_x; i++)
    {
        for(var j = 0; j < size_y; j++)
        {
            var face_ind = (i * size_y + j) * 2;
            var mat =  this.matloader_.loadMultitexturedMaterial(
                    terrain.getTile(i,j).get_url(),terrain.getTile(i,j).get_over_url() ? "images/path.png":"images/empty.png");
            geometry.faces[face_ind].materialIndex = mat;
            geometry.faceVertexUvs[0][face_ind] = [uvs[0], uvs[1], uvs[3]];
            geometry.faces[face_ind + 1].materialIndex = mat;
            geometry.faceVertexUvs[0][face_ind+1] = [uvs[1], uvs[2], uvs[3]];

            if (i%2 === 0 && j%2 === 0)
            {
                var height = terrain.getTile(i,j).get_height();
                geometry.vertices[geometry.faces[face_ind].a].z = height;
                geometry.vertices[geometry.faces[face_ind].b].z = height;
                geometry.vertices[geometry.faces[face_ind].c].z = height;
                geometry.vertices[geometry.faces[face_ind+1].a].z = height;
                geometry.vertices[geometry.faces[face_ind+1].b].z = height;
                geometry.vertices[geometry.faces[face_ind+1].c].z = height;
            }
        }
    }
    
    // mesh
    var buffer_geom = new THREE.BufferGeometry().fromGeometry(geometry);
    return new THREE.Mesh(buffer_geom, new THREE.MeshFaceMaterial(this.matloader_.materials_));
}
