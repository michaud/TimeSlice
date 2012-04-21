/// <reference path="../../vendor/three.js/Three.js" />
/// <reference path="../../vendor/three.js/ShaderExtras.js" />
/// <reference path="../../vendor/three.js/postprocessing/EffectComposer.js" />
/// <reference path="../../vendor/three.js/postprocessing/TexturePass.js" />
/// <reference path="../../vendor/three.js/postprocessing/ShaderPass.js" />

var stats, scene, renderer, composer;
var camera, cameraControl;
var controlPanel;
var frameSource;
var monitor;
var meshList = [];
var frameDistance = 50;
var planeWidth = 320;
var planeHeight = 240;
var initCamPosX = 387;
var initCamPosY = 194;
var initCamPosZ = 366;
var initCamRotX = 0;
var initCamRotY = 0;
var initCamRotZ = 0;
var initCamAtX = 129;
var initCamAtY = 43;
var initCamAtZ = 0;
var cameraManipulation = null;
var frameManipulation = null;
var initFrameDistance = 10;
var initFrameTransparency = 1.0;

// init the scene
function init()
{
    frameSource = new TimeSlice.VideoFrameSource(document.getElementById('monitor'), 30, 300, planeWidth, planeHeight);
    renderer = getRenderer();
    stats = addStats();
    scene = createScene();
    camera = createCamera(scene, initCamPosX, initCamPosY, initCamPosZ, initCamAtX, initCamAtY, initCamAtZ);
    initScreenControl(renderer, camera);

    cameraManipulation = new TimeSlice.CameraManipulation(
				initCamPosX, initCamPosY, initCamPosZ,
				initCamRotX, initCamRotY, initCamRotZ,
				initCamAtX, initCamAtY, initCamAtZ,
				"CamPosX", "CamPosY", "CamPosZ",
				"CamRotX", "CamRotY", "CamRotZ",
				"CamAtX", "CamAtY", "CamAtZ");

    frameManipulation = new TimeSlice.FrameManipulation(initFrameDistance, initFrameTransparency,
				"FrameDistance",
				"FrameTransparency");

    controlPanel = new TimeSlice.ControlPanel(cameraManipulation, frameManipulation);
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


                if (this.meshList.length < imageListLength)
                {
                    var panelTexture = new THREE.Texture(imgTarget, undefined, undefined, undefined, THREE.LinearFilter, THREE.LinearFilter);
                    panelTexture.generateMipmaps = false;
                    panelTexture.needsUpdate = true;

                    var vertShader = THREE.ShaderExtras.sepia.vertexShader;
                    var fragShader = THREE.ShaderExtras.sepia.fragmentShader;
                    var attributes = {};
                    var uniforms = THREE.ShaderExtras.sepia.uniforms;
                    uniforms.tDiffuse.texture = panelTexture;
                    uniforms.tDiffuse.value = 1;
                    uniforms.amount.value = 1;

                    var material = new THREE.ShaderMaterial(
                    {
                        uniforms: uniforms,
                        attributes: attributes,
                        vertexShader: vertShader,
                        fragmentShader: fragShader
                    });

                    
                    material.opacity = { type: "f", value: 0.1 };

                    //var material = new THREE.MeshBasicMaterial( { map: panelTexture, overdraw: true, transparent: true } );
                    var geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

                    var newMesh = new THREE.Mesh(geometry, material);
                    newMesh.doubleSided = true;
                    this.meshList.push(newMesh);
                    scene.add(newMesh);
                }
                else
                {
                    this.meshList[index].material.uniforms.tDiffuse.texture.image = imgTarget;
                    this.meshList[index].material.uniforms.tDiffuse.texture.needsUpdate = true;
                }

                composer = new THREE.EffectComposer(renderer, this.meshList[index]);
                
                var panelDistance = -(index * frameManipulation.FrameDistance);
                this.meshList[index].position = new THREE.Vector3(0, 0, panelDistance);
            }
        }
    }

    camera.position.setX(cameraManipulation.CamPosX);
    camera.position.setY(cameraManipulation.CamPosY);
    camera.position.setZ(cameraManipulation.CamPosZ);
    camera.rotation.setX(cameraManipulation.CamRotX);
    camera.rotation.setY(cameraManipulation.CamRotY);
    camera.rotation.setZ(cameraManipulation.CamRotZ);
    camera.lookAt(new THREE.Vector3(cameraManipulation.CamAtX, cameraManipulation.CamAtY, cameraManipulation.CamAtZ));

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

    if (this.meshList[0] !== undefined)
    {
        var textureMonitor = document.getElementById("textureMonitor");
        var ctx = textureMonitor.getContext('2d');
        ctx.drawImage(this.meshList[0].material.uniforms.tDiffuse.texture.image, 0, 0, 40, 30);
    }
    //renderer.clear();
    //composer.render();
}

if (!init())
{
    animate();
}

