/// <reference path="../../vendor/three.js/Three.js" />
/// <reference path="../../vendor/three.js/ShaderExtras.js" />
/// <reference path="../../vendor/three.js/postprocessing/TexturePass.js" />
/// <reference path="../../vendor/three.js/postprocessing/ShaderPass.js" />
/// <reference path="TimeLineShaders.js" />
/// <reference path="FrameManipulation.js" />
/// <reference path="../libs/glfx.js" />
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
var planeWidth = 320;
var planeHeight = 240;

// init the scene
function init()
{
    toolPanel = new dat.GUI({autoPlace:false});
    panel = new TimeSlice.ToolPanel(toolPanel);

    $("#ControlPanel").append(toolPanel.domElement);

    frameSource = new TimeSlice.VideoFrameSource(document.getElementById('monitor'), 30, 300, planeWidth, planeHeight);
    renderer = getRenderer();
    stats = addStats();
    scene = createScene();
    camera = createCamera(scene, panel.camera);
    initScreenControl(renderer, camera);
}

// animation loop
function animate()
{
    // loop on request animation loop
    // - it has to be at the begining of the function
    // - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
    requestAnimationFrame(animate);

    frameSource.snapshot();

    var imageList = frameSource.getFrames();
    var imageListLength = imageList.length;

    if (imageList !== null)
    {
        for (var index = 0; index < imageListLength; index++)
        {
            if (imageList[index].complete)
            {
                imgTarget = imageList[index];


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

                if (this.meshList.length < imageListLength)
                {


                    var panelTexture = new THREE.Texture(imgTarget, undefined, undefined, undefined, THREE.LinearFilter, THREE.LinearFilter);
                    panelTexture.generateMipmaps = false;
                    panelTexture.needsUpdate = true;

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

                    var material = new THREE.MeshBasicMaterial( { map: panelTexture, overdraw: true, transparent: true } );
                    var geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

                    var newMesh = new THREE.Mesh(geometry, material);
                    newMesh.doubleSided = true;
                    this.meshList.push(newMesh);
                    scene.add(newMesh);
                }
                else
                {
                    this.meshList[index].material.map.image = imgTarget;
                    this.meshList[index].material.map.needsUpdate = true;
                }

                var panelDistance = -(index * panel.frame.distance); //  frameManipulation.FrameDistance
                this.meshList[index].position = new THREE.Vector3(0, 0, panelDistance);
            }
        }
    }

    camera.position.setX(panel.camera.posx);
    camera.position.setY(panel.camera.posy);
    camera.position.setZ(panel.camera.posz);
    camera.rotation.setX(panel.camera.rotx);
    camera.rotation.setY(panel.camera.roty);
    camera.rotation.setZ(panel.camera.rotz);
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

