/// <reference path="../libs/toxiclibs.min.js" />
/// <reference path="../libs/vendor/three.js/Three.js" />

var TimeSlice = TimeSlice || {};

TimeSlice.Slicer = function (deckSize, imgWidth, imgHeight) {
    this.imgWidth = imgWidth;
    this.imgHeight = imgHeight;
    this.deckSize = deckSize;
    this.slicePlane = new toxi.geom.Plane(new toxi.geom.Vec3D(0, 0, 0), new toxi.geom.Vec3D(0, 0, -1));
    this.xray = new toxi.geom.Ray3D(new toxi.geom.Vec3D(0, 0, 0), new toxi.geom.Vec3D(1, 0, 0));
    this.yray = new toxi.geom.Ray3D(new toxi.geom.Vec3D(0, 0, 0), new toxi.geom.Vec3D(0, 1, 0));
    this.zray = new toxi.geom.Ray3D(new toxi.geom.Vec3D(0, 0, 0), new toxi.geom.Vec3D(0, 0, -1));

    var rwidth = this.imgWidth, rheight = this.imgHeight, rsize = rwidth * rheight * 4;
    this.dataTexture = this.generateRGBADataTexture(this.imgWidth, this.imgHeight, THREE.Color());
};

TimeSlice.Slicer.prototype = {

    xSliceOrigin: 0.0,
    ySliceOrigin: 0.0,
    zSliceOrigin: 0.0,
    xSliceRot: 0.0,
    ySliceRot: 0.0,
    zSliceRot: 0.0,
    slicePlane: null,
    sliceMatrix: null,
    imgHeight: 0,
    imgWidth: 0,
    deckSize: 0,
    xray: null,
    yray: null,
    zray: null,
    dataTexture: null,

    updateSlice: function () {

        var newNormal = new toxi.geom.Vec3D(0, 1, 0);

        newNormal.rotateX(this.xSliceRot);
        newNormal.rotateY(this.ySliceRot);
        newNormal.rotateZ(this.zSliceRot);

        this.slicePlane.set(this.xSliceOrigin - 160, this.ySliceOrigin - 120, this.zSliceOrigin);


        this.slicePlane.normal = newNormal;

        //go through z
        for (var y = 0; y < this.imgHeight; y++) {
            for (var x = 0; x < this.imgWidth; x++) {
                this.zray.x = x;
                this.zray.y = y;

                var depth = Math.round(this.slicePlane.intersectRayDistance(this.zray));
                var result = -1;
                if (depth > -1 && depth < this.deckSize) {
                    result = depth;
                }

                var i = x + (y * this.imgWidth);

                this.dataTexture.image.data[i * 4] = result;
            }
        }

        //for(var y = 0; y < this.imgHeight; y++)
        //{
        //    for (var z = 0; z < this.deckSize; z++)
        //    {
        //        this.xray.z = z;
        //        this.xray.y = y;

        //        depth = Math.round(this.slicePlane.intersectRayDistance(this.xray));
        //        var result = 0;

        //        if (depth > -1 && depth < this.imgWidth)
        //        {
        //            result = depth;
        //        }

        //        var i = depth + (y * this.imgWidth);
        //        //this.sliceMatrix[z][depth][y] = [255, 255, 255, 255];
        //        this.dataTexture.image.data[i * 4] = result;

        //    }
        //}

        //for (x = 0; x < this.imgHeight; x++)
        //{
        //    for (z = 0; z < this.deckSize; z++)
        //    {
        //        this.yray.z = z;
        //        this.yray.x = x;

        //        var result = 0;
        //        depth = Math.round(this.slicePlane.intersectRayDistance(this.yray));

        //        if (depth > -1 && depth < this.imgHeight)
        //        {
        //            result = depth;
        //        }

        //        var i = x + (depth * this.imgWidth);

        //        //this.sliceMatrix[z][x][depth] = [255, 255, 255, 255];
        //        this.dataTexture.image.data[i * 4] = result;
        //    }
        //}
    },

    getTexture: function () {                                          //data, width, height, format, type, mapping, wrapS, wrapT, magFilter, minFilter //

        //var str = "";

        //var size = this.imgWidth * this.imgHeight * 4;


        //for (var i = 0; i < size; i++) {
        //    str += this.dataTexture.image.data[i + 2] + ":";
        //}

        //console.log(str);

        var colorRampTexture = this.dataTexture; // new THREE.DataTexture(this.sliceMatrix, this.imgWidth, this.imgHeight, THREE.RGBAFormat);
        colorRampTexture.needsUpdate = true;

        return colorRampTexture;
    },

    generateRGBADataTexture: function (width, height, color) {
        var size = width * height * 4;
        var data = new Uint8Array(size);

        for (var y = 0; y < this.imgHeight; y++) {
            for (var x = 0; x < this.imgWidth; x++) {
                var i = x + (y * this.imgWidth);
                data[i * 4 + 3] = 255;
            }
        }

        var texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
        texture.needsUpdate = true;

        return texture;

    }
};