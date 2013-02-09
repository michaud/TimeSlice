/// <reference path="../../vendor/three.js/Three.js" />
/// <reference path="../../vendor/three.js/ShaderExtras.js" />
/// <reference path="../../vendor/three.js/postprocessing/EffectComposer.js" />
/// <reference path="../../vendor/three.js/postprocessing/TexturePass.js" />
/// <reference path="../../vendor/three.js/postprocessing/ShaderPass.js" />
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
var sceneCube;
var cameraCube;
var boxMaterial;
var rtParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: true };

// init the scene
function init()
{
    toolPanel = new dat.GUI({ autoPlace: false });
    panel = new TimeSlice.ToolPanel(toolPanel);

    $("#ControlPanel").append(toolPanel.domElement);

    frameSource = new TimeSlice.VideoFrameSource(document.getElementById("monitor"), 200, 1, planeWidth, planeHeight);
    renderer = getRenderer();
    stats = addStats();
    scene = createScene();
    camera = createCamera(scene, panel.camera);

    sceneCube = new THREE.Scene();
    cameraCube = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100000);

    bgcolor.r = Math.round(panel.sceneBackground.bgcolor[0]) / 255;
    bgcolor.g = Math.round(panel.sceneBackground.bgcolor[1]) / 255;
    bgcolor.b = Math.round(panel.sceneBackground.bgcolor[2]) / 255;

    boxMaterial = new THREE.MeshBasicMaterial({
        color: bgcolor
    });

    var boxmesh = new THREE.Mesh(new THREE.CubeGeometry(10000, 10000, 10000), boxMaterial);
    boxmesh.flipSided = true;
    scene.add(boxmesh);


    initScreenControl(renderer, camera);
}

function getTextureSceneContainer(imgTarget)
{
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

    var effectBC = new THREE.ShaderPass(TimeSlice.ShaderExtras["brightnesscontrast"]);
    var effectGS = new THREE.ShaderPass(TimeSlice.ShaderExtras["grayscale"]);

    effectBC.uniforms.active.value = panel.shaders[0].active;
    effectBC.uniforms.brightness.value = panel.shaders[0].brightness;
    effectBC.uniforms.contrast.value = panel.shaders[0].contrast;
    effectBC.uniforms.transparency.value = panel.shaders[0].transparency;
    effectBC.uniforms.transparent.value = panel.shaders[0].transparent;
    effectBC.uniforms.borw.value = panel.shaders[0].borw;

    effectGS.uniforms.active.value = panel.shaders[1].active;

    var renderTargetTexture = new THREE.WebGLRenderTarget(planeWidth, planeHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat });

    var composerScene = new THREE.EffectComposer(renderer, renderTargetTexture);

    var sceneRenderPass = new THREE.RenderPass(sceneRTT, cameraRTT);

    composerScene.addPass(sceneRenderPass);
    composerScene.addPass(effectBC);
    composerScene.addPass(effectGS);

    return {
        sceneRTT: sceneRTT,
        panelTextureRTT: panelTextureRTT,
        cameraRTT: cameraRTT,
        renderTargetTexture: renderTargetTexture,
        composerScene: composerScene,
        effectBC: effectBC,
        effectGS: effectGS
    };
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
                    planeContainer = getTextureSceneContainer(imgTarget);

                    planeContainer.material = new THREE.MeshBasicMaterial({ overdraw: true, map: planeContainer.composerScene.renderTarget2, transparent: true });

                    planeContainer.plane = new THREE.PlaneGeometry(planeWidth, planeHeight);

                    planeContainer.mesh = new THREE.Mesh(planeContainer.plane, planeContainer.material);
                    planeContainer.mesh.rotation.x = Math.PI / 2;

                    planeContainer.doubleSided = false;

                    scene.add(planeContainer.mesh);

                    planeList.push(planeContainer);
                }
                else
                {
                    planeContainer = planeList[index];
                    planeContainer.panelTextureRTT.image = imageList[index];
                    planeContainer.panelTextureRTT.needsUpdate = true;
                }

                planeContainer.effectBC.uniforms.active.value = panel.shaders[0].active;
                planeContainer.effectBC.uniforms.brightness.value = panel.shaders[0].brightness;
                planeContainer.effectBC.uniforms.contrast.value = panel.shaders[0].contrast;
                planeContainer.effectBC.uniforms.transparency.value = panel.shaders[0].transparency;
                planeContainer.effectBC.uniforms.transparent.value = panel.shaders[0].transparent;
                planeContainer.effectBC.uniforms.borw.value = panel.shaders[0].borw;

                planeContainer.effectGS.uniforms.active.value = panel.shaders[1].active;

                planeContainer.material.opacity = panel.frame.transparency;

                var panelDistance = -(index * panel.frame.distance);
                planeContainer.mesh.position = new THREE.Vector3(0, 0, panelDistance);
            }
        }
    }

}

// animation loop
function animate()
{
    // loop on request animation loop
    // - it has to be at the begining of the function
    // - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
    requestAnimationFrame(animate);

    frameSource.snapshot();

    updatePlanes();

    camera.position.set(panel.camera.posx, panel.camera.posy, panel.camera.posz);
    camera.rotation.set(panel.camera.rotx, panel.camera.roty, panel.camera.rotz);
    camera.lookAt(new THREE.Vector3(panel.camera.atx, panel.camera.aty, panel.camera.atz));

    frameSource.snapshotTiming = panel.frame.speed;
    frameSource.frameCount = panel.frame.framecount;

    bgcolor.r = Math.round(panel.sceneBackground.bgcolor[0]) / 255;
    bgcolor.g = Math.round(panel.sceneBackground.bgcolor[1]) / 255;
    bgcolor.b = Math.round(panel.sceneBackground.bgcolor[2]) / 255;

    boxMaterial.color = bgcolor;
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