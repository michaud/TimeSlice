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
var delta = 0.01;
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

function getTextureSceneContainer(imgTarget)
{
    var cameraRTT = new THREE.OrthographicCamera(planeWidth / -2, planeWidth / 2, planeHeight / 2, planeHeight / -2, -10000, 10000);
    cameraRTT.position.z = 100;

    var sceneRTT = new THREE.Scene();
    sceneRTT.add(cameraRTT);

    var renderTargetTexture = new THREE.WebGLRenderTarget(planeWidth, planeHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat });
    var panelTextureRTT = new THREE.Texture(imgTarget, undefined, undefined, undefined, THREE.LinearFilter, THREE.LinearFilter);
    var materialRTT = new THREE.MeshBasicMaterial({ map: panelTextureRTT, overdraw: true, transparent: true });
    var planeRTT = new THREE.PlaneGeometry(planeWidth, planeHeight);
    
    var meshRTT = new THREE.Mesh(planeRTT, materialRTT);
    meshRTT.position.z = -100;
    meshRTT.rotation.x = Math.PI/3;
    meshRTT.doubleSided = true;

    sceneRTT.add(meshRTT);

				var sceneRenderPass = new THREE.RenderPass(sceneRTT, cameraRTT);

				var composerScene = new THREE.EffectComposer(renderer, renderTargetTexture);
				composerScene.addPass(sceneRenderPass);

				var shaderVignette = THREE.ShaderExtras["vignette"];
				var effectVignette = new THREE.ShaderPass( shaderVignette );
				//effectVignette.uniforms[ "offset" ].value = 0.5;
				//effectVignette.uniforms[ "darkness" ].value = 0.2;
				effectVignette.renderToScreen = true;

				var effectDotScreen = new THREE.DotScreenPass( new THREE.Vector2( 0, 0 ), 0.5, 0.2 );

				var renderScene = new THREE.TexturePass( composerScene.renderTarget2 );

				composer2 = new THREE.EffectComposer(renderer, renderTargetTexture);

				composer2.addPass( renderScene );
				composer2.addPass( effectDotScreen );
				composer2.addPass( effectVignette );

    return {
        sceneRTT : sceneRTT,
        panelTextureRTT : panelTextureRTT,
        cameraRTT: cameraRTT,
        renderTargetTexture: renderTargetTexture,
        composerScene: composerScene,
        composer2: composer2
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

                    planeContainer.material = new THREE.MeshBasicMaterial({ color: 0xffffff, map: planeContainer.renderTargetTexture });

                    planeContainer.plane = new THREE.PlaneGeometry(planeWidth, planeHeight);

                    planeContainer.mesh = new THREE.Mesh(planeContainer.plane, planeContainer.material);
                    planeContainer.mesh.rotation.x = Math.PI / 2;

                    planeContainer.doubleSided = true;


                    scene.add(planeContainer.mesh);

                    planeList.push(planeContainer);
                }
                else
                {
                    planeContainer = planeList[index];
                    planeContainer.panelTextureRTT.image = imageList[index];
                    planeContainer.panelTextureRTT.needsUpdate = true;
                }

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
    var planeListlength = this.planeList.length;
    for (var ind = 0; ind < planeListlength; ind++)
    {
        if (this.planeList)
        {
            renderer.render(this.planeList[ind].sceneRTT, this.planeList[ind].cameraRTT, this.planeList[ind].renderTargetTexture, true);
            this.planeList[ind].composerScene.render(delta);
            this.planeList[ind].composer2.render(delta);

        }
    }
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
