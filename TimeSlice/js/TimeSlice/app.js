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

// init the scene
function init()
{
    toolPanel = new dat.GUI({ autoPlace: false });
    panel = new TimeSlice.ToolPanel(toolPanel);
    $("#ControlPanel").append(toolPanel.domElement);

    frameSource = new TimeSlice.VideoFrameSource(document.getElementById("monitor"), frameCount, 1, planeWidth, planeHeight);

    renderer = getRenderer();

    scene = createScene();
    stats = addStats();

    camera = createCamera(scene, panel.camera);
    initScreenControl(renderer, camera);

    slicer = new TimeSlice.Slicer(frameCount, planeWidth, planeHeight);
    createBackgroundBox();
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

function getNewPlane(imgTarget)
{
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
    meshRTT.rotation.x = Math.PI / 3;
    meshRTT.rotation.y = Math.PI;
    meshRTT.rotation.z = Math.PI;
    meshRTT.doubleSided = true;

    sceneRTT.add(meshRTT);

    //the shaders
    var effectBC = new THREE.ShaderPass(TimeSlice.ShaderExtras["brightnesscontrast"]);
    var effectGS = new THREE.ShaderPass(TimeSlice.ShaderExtras["grayscale"]);
    var effectHS = new THREE.ShaderPass(TimeSlice.ShaderExtras["huesaturation"]);
    var effectTB = new THREE.ShaderPass(TimeSlice.ShaderExtras["triangleBlur"]);
    var effectIV = new THREE.ShaderPass(TimeSlice.ShaderExtras["invert"]);
    var effectSL = new THREE.ShaderPass(TimeSlice.ShaderExtras["slice"]);

    var renderTargetTexture = new THREE.WebGLRenderTarget(planeWidth, planeHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat });
    var composerScene = new THREE.EffectComposer(renderer, renderTargetTexture);
    var sceneRenderPass = new THREE.RenderPass(sceneRTT, cameraRTT);

    composerScene.addPass(sceneRenderPass);
    composerScene.addPass(effectBC);
    composerScene.addPass(effectGS);
    composerScene.addPass(effectHS);
    composerScene.addPass(effectTB);
    composerScene.addPass(effectIV);
    composerScene.addPass(effectSL);

    var material;

    

    if (composerScene.passes.length % 2 == 0) {
        material = new THREE.MeshBasicMaterial({ overdraw: true, map: composerScene.renderTarget1, transparent: true });
    } else {
        material = new THREE.MeshBasicMaterial({ overdraw: true, map: composerScene.renderTarget2, transparent: true });
    }

    var plane = new THREE.PlaneGeometry(planeWidth, planeHeight);

    var mesh = new THREE.Mesh(plane, material);
    mesh.rotation.x = Math.PI / 2;

    mesh.doubleSided = false;

    scene.add(mesh);

    var planeContainer = {
        sceneRTT: sceneRTT,
        cameraRTT: cameraRTT,
        panelTextureRTT: panelTextureRTT,
        renderTargetTexture: renderTargetTexture,
        composerScene: composerScene,
        mesh : mesh,
        effectBC: effectBC,
        effectGS: effectGS,
        effectHS: effectHS,
        effectTB: effectTB,
        effectIV: effectIV,
        effectSL: effectSL
    };

    planeList.push(planeContainer);

    return planeContainer;
}

function updatePlanes()
{
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

                if (this.planeList.length < imageListLength)
                {
                    planeContainer = getNewPlane(imgTarget);
                }
                else
                {
                    planeContainer = planeList[index];
                }

                planeContainer.panelTextureRTT.image = imgTarget;
                planeContainer.panelTextureRTT.needsUpdate = true;

                planeContainer.effectBC.uniforms.active.value = panel.shaders[0].active;
                planeContainer.effectBC.uniforms.brightness.value = panel.shaders[0].brightness;
                planeContainer.effectBC.uniforms.contrast.value = panel.shaders[0].contrast;
                planeContainer.effectBC.uniforms.transparency.value = panel.shaders[0].transparency;
                planeContainer.effectBC.uniforms.transparent.value = panel.shaders[0].transparent;
                planeContainer.effectBC.uniforms.borw.value = panel.shaders[0].borw;

                planeContainer.effectGS.uniforms.active.value = panel.shaders[1].active;

                planeContainer.effectHS.uniforms.active.value = panel.shaders[2].active;
                planeContainer.effectHS.uniforms.hue.value = panel.shaders[2].hue;
                planeContainer.effectHS.uniforms.saturation.value = panel.shaders[2].saturation;

                planeContainer.effectTB.uniforms.active.value = panel.shaders[3].active;
                planeContainer.effectTB.uniforms.delta1.value = panel.shaders[3].delta1;
                planeContainer.effectTB.uniforms.delta2.value = panel.shaders[3].delta2;

                planeContainer.effectIV.uniforms.active.value = panel.shaders[4].active;

                planeContainer.effectSL.uniforms.active.value = panel.slice.active;
                planeContainer.effectSL.uniforms.tSlice.texture = slicer.getTexture();
                planeContainer.effectSL.uniforms.frameWidth.value = planeWidth;
                planeContainer.effectSL.uniforms.frameHeight.value = planeHeight;
                planeContainer.effectSL.uniforms.frameCount.value = frameCount;
                planeContainer.effectSL.uniforms.frameopacity.value = panel.slice.fropacity;
                planeContainer.effectSL.uniforms.sliceopacity.value = panel.slice.slopacity;

                planeContainer.effectSL.uniforms.zindex.value = index;

                planeContainer.mesh.material.opacity = panel.frame.transparency;

                var panelDistance = -(index * panel.frame.distance);
                planeContainer.mesh.position = new THREE.Vector3(0, 0, panelDistance);
            }
        }
    }
}

function updateSlicer()
{
    slicePlane.position.set(panel.slice.posx, panel.slice.posy, panel.slice.posz);
    slicePlane.rotation.set(panel.slice.rotx, panel.slice.roty, panel.slice.rotz);

    slicer.xSliceOrigin = Math.abs(panel.slice.posx) / panel.frame.distance;
    slicer.ySliceOrigin = Math.abs(panel.slice.posy) / panel.frame.distance;
    slicer.zSliceOrigin = Math.abs(panel.slice.posz) / panel.frame.distance;

    var q = toxi.geom.Quaternion.createFromEuler(slicePlane.rotation.x, slicePlane.rotation.y, slicePlane.rotation.z);
    slicer.xSliceRot = slicePlane.rotation.x;
    slicer.ySliceRot = slicePlane.rotation.y;
    slicer.zSliceRot = slicePlane.rotation.z;
    //slicer.xSliceRot = slicePlane.rotation.x;
    //slicer.ySliceRot = slicePlane.rotation.y;
    //slicer.zSliceRot = slicePlane.rotation.z;

    slicer.updateSlice();

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

// animation loop
function animate()
{
    // loop on request animation loop
    // - it has to be at the begining of the function
    // - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
    requestAnimationFrame(animate);

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

// render the scene
function render()
{
    //render the frames into the texture
    //then apply the shaders
    var planeListlength = this.planeList.length;
    
    for (var ind = 0; ind < planeListlength; ind++)
    {
        if (this.planeList)
        {
            renderer.render(this.planeList[ind].sceneRTT, this.planeList[ind].cameraRTT, this.planeList[ind].renderTargetTexture, true);
            this.planeList[ind].composerScene.render(delta);
        }
    }

    // actually render the scene
    renderer.render(scene, camera);

}

if (!init())
{
    animate();
}