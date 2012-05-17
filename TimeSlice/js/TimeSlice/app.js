/// <reference path="../../vendor/three.js/Three.js" />
/// <reference path="../../vendor/three.js/ShaderExtras.js" />
/// <reference path="../../vendor/three.js/postprocessing/EffectComposer.js" />
/// <reference path="../../vendor/three.js/postprocessing/TexturePass.js" />
/// <reference path="../../vendor/three.js/postprocessing/ShaderPass.js" />
/// <reference path="TimeLineShaders.js" />
/// <reference path="FrameManipulation.js" />
/// <reference path="../libs/glfx.js" />
/// <reference path="../libs/datgui/dat.gui.js" />
/// <reference path="ToolPanel.js" />
/// <reference path="../libs/jquery-1.7.1.min.js" />
//http://localhost:58998/TimeSlice/index.html
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
var rtParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: true };

// init the scene
function init()
{
    toolPanel = new dat.GUI({autoPlace:false});
    panel = new TimeSlice.ToolPanel(toolPanel);

    $("#ControlPanel").append(toolPanel.domElement);

    frameSource = new TimeSlice.VideoFrameSource(document.getElementById("monitor"), 30, 300, planeWidth, planeHeight);
    renderer = getRenderer();
    stats = addStats();
    scene = createScene();
    camera = createCamera(scene, panel.camera);
    initScreenControl(renderer, camera);
}

function updatePlanes()
{
    composer = new THREE.EffectComposer(renderer, new THREE.WebGLRenderTarget(200, 200, rtParameters));

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
                    planeContainer = {
                        cameraRTT: new THREE.OrthographicCamera(planeWidth / -2, planeWidth / 2, planeHeight / 2, planeHeight / -2, -10000, 10000),
                        sceneRTT: new THREE.Scene(),
                        panelTextureRTT: new THREE.Texture(imgTarget, undefined, undefined, undefined, THREE.LinearFilter, THREE.LinearFilter),
                        materialRTT: null,
                        planeRTT: new THREE.PlaneGeometry(planeWidth, planeHeight),
                        MeshRTT: null,
                        RenderTargetRTT: new THREE.WebGLRenderTarget(planeWidth, planeHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat }),
                        material : new THREE.MeshBasicMaterial({ map: null, overdraw: true, transparent: true }),
                        geometry: new THREE.PlaneGeometry(planeWidth, planeHeight),
                        mesh: null
                    };

                    planeContainer.cameraRTT.position.z = 100;
                    planeContainer.sceneRTT.add(planeContainer.cameraRTT);
                    planeContainer.materialRTT = new THREE.MeshBasicMaterial({ map: planeContainer.panelTextureRTT, overdraw: true, transparent: true });
                    planeContainer.MeshRTT = new THREE.Mesh(planeContainer.planeRTT, planeContainer.materialRTT);
                    planeContainer.MeshRTT.position.z = -100;
                    planeContainer.MeshRTT.doubleSided = true;
                    planeContainer.sceneRTT.add(planeContainer.MeshRTT);
                    planeContainer.material.map = planeContainer.RenderTargetRTT;
                    planeContainer.mesh = new THREE.Mesh(planeContainer.geometry, planeContainer.material);
                    planeContainer.mesh.doubleSided = true;

                    var renderModel = new THREE.RenderPass(planeContainer.sceneRTT, planeContainer.cameraRTT);
                    var effectBloom = new THREE.BloomPass(0.5);

                    //var effectScreen = new THREE.ScreenPass();

                    composer.addPass(renderModel);
                    composer.addPass(effectBloom);
                    //composer.addPass(effectScreen);
                    var effectScreen = new THREE.ShaderPass(THREE.ShaderExtras["screen"]);
                    effectScreen.renderToScreen = true;
                    composer.addPass(effectScreen);

                    scene.add(planeContainer.mesh);

                    planeList.push(planeContainer);
                }
                else
                {
                    planeContainer = planeList[index];
                    planeContainer.panelTextureRTT.image = imageList[index];
                    planeContainer.panelTextureRTT.needsUpdate = true;

                }

                renderer.render(planeContainer.sceneRTT, planeContainer.cameraRTT, planeContainer.RenderTargetRTT, true);

                var panelDistance = -(index * panel.frame.distance);
                this.planeList[index].mesh.position = new THREE.Vector3(0, 0, panelDistance);
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

    camera.position.set(panel.camera.posx,panel.camera.posy,panel.camera.posz);
    camera.rotation.set(panel.camera.rotx,panel.camera.roty,panel.camera.rotz);
    camera.lookAt(new THREE.Vector3(panel.camera.atx, panel.camera.aty, panel.camera.atz));

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
    composer.render(0.5);
    // actually render the scene
    renderer.render(scene, camera);

//    if (this.meshList[0] !== undefined)
//    {
//        var textureMonitor = document.getElementById("textureMonitor");
//        var ctx = textureMonitor.getContext('2d');
//        ctx.drawImage(this.meshList[0].material.uniforms.tDiffuse.texture.image, 0, 0, 40, 30);
//    }
//    //renderer.clear();
    //composer.render();
}

if (!init())
{
    animate();
}

//				var element = document.createElement( "canvas" );
//				var ctx = element.getContext( "2d" );
//				ctx.drawImage( imgTarget, 0, 0, frameSource.snapshotWidth, frameSource.snapshotHeight );
//				ctx.createImageData( frameSource.snapshotWidth, frameSource.snapshotHeight );
//				var imageData = ctx.getImageData( 0, 0, frameSource.snapshotWidth, frameSource.snapshotHeight );
// create a new batch of pixels with the same
// dimensions as the image:
//				var temp = imageData;

//                var canvas = fx.canvas();
//                var texture = canvas.texture(imgTarget);
//                canvas.draw(texture).brightnessContrast(-0.16, 0.87).update();
////                var newImag = new Image();
//                var cnvData = canvas.toDataURL('image/png');
//                newImag.src = cnvData;

//                var vertShader = TimeSlice.ShaderExtras.sepia.vertexShader; //  THREE.ShaderExtras.sepia.vertexShader;
//                var fragShader = TimeSlice.ShaderExtras.sepia.fragmentShader;
//                var attributes = {};
//                var uniforms = TimeSlice.ShaderExtras.sepia.uniforms;
//                uniforms.tDiffuse.texture = new THREE.Texture(imageTarget);
//                uniforms.tDiffuse.value = 1;
//                uniforms.amount.value = 1.0;

//                var material = new THREE.ShaderMaterial(
//                {
//                    uniforms: uniforms,
//                    attributes: attributes,
//                    vertexShader: vertShader,
//                    fragmentShader: fragShader
//                });

//                    var vertShader = TimeSlice.ShaderExtras.sepia.vertexShader;//  THREE.ShaderExtras.sepia.vertexShader;
//                    var fragShader = TimeSlice.ShaderExtras.sepia.fragmentShader;
//                    var attributes = {};
//                    var uniforms = TimeSlice.ShaderExtras.sepia.uniforms;
//                    uniforms.tDiffuse.texture = panelTexture;
//                    uniforms.tDiffuse.value = 1;
//                    uniforms.amount.value = frameManipulation.FrameTransparency;

//                    var material = new THREE.ShaderMaterial(
//                    {
//                        uniforms: uniforms,
//                        attributes: attributes,
//                        vertexShader: vertShader,
//                        fragmentShader: fragShader
//                    });

//                    
//                    material.opacity = { type: "f", value: 0.1 };
