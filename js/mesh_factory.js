function MeshFactory(matloader)
{
    this.matloader_ = matloader;
}

MeshFactory.prototype.createMesh = function(terrain_info)
{
    var size_x = terrain_info.length / 2;
    var size_y = terrain_info[0].length / 2;
    var geometry = new THREE.PlaneGeometry(size_x, size_y, size_x * 2, size_y * 2);

    var uvs = [new THREE.Vector2(0,0),
        new THREE.Vector2(1,0),
        new THREE.Vector2(1,1),
        new THREE.Vector2(0,1)];
    
    for (var i = 0; i < size_x * 2; i++)
    {
        for(var j = 0; j < size_y * 2; j++)
        {
            var face_ind = (i * size_y * 2 + j) * 2;
            var path_url = "images/empty.png";
            if (terrain_info[i][j].road === true)
            {
                path_url = "images/path.png";
            }
            var mat =  this.matloader_.loadMultitexturedMaterial(terrain_info[i][j].index,path_url);
            geometry.faces[face_ind].materialIndex = mat;
            geometry.faceVertexUvs[0][face_ind] = [uvs[0], uvs[1], uvs[3]];
            geometry.faces[face_ind + 1].materialIndex = mat;
            geometry.faceVertexUvs[0][face_ind+1] = [uvs[1], uvs[2], uvs[3]];

            if (i%2 === 0 && j%2 === 0)
            {
                var height = terrain_info[i][j].height;
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
