/// <reference path="../libs/toxiclibs.min.js" />
/// <reference path="../libs/vendor/three.js/Three.js" />

var TimeSlice = TimeSlice || {};

TimeSlice.Slicer = function (deckSize, imgWidth, imgHeight) {
    this.imgWidth = imgWidth;
    this.imgHeight = imgHeight;
    this.deckSize = deckSize;
    this.slicePlane = new toxi.geom.Plane(new toxi.geom.Vec3D(0, 0, 50 / 2), new toxi.geom.Vec3D(0, 1, 0));
    this.xray = new toxi.geom.Ray3D(new toxi.geom.Vec3D(0, 0, 0), new toxi.geom.Vec3D(1, 0, 0));
    this.yray = new toxi.geom.Ray3D(new toxi.geom.Vec3D(0, 0, 0), new toxi.geom.Vec3D(0, 1, 0));
    this.zray = new toxi.geom.Ray3D(new toxi.geom.Vec3D(0, 0, 0), new toxi.geom.Vec3D(0, 0, 1));

    var rwidth = this.imgWidth, rheight = this.imgHeight, rsize = rwidth * rheight * 4;
    this.dataTexture = this.generateRGBADataTexture(this.imgWidth, this.imgHeight, THREE.Color());
};

TimeSlice.Slicer.prototype = {

    xSliceOrigin: 0.0,
    ySliceOrigin: 0.0,
    zSliceOrigin: 0.0,
    xSliceAxis: 0.0,
    ySliceAxis: 0.0,
    zSliceAxis: 0.0,
    slicePlane: null,
    sliceMatrix: null,
    imgHeight: 0,
    imgWidth: 0,
    deckSize: 0,
    xray: new toxi.geom.Ray3D(new toxi.geom.Vec3D(0, 0, 0), new toxi.geom.Vec3D(1, 0, 0)),
    yray: new toxi.geom.Ray3D(new toxi.geom.Vec3D(0, 0, 0), new toxi.geom.Vec3D(0, 1, 0)),
    zray: new toxi.geom.Ray3D(new toxi.geom.Vec3D(0, 0, 0), new toxi.geom.Vec3D(0, 0, -1)),
    dataTexture: null,

    updateSliceMatrix: function () {
        this.dataTexture = this.generateRGBADataTexture(this.imgWidth, this.imgHeight, THREE.Color());

        this.slicePlane.set(this.xSliceOrigin, this.ySliceOrigin, this.zSliceOrigin);

        var newNormal = new toxi.geom.Vec3D(this.xSliceAxis, this.ySliceAxis, this.zSliceAxis).normalize();
        this.slicePlane.normal = newNormal; //.normalize();

        for (var y = 0; y < this.imgHeight; y++) {
            for (var x = 0; x < this.imgWidth; x++) {
                this.zray.x = x;
                this.zray.y = y;

                var depth = Math.round(Math.abs( this.slicePlane.intersectRayDistance(this.zray)));

                var r = x;
                var g = y;
                var b = 0;
                var a = 255;

                if (depth > -1 && depth < this.deckSize) {
                    b = depth;
                }

                var i = x + (y * this.imgWidth);

                this.dataTexture.image.data[i * 4] = r;
                this.dataTexture.image.data[i * 4 + 1] = g;
                this.dataTexture.image.data[i * 4 + 2] = b;
                this.dataTexture.image.data[i * 4 + 3] = a;
            }
        }

        //        var testsliceMatrix = this.sliceMatrix.slice(0, 102400);
        //        console.log(testsliceMatrix.join());

        //        for(var y = 0; y < this.imgHeight; y++)
        //        {
        //            for (var z = 0; z < this.deckSize; z++)
        //            {
        //                this.xray.z = z;
        //                this.xray.y = y;

        //                depth = Math.round(this.slicePlane.intersectRayDistance(this.xray));

        //                if (depth > -1 && depth < this.imgWidth)
        //                {
        //                    this.sliceMatrix[z][depth][y] = [255, 255, 255, 255];
        //                }
        //            }
        //        }

        //        for (x = 0; x < this.imgHeight; x++)
        //        {
        //            for (z = 0; z < this.deckSize; z++)
        //            {
        //                this.yray.z = z;
        //                this.yray.x = x;

        //                depth = Math.round(this.slicePlane.intersectRayDistance(this.yray));

        //                if (depth > -1 && depth < this.imgHeight)
        //                {
        //                    this.sliceMatrix[z][x][depth] = [255, 255, 255, 255];
        //                }
        //            }
        //        }
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