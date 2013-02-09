﻿/// <reference path="../libs/datgui/dat.gui.js" />
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
            bgcolor: [9, 9, 9]
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
            rotx: 0,
            roty: 0,
            rotz: 0,
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
        this.CameraManipulation.add(this.camera, 'rotx', 0, 2 * Math.PI);
        this.CameraManipulation.add(this.camera, 'roty', 0, 2 * Math.PI);
        this.CameraManipulation.add(this.camera, 'rotz', 0, 2 * Math.PI);
        this.CameraManipulation.add(this.camera, 'atx', -2000, 2000);
        this.CameraManipulation.add(this.camera, 'aty', -2000, 2000);
        this.CameraManipulation.add(this.camera, 'atz', -2000, 2000);

        this.slice =
        {
            posx: 387,
            posy: 194,
            posz: 366,
            rotx: 0,
            roty: 0,
            rotz: 0
        };

        this.SliceManipulation.add(this.slice, 'posx', -2000, 2000);
        this.SliceManipulation.add(this.slice, 'posy', -2000, 2000);
        this.SliceManipulation.add(this.slice, 'posz', -2000, 2000);
        this.SliceManipulation.add(this.slice, 'rotx', 0, 2 * Math.PI);
        this.SliceManipulation.add(this.slice, 'roty', 0, 2 * Math.PI);
        this.SliceManipulation.add(this.slice, 'rotz', 0, 2 * Math.PI);

        var initFrameDistance = 10;
        var initFrameTransparency = 1.0;
        this.frame =
        {
            framecount: 100,
            speed: 200,
            distance: 10,
            transparency: 1.0
        };

        this.FrameManipulation.add(this.frame, 'framecount', 2, 200);
        this.FrameManipulation.add(this.frame, 'speed', 1, 1000);
        this.FrameManipulation.add(this.frame, 'distance', 0, 500);
        this.FrameManipulation.add(this.frame, 'transparency', 0.0, 1.0);



        var bccontrols = this.shaderControls.addFolder("BrightnessContrast");


        var bcshadervals =
        {
            active: true,
            brightness: 0.0,
            contrast: 1.0,
            transparent: true,
            transparency: 0.3,
            borw: false
        };

        this.shaders.push(bcshadervals);

        bccontrols.add(bcshadervals, 'active');
        bccontrols.add(bcshadervals, 'brightness', 0.0, 1.0);
        bccontrols.add(bcshadervals, 'contrast', 0.0, 1.0);
        bccontrols.add(bcshadervals, 'transparent');
        bccontrols.add(bcshadervals, 'transparency', 0.0, 1.0);
        bccontrols.add(bcshadervals, 'borw');
        bccontrols.open();


        var grayscalecontrols = this.shaderControls.addFolder("grayscale");

        var grayscalevals =
        {
            active: false
        };

        this.shaders.push(grayscalevals);

        grayscalecontrols.add(grayscalevals, 'active');
        grayscalecontrols.open();

        this.SceneBackgroundFolder.open();
        this.CameraManipulation.open();
        this.FrameManipulation.open();
        this.SliceManipulation.open();
        this.shaderControls.open();
    }
};
