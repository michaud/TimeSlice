/// <reference path="../../vendor/three.js/Three.js" />
/// <reference path="../../vendor/three.js/ShaderExtras.js" />
/// <reference path="../../vendor/three.js/postprocessing/EffectComposer.js" />
/// <reference path="../../vendor/three.js/postprocessing/TexturePass.js" />
/// <reference path="../../vendor/three.js/postprocessing/ShaderPass.js" />
/// <reference path="Slicer.js" />
/// <reference path="TimeLineShaders.js" />
/// <reference path="FrameManipulation.js" />
/// <reference path="../libs/datgui/dat.gui.js" />
/// <reference path="ToolPanel.js" />
/// <reference path="../libs/jquery-1.7.1.min.js" />
/// <reference path="VideoFrameSource.js" />

var App;

App = (function() {
    var stats, scene, renderer, composer;
    var camera, cameraControl;
    var controlPanel;
    var toolPanel;
    var panel;
    var frameSource;
    var monitor;
    var meshList = [];
    var planeList = [];
    var planeWidth = 320;
    var planeHeight = 240;
    var composerScene;
    var delta = 0.9;
    var cameraControls;
    var bgcolor = new THREE.Color();
    var frameCount = 100;
    var sceneCube;
    var cameraCube;
    var boxMaterial;
    var rtParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: true };
    var slicer;
    var slicePlane;
    var slicePlaneMaterial;
    var hold = false;

    //create an api for the application
    var API = {};

    API.start = function () {
        init();
        animate();
        return console.log('running!');
    };

    // init the application
    function init()
    {
        //create the dat.gui container class
        panel = new TimeSlice.ToolPanel();
        $("#ControlPanel").append(panel.domElement);

        //currently a container for grabbing frames from the webcam
        ///TODO: should be able to also have different video sources like a video file
        frameSource = new TimeSlice.VideoFrameSource(document.getElementById("monitor"), frameCount, 1, planeWidth, planeHeight);

        //main renderer
        renderer = getRenderer('container');

        scene = createScene();
        stats = addStats();

        //main camera
        camera = createCamera(scene, panel.camera);

        initScreenControl(renderer, camera);

        //Slicing the rendered frames
        slicer = new TimeSlice.Slicer(frameCount, planeWidth, planeHeight);

        //box arround the current location for showing a background color
        createBackgroundBox();

        //visualisation of slice plane
        createSlicePlane();
    }

    function createSlicePlane()
    {
        var sliceColor = new THREE.Color();
        sliceColor.r = 0.99;
        sliceColor.g = 0.99;
        sliceColor.b = 0.99;

        slicePlaneMaterial = new THREE.MeshBasicMaterial({
            color: sliceColor,
            opacity: 0.8,
            transparent: true
        });

        slicePlane = new THREE.Mesh(new THREE.PlaneGeometry(planeWidth + 80, planeHeight + 80), slicePlaneMaterial);
    
        slicePlane.doubleSided = true;
        scene.add(slicePlane);
    }

    function createBackgroundBox()
    {
        bgcolor.r = Math.round(panel.sceneBackground.bgcolor[0]) / 255;
        bgcolor.g = Math.round(panel.sceneBackground.bgcolor[1]) / 255;
        bgcolor.b = Math.round(panel.sceneBackground.bgcolor[2]) / 255;

        boxMaterial = new THREE.MeshBasicMaterial({
            color: bgcolor
        });
        var boxmesh = new THREE.Mesh(new THREE.CubeGeometry(10000, 10000, 10000), boxMaterial);
        boxmesh.flipSided = true;
        scene.add(boxmesh);
    }

    //return a plane with updated plane texture
    function getNewPlane(imgTarget)
    {
        //create a separate scene with orthografic camera and single plane for EffectComposer rendering
        //we later use this composer rendered scene as a texture for the planes

        //Make the scene with the image texture on a plane
        var cameraRTT = new THREE.OrthographicCamera(planeWidth / -2, planeWidth / 2, planeHeight / 2, planeHeight / -2, -10000, 10000);
        cameraRTT.position.z = 100;

        var sceneRTT = new THREE.Scene();
        sceneRTT.add(cameraRTT);

        var panelTextureRTT = new THREE.Texture(imgTarget);
        var materialRTT = new THREE.MeshBasicMaterial({ map: panelTextureRTT, overdraw: true, transparent: true });
        var planeRTT = new THREE.PlaneGeometry(planeWidth, planeHeight);

        var meshRTT = new THREE.Mesh(planeRTT, materialRTT);
        meshRTT.position.z = -100;
        meshRTT.rotation.x = Math.PI/ 2;
        meshRTT.rotation.y = Math.PI;
        meshRTT.rotation.z = Math.PI;
        meshRTT.doubleSided = true;

        sceneRTT.add(meshRTT);

        //this will be the texture for the frame plane
        var renderTargetTexture = new THREE.WebGLRenderTarget(planeWidth, planeHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat });

        var composerScene = new THREE.EffectComposer(renderer, renderTargetTexture);
        var sceneRenderPass = new THREE.RenderPass(sceneRTT, cameraRTT);

        //create and add the shaders
        var effectBR = new THREE.ShaderPass(TimeSlice.ShaderExtras["brightness"]);
        var effectCO = new THREE.ShaderPass(TimeSlice.ShaderExtras["contrast"]);
        var effectGS = new THREE.ShaderPass(TimeSlice.ShaderExtras["grayscale"]);
        var effectHS = new THREE.ShaderPass(TimeSlice.ShaderExtras["huesaturation"]);
        var effectTB = new THREE.ShaderPass(TimeSlice.ShaderExtras["triangleBlur"]);
        var effectIV = new THREE.ShaderPass(TimeSlice.ShaderExtras["invert"]);
        var effectSL = new THREE.ShaderPass(TimeSlice.ShaderExtras["slice"]);
        var effectCA = new THREE.ShaderPass(TimeSlice.ShaderExtras["coloralpha"]);
        var effectBL = new THREE.ShaderPass(TimeSlice.ShaderExtras["blur"]);
        var effectTH = new THREE.ShaderPass(TimeSlice.ShaderExtras["threshold"]);

        composerScene.addPass(sceneRenderPass);
        composerScene.addPass(effectBR);
        composerScene.addPass(effectCO);
        composerScene.addPass(effectGS);
        composerScene.addPass(effectHS);
        composerScene.addPass(effectTB);
        composerScene.addPass(effectIV);
        composerScene.addPass(effectSL);
        composerScene.addPass(effectCA);
        composerScene.addPass(effectBL);
        composerScene.addPass(effectTH);


        //create material from composerScene
        var material;

        //hack for getting the rendered texture
        //the composer renders passes into renderTarget1 and switches renderTarget1 to renderTarget2 and renders again
        //TODO: Find the correct way of doing this
        if (composerScene.passes.length % 2 == 0) {
            material = new THREE.MeshBasicMaterial({ overdraw: true, map: composerScene.renderTarget1, transparent: true });
        } else {
            material = new THREE.MeshBasicMaterial({ overdraw: true, map: composerScene.renderTarget2, transparent: true });
        }

        //Actual plane in main scene
        var plane = new THREE.PlaneGeometry(planeWidth, planeHeight);

        var mesh = new THREE.Mesh(plane, material);
        mesh.rotation.x = Math.PI / 2;

        mesh.doubleSided = false;

        scene.add(mesh);

        //return all the parts for updating when actual render gets done
        var planeContainer = {
            sceneRTT: sceneRTT,
            cameraRTT: cameraRTT,
            panelTextureRTT: panelTextureRTT,
            renderTargetTexture: renderTargetTexture,
            composerScene: composerScene,
            mesh : mesh,
            effectBR: effectBR,
            effectCO: effectCO,
            effectGS: effectGS,
            effectHS: effectHS,
            effectTB: effectTB,
            effectIV: effectIV,
            effectSL: effectSL,
            effectCA: effectCA,
            effectBL: effectBL,
            effectTH: effectTH
        };

        //save parts
        planeList.push(planeContainer);

        return planeContainer;
    }

    function updatePlanes()
    {
        //work from image list
        var imageList = frameSource.getFrames();

        if (imageList !== null)
        {
            var imageListLength = imageList.length;

            for (var index = 0; index < imageListLength; index++)
            {
                if (imageList[index].complete)
                {
                    imgTarget = imageList[index];

                    var planeContainer = null;

                    //get new or existing plane
                    if (planeList.length < imageListLength)
                    {
                        planeContainer = getNewPlane(imgTarget);
                    }
                    else
                    {
                        planeContainer = planeList[index];
                    }

                    //update parts

                    planeContainer.panelTextureRTT.image = imgTarget;
                    planeContainer.panelTextureRTT.needsUpdate = true;

                    //update shader data
                    planeContainer.effectBR.uniforms.active.value = panel.shaders[0].active;
                    planeContainer.effectBR.uniforms.brightness.value = panel.shaders[0].brightness;

                    planeContainer.effectCO.uniforms.active.value = panel.shaders[1].active;
                    planeContainer.effectCO.uniforms.contrast.value = panel.shaders[1].contrast;
                    planeContainer.effectCO.uniforms.brightness.value = panel.shaders[1].brightness;
                    planeContainer.effectCO.uniforms.saturation.value = panel.shaders[1].saturation;

                    planeContainer.effectGS.uniforms.active.value = panel.shaders[2].active;

                    planeContainer.effectHS.uniforms.active.value = panel.shaders[3].active;
                    planeContainer.effectHS.uniforms.hue.value = panel.shaders[3].hue;
                    planeContainer.effectHS.uniforms.saturation.value = panel.shaders[3].saturation;

                    planeContainer.effectTB.uniforms.active.value = panel.shaders[4].active;
                    planeContainer.effectTB.uniforms.delta1.value = panel.shaders[4].delta;
                    planeContainer.effectTB.uniforms.delta2.value = panel.shaders[4].delta;
                    planeContainer.effectTB.uniforms.matrixSize.value = panel.shaders[4].matrixSize;

                    planeContainer.effectIV.uniforms.active.value = panel.shaders[5].active;

                    planeContainer.effectCA.uniforms.active.value = panel.shaders[6].active;
                
                    planeContainer.effectCA.uniforms.coloralpha.value = new THREE.Vector3(panel.shaders[6].alphacolor[0] / 255, panel.shaders[6].alphacolor[1] / 255, panel.shaders[6].alphacolor[2] / 255);
                    planeContainer.effectCA.uniforms.range.value = panel.shaders[6].range;
                    planeContainer.effectCA.uniforms.invert.value = panel.shaders[6].invert;

                    //update slicer data
                    planeContainer.effectSL.uniforms.active.value = panel.slice.active;
                    planeContainer.effectSL.uniforms.showtex.value = panel.slice.showtex;
                    planeContainer.effectSL.uniforms.frameopacity.value = panel.slice.fropacity;
                    planeContainer.effectSL.uniforms.sliceopacity.value = panel.slice.slopacity;

                    planeContainer.effectSL.uniforms.frameWidth.value = planeWidth;
                    planeContainer.effectSL.uniforms.frameHeight.value = planeHeight;

                    //slicer data is a image texture where the slice plane data is read from the colors
                    planeContainer.effectSL.uniforms.tSlice.texture = slicer.getTexture();
                    planeContainer.effectSL.uniforms.frameCount.value = frameCount;
                    //index is the current plane
                    planeContainer.effectSL.uniforms.zindex.value = index;

                    planeContainer.effectBL.uniforms.active.value = panel.shaders[7].active;
                    planeContainer.effectBL.uniforms.radius.value = panel.shaders[7].radius;
                    planeContainer.effectBL.uniforms.delta.value = panel.shaders[7].delta;
                    
                    planeContainer.effectTH.uniforms.active.value = panel.shaders[8].active;
                    planeContainer.effectTH.uniforms.amount.value = panel.shaders[8].amount;

                    planeContainer.mesh.material.opacity = panel.frame.transparency;

                    //position of the plane
                    var panelDistance = -(index * panel.frame.distance);
                    planeContainer.mesh.position = new THREE.Vector3(0, 0, panelDistance);
                }
            }
        }
    }

    function updateSlicer()
    {
        //update slice data
        slicePlane.position.set(panel.slice.posx, panel.slice.posy, panel.slice.posz);
        slicePlane.rotation.set(panel.slice.rotx, panel.slice.roty, panel.slice.rotz);

        slicer.xSliceOrigin = panel.slice.posx / panel.frame.distance;
        slicer.ySliceOrigin = panel.slice.posy / panel.frame.distance;
        slicer.zSliceOrigin = panel.slice.posz / panel.frame.distance;

        slicer.xSliceRot = slicePlane.rotation.x;
        slicer.ySliceRot = slicePlane.rotation.y;
        slicer.zSliceRot = slicePlane.rotation.z;

        slicer.updateSlice();

        //show visualisation of slice plane
        //TODO: there is an offset because of the adjustable distance between the rendered planes. Should account for that
        var planeVis = false;

        slicePlane.visible = panel.slice.active ? (panel.slice.planevis ? true : false) : planeVis = panel.slice.planevis = false;

        slicePlane.material.opacity = panel.slice.plopacity;
    }

    function updateCamera()
    {
        camera.position.set(panel.camera.posx, panel.camera.posy, panel.camera.posz);
        camera.rotation.set(panel.camera.rotx, panel.camera.roty, panel.camera.rotz);
        camera.lookAt(new THREE.Vector3(panel.camera.atx, panel.camera.aty, panel.camera.atz));
    }

    function updateFrameSource()
    {
        frameSource.snapshotTiming = panel.frame.speed;
        frameSource.frameCount = panel.frame.framecount;
    }

    function updateBackground()
    {
        bgcolor.r = Math.round(panel.sceneBackground.bgcolor[0]) / 255;
        bgcolor.g = Math.round(panel.sceneBackground.bgcolor[1]) / 255;
        bgcolor.b = Math.round(panel.sceneBackground.bgcolor[2]) / 255;

        boxMaterial.color = bgcolor;
    }

    // main animation loop
    function animate()
    {
        // loop on request animation loop
        // - it has to be at the begining of the function
        // - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
        requestAnimationFrame(animate);

        //stop / start recording of frames
        if (panel.frame.record)
        {
            frameSource.snapshot();
        }

        updateSlicer();
        updatePlanes();
        updateCamera();
        updateFrameSource();
        updateBackground();
    
        // update camera controls
        //cameraControls.update();
    
        // do the render
        render();

        // update stats
        stats.update();

    }

    //save the frames into pictures. Currently saves the to tabs in browser
    API.savePanels = function savePanels()
    {
        //hold the main renderer
        //TODO: needed?
        hold = true;

        var currCanvasSize = { width: renderer.domElement.width, height: renderer.domElement.height };

        //set viewport of main renderer to just the plane size
        renderer.setSize(planeWidth, planeHeight);

        //create a temporary scene with the image texture on a plane
        //create a temporary camera
        var cameraRTT = new THREE.OrthographicCamera(planeWidth / -2, planeWidth / 2, planeHeight / 2, planeHeight / -2, -10000, 10000);
        cameraRTT.position.z = 100;
        scene.add(cameraRTT);

        var planeListlength = planeList.length;

        if (planeList) {
            for (var ind = 0; ind < planeListlength; ind++) {

                //create material from composerScene
                var material;

                //hack for getting the rendered texture
                //the composer renders passes into renderTarget1 and switches renderTarget1 to renderTarget2 and renders again
                //TODO: Find the correct way of doing this
                if (planeList[ind].composerScene.passes.length % 2 == 0) {
                    material = new THREE.MeshBasicMaterial({ overdraw: true, map: planeList[ind].composerScene.renderTarget1, transparent: true });
                } else {
                    material = new THREE.MeshBasicMaterial({ overdraw: true, map: planeList[ind].composerScene.renderTarget2, transparent: true });
                }

                //create a temporary plane in the main scene to render the single plane to
                var plane = new THREE.PlaneGeometry(planeWidth, planeHeight);

                //and a temporary mesh
                var mesh = new THREE.Mesh(plane, material);
                mesh.rotation.x = Math.PI / 2;

                mesh.doubleSided = false;

                scene.add(mesh);

                //render the composer passes
                renderer.render(planeList[ind].sceneRTT, planeList[ind].cameraRTT, planeList[ind].renderTargetTexture, true);
                planeList[ind].composerScene.render();

                //now render the complete panel
                renderer.render(scene, cameraRTT, undefined, true);

                //get the image data
                var mimetype = "image/png";
                var dataUrl = renderer.domElement.toDataURL(mimetype);

                //cleanup
                scene.remove(mesh);

                window.open(dataUrl, "name-" + Math.random());
            }
        }

        //cleanup
        scene.remove(cameraRTT);
        
        renderer.setSize(currCanvasSize.width, currCanvasSize.height);

        hold = false;
    }

    // render the scene
    function render()
    {
        if (!hold) {
            //render the frames into the texture
            //then apply the shaders
            var planeListlength = planeList.length;

            for (var ind = 0; ind < planeListlength; ind++) {
                if (planeList) {
                    renderer.render(planeList[ind].sceneRTT, planeList[ind].cameraRTT, planeList[ind].renderTargetTexture, true);
                    planeList[ind].composerScene.render(delta);
                }
            }

            // actually render the scene
            renderer.render(scene, camera);
        }

    }

    /// <reference path="../../vendor/three.js/Three.js" />
    // add Stats.js - https://github.com/mrdoob/stats.js
    function addStats() {
        // add Stats.js - https://github.com/mrdoob/stats.js
        var stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.bottom = '0px';
        document.body.appendChild(stats.domElement);
        return stats;
    }

    function getRenderer(targetId) {
        var newRenderer;

        if (Detector.webgl) {
            newRenderer = new THREE.WebGLRenderer({
                antialias: true, // to get smoother output
                preserveDrawingBuffer: true,
                autoClear: false,	// to allow screenshot
                alpha: true
            });
        }
        else {
            newRenderer = new THREE.CanvasRenderer();
        }

        newRenderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById(targetId).appendChild(newRenderer.domElement);

        return newRenderer;
    }

    function createScene() {
        // create a scene
        var newScene = new THREE.Scene();

        return newScene;
    }

    function initScreenControl(arenderer, acamera) {
        // transparently support window resize
        THREEx.WindowResize.bind(arenderer, acamera);
        // allow 'p' to make screenshot
        THREEx.Screenshot.bindKey(arenderer);
        // allow 'f' to go fullscreen where this feature is supported
        if (THREEx.FullScreen.available()) {
            THREEx.FullScreen.bindKey();
            document.getElementById('inlineDoc').innerHTML += "- <i>f</i> for fullscreen";
        }
    }

    function initLight(ascene) {
        // here you add your objects
        // - you will most likely replace this part by your own
        var light = new THREE.DirectionalLight(Math.random() * 0xffffff);
        light.position.set(Math.random(), Math.random(), Math.random()).normalize();
        ascene.add(light);
        light = new THREE.DirectionalLight(Math.random() * 0xffffff);
        light.position.set(Math.random(), Math.random(), Math.random()).normalize();
        ascene.add(light);
        light = new THREE.PointLight(Math.random() * 0xffffff);
        light.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(1.2);
        ascene.add(light);
        light = new THREE.PointLight(Math.random() * 0xffffff);
        light.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(1.2);
        ascene.add(light);
    }

    function createCamera(ascene, cameraData) {
        // put a camera in the scene
        var newCamera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 100000);
        newCamera.position.set(cameraData.posx, cameraData.posy, cameraData.posz);
        newCamera.lookAt(new THREE.Vector3(cameraData.atx, cameraData.aty, cameraData.atz));
        ascene.add(newCamera);

        // create a camera contol
        //cameraControls = new THREE.TrackballControls( camera, document.getElementById( "container" ) );

        return newCamera;
    }

    return API;
})();

App.start();