/// <reference path="../libs/datgui/dat.gui.js" />
var TimeSlice = TimeSlice || {};

TimeSlice.ToolPanel = function(panel)
{
    this.tools = panel;

    this.SceneBackgroundFolder = this.tools.addFolder("Scene");
    this.CameraManipulation = this.tools.addFolder("Camera");
    this.FrameManipulation = this.tools.addFolder("Frame");
    this.SliceManipulation = this.tools.addFolder("Slice");
    this.shaderControls = this.tools.addFolder("Shadercontrols");
    this.initializeControls();
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



        var camPosX = this.CameraManipulation.add(this.camera, 'posx', -2000, 2000);
        this.CameraManipulation.add(this.camera, 'posy', -2000, 2000);
        this.CameraManipulation.add(this.camera, 'posz', -2000, 2000);
        this.CameraManipulation.add(this.camera, 'dollyx', -2000, 2000);
        this.CameraManipulation.add(this.camera, 'dollyy', -2000, 2000);
        this.CameraManipulation.add(this.camera, 'dollyz', -2000, 2000);
        this.CameraManipulation.add(this.camera, 'rotx', 0.0, 2.0 * Math.PI);
        this.CameraManipulation.add(this.camera, 'roty', 0.0, 2.0 * Math.PI);
        this.CameraManipulation.add(this.camera, 'rotz', 0.0, 2.0 * Math.PI);
        this.CameraManipulation.add(this.camera, 'atx', -2000, 2000);
        this.CameraManipulation.add(this.camera, 'aty', -2000, 2000);
        this.CameraManipulation.add(this.camera, 'atz', -2000, 2000);

        this.slice =
        {
            active: false,
            planevis: false,
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
            framecount: 100,
            speed: 200,
            distance: 10,
            transparency: 1.0
        };

        this.FrameManipulation.add(this.frame, 'record');
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
            contrast: 0.0,
            center: 0.0,
            uncenter: 0
        };

        this.shaders.push(cshadervals);

        ccontrols.add(cshadervals, 'active');
        ccontrols.add(cshadervals, 'contrast', -1.0, 30.0);
        ccontrols.add(cshadervals, 'center', -1.0, 1.0);
        ccontrols.add(cshadervals, 'uncenter', -1.0, 1.0);
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

        this.SceneBackgroundFolder.open();
        this.CameraManipulation.open();
        this.FrameManipulation.open();
        //this.SliceManipulation.open();
        this.shaderControls.open();

    }
};

