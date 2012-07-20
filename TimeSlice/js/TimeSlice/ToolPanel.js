/// <reference path="../libs/datgui/dat.gui.js" />
var TimeSlice = TimeSlice || {};

TimeSlice.ToolPanel = function()
{
    var me = this;
    me.tools = new dat.GUI({ autoPlace: false });
    me.domElement = me.tools.domElement;
    me.SceneBackgroundFolder = me.tools.addFolder("Scene");
    me.CameraManipulation = me.tools.addFolder("Camera");
    me.FrameManipulation = me.tools.addFolder("Frame");
    me.SliceManipulation = me.tools.addFolder("Slice");
    me.shaderControls = me.tools.addFolder("Shadercontrols");
    me.initializeControls();
};

TimeSlice.ToolPanel.prototype = {

    tools: null,
    SceneBackgroundFolder: null,
    CameraManipulation: null,
    FrameManipulation: null,
    SliceManipulation: null,
    shaderControls: null,
    sceneBackground: null,
    camera: null,
    slice: null,
    frame: null,
    shaders: [],
    allData: new Object(),
    domElement: null,

    initializeControls: function()
    {
        this.sceneBackground =
        {
            bgcolor: [240, 240, 240]
        };

        this.SceneBackgroundFolder.addColor(this.sceneBackground, 'bgcolor');

        this.camera =
        {
            posx: 387,
            posy: 194,
            posz: 366,
            dollyx: 387,
            dollyy: 194,
            dollyz: 366,
            rotx: 0.0,
            roty: 0.0,
            rotz: 0.0,
            atx: 129,
            aty: 43,
            atz: 0
        };

        var positionFolder = this.CameraManipulation.addFolder("position");
        positionFolder.add(this.camera, 'posx', -2000, 2000);
        positionFolder.add(this.camera, 'posy', -2000, 2000);
        positionFolder.add(this.camera, 'posz', -2000, 2000);

        positionFolder.open();

        var dollyFolder = this.CameraManipulation.addFolder("dolly");
        dollyFolder.add(this.camera, 'dollyx', -2000, 2000);
        dollyFolder.add(this.camera, 'dollyy', -2000, 2000);
        dollyFolder.add(this.camera, 'dollyz', -2000, 2000);

        var rotFolder = this.CameraManipulation.addFolder("rotation");
        rotFolder.add(this.camera, 'rotx', 0.0, 2.0 * Math.PI);
        rotFolder.add(this.camera, 'roty', 0.0, 2.0 * Math.PI);
        rotFolder.add(this.camera, 'rotz', 0.0, 2.0 * Math.PI);

        var atFolder = this.CameraManipulation.addFolder("at");
        atFolder.add(this.camera, 'atx', -2000, 2000);
        atFolder.add(this.camera, 'aty', -2000, 2000);
        atFolder.add(this.camera, 'atz', -2000, 2000);

        this.slice =
        {
            active: false,
            planevis: false,
            showtex: false,
            posx: 0,
            posy: 0,
            posz: 0,
            rotx: 0.50,
            roty: 0.01,
            rotz: 0.01,
            fropacity: 0.01,
            slopacity: 1.0,
            plopacity: 0.5
        };

        this.SliceManipulation.add(this.slice, 'active');
        this.SliceManipulation.add(this.slice, 'planevis');
        this.SliceManipulation.add(this.slice, 'showtex');
        this.SliceManipulation.add(this.slice, 'plopacity', 0.0, 1.0, 0.01);
        this.SliceManipulation.add(this.slice, 'fropacity', 0.0, 1.0, 0.01);
        this.SliceManipulation.add(this.slice, 'slopacity', 0.0, 1.0, 0.01);
        this.SliceManipulation.add(this.slice, 'posx', -1000, 1000);
        this.SliceManipulation.add(this.slice, 'posy', -1000, 1000);
        this.SliceManipulation.add(this.slice, 'posz', -1000, 1000);
        this.SliceManipulation.add(this.slice, 'rotx', 0.00, 2 * Math.PI, 0.01);
        this.SliceManipulation.add(this.slice, 'roty', 0.00, 2 * Math.PI, 0.01);
        this.SliceManipulation.add(this.slice, 'rotz', 0.00, 2 * Math.PI, 0.01);


        var initFrameDistance = 10;
        var initFrameTransparency = 1.0;
        this.frame =
        {
            record: true,
            save: App.savePanels,
            framecount: 100,
            speed: 200,
            distance: 10,
            transparency: 1.0
        };

        this.FrameManipulation.add(this.frame, 'record');
        this.FrameManipulation.add(this.frame, 'save');
        this.FrameManipulation.add(this.frame, 'framecount', 2, 200);
        this.FrameManipulation.add(this.frame, 'speed', 1, 1000);
        this.FrameManipulation.add(this.frame, 'distance', 0, 100);
        this.FrameManipulation.add(this.frame, 'transparency', 0.0, 1.0);

        var bcontrols = this.shaderControls.addFolder("Brightness");

        var bshadervals =
        {
            active: false,
            brightness: 0.0
        };

        this.shaders.push(bshadervals);

        bcontrols.add(bshadervals, 'active');
        bcontrols.add(bshadervals, 'brightness', 0.0, 1.0);
        bcontrols.open();

        var ccontrols = this.shaderControls.addFolder("Contrast");

        var cshadervals =
        {
            active: false,
            contrast: 1.0,
            brightness: 1.0,
            saturation: 1.0
        };

        this.shaders.push(cshadervals);

        ccontrols.add(cshadervals, 'active');
        ccontrols.add(cshadervals, 'contrast', 0.5, 30.0, 0.01);
        ccontrols.add(cshadervals, 'brightness', 0.5, 10.0, 0.01);
        ccontrols.add(cshadervals, 'saturation', 0.5, 10.0, 0.01);
        ccontrols.open();

        var grayscalecontrols = this.shaderControls.addFolder("grayscale");

        var grayscalevals =
        {
            active: false
        };

        this.shaders.push(grayscalevals);

        grayscalecontrols.add(grayscalevals, 'active');
        grayscalecontrols.open();

        var huesaturationcontrols = this.shaderControls.addFolder("huesaturation");

        var huesaturationvals =
        {
            active: false,
            hue: 0.0,
            saturation: 0.0
        };

        this.shaders.push(huesaturationvals);

        huesaturationcontrols.add(huesaturationvals, 'active');
        huesaturationcontrols.add(huesaturationvals, "hue", -1.0, 1.0);
        huesaturationcontrols.add(huesaturationvals, "saturation", -1.0, 1.0);

        huesaturationcontrols.open();

        var triangleBlurcontrols = this.shaderControls.addFolder("triangleBlur");

        var triangleBlurvals =
        {
            active: false,
            delta1: 0.01,
            delta2: 0.01
        };

        this.shaders.push(triangleBlurvals);

        triangleBlurcontrols.add(triangleBlurvals, 'active');
        triangleBlurcontrols.add(triangleBlurvals, 'delta1', 0.01, 4.00);
        triangleBlurcontrols.add(triangleBlurvals, 'delta2', 0.01, 4.00);

        triangleBlurcontrols.open();

        var invertcontrols = this.shaderControls.addFolder("invert");

        var invertvals =
        {
            active: false
        };

        this.shaders.push(invertvals);

        invertcontrols.add(invertvals, "active");
        invertcontrols.open();

        var colorTransparentControls = this.shaderControls.addFolder("coloralpha");

        var colorTransparentvals =
        {
            active: false,
            invert: false,
            alphacolor: [128, 128, 128],
            range: 0.1
        };

        this.shaders.push(colorTransparentvals);

        colorTransparentControls.add(colorTransparentvals, 'active');
        colorTransparentControls.addColor(colorTransparentvals, 'alphacolor');
        colorTransparentControls.add(colorTransparentvals, 'range', 0.01, 1.00);
        colorTransparentControls.add(colorTransparentvals, 'invert');

        colorTransparentControls.open();


        this.SceneBackgroundFolder.open();
        this.CameraManipulation.open();
        this.FrameManipulation.open();
        this.SliceManipulation.open();
        this.shaderControls.open();
    }
};

