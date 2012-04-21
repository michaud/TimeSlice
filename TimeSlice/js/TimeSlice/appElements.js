/// <reference path="../../vendor/three.js/Three.js" />
// add Stats.js - https://github.com/mrdoob/stats.js
function addStats()
{
    // add Stats.js - https://github.com/mrdoob/stats.js
    var stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '0px';
    document.body.appendChild( stats.domElement );
    return stats;
}

function getRenderer()
{
    var newRenderer;

    if ( Detector.webgl )
    {
        newRenderer = new THREE.WebGLRenderer( {
            antialias: true, // to get smoother output
            preserveDrawingBuffer: true	// to allow screenshot
        } );
    }
    else
    {
        newRenderer = new THREE.CanvasRenderer();
    }

    newRenderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementById( 'container' ).appendChild( newRenderer.domElement );
    
    return newRenderer;
}

function createScene()
{
    // create a scene
    var newScene = new THREE.Scene();

    return newScene;
}

function initScreenControl( arenderer, acamera )
{
    // transparently support window resize
    THREEx.WindowResize.bind( arenderer, acamera );
    // allow 'p' to make screenshot
    THREEx.Screenshot.bindKey( arenderer );
    // allow 'f' to go fullscreen where this feature is supported
    if ( THREEx.FullScreen.available() )
    {
        THREEx.FullScreen.bindKey();
        document.getElementById( 'inlineDoc' ).innerHTML += "- <i>f</i> for fullscreen";
    }
}

function initLight( ascene )
{
    // here you add your objects
    // - you will most likely replace this part by your own
    var light = new THREE.DirectionalLight( Math.random() * 0xffffff );
    light.position.set( Math.random(), Math.random(), Math.random() ).normalize();
    ascene.add( light );
    light = new THREE.DirectionalLight( Math.random() * 0xffffff );
    light.position.set( Math.random(), Math.random(), Math.random() ).normalize();
    ascene.add( light );
    light = new THREE.PointLight( Math.random() * 0xffffff );
    light.position.set( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 ).normalize().multiplyScalar( 1.2 );
    ascene.add( light );
    light = new THREE.PointLight( Math.random() * 0xffffff );
    light.position.set( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 ).normalize().multiplyScalar( 1.2 );
    ascene.add( light );
}

function createCamera( ascene, initCamPosX, initCamPosY, initCamPosZ, initCamAtX, initCamAtY, initCamAtZ )
{
    // put a camera in the scene
    var newCamera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 5000 );
    newCamera.position.set( initCamPosX, initCamPosY, initCamPosZ );
    newCamera.lookAt( new THREE.Vector3( initCamAtX, initCamAtY, initCamAtZ ) );
    ascene.add( newCamera );

    // create a camera contol
    //cameraControls = new THREE.TrackballControls( camera, document.getElementById( "container" ) );

    return newCamera;
}