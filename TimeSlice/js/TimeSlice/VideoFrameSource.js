var TimeSlice = TimeSlice || {};

TimeSlice.VideoFrameSource = function ( videoTarget, newFrameCount, newSnapshotTiming, snapshotWidth, snapshotHeight )
{
    console.log( "VideoFramSource" );
    this.video = videoTarget;
    this.frameCount = newFrameCount;
    this.snapshotTiming = newSnapshotTiming;
    this.snapshotWidth = snapshotWidth;
    this.snapshotHeight = snapshotHeight;
    this.init( this.video, newFrameCount, newSnapshotTiming );
    return this;
};

TimeSlice.VideoFrameSource.prototype = {

    constructor: TimeSlice.VideoFramSource,
    video: null,
    snapShotTimerId: null,
    imageList: null,
    snapshotTiming: 500,
    frameCount: 10,
    snapshotWidth: 512,
    snapshotHeight: 256,

    init: function ( videoTarget, newFrameCount, newSnapshotTiming )
    {
        this.imageList = [];
        this.snapshotTiming = newSnapshotTiming !== undefined ? newSnapshotTiming : this.snapshotTiming;
        this.frameCount = newFrameCount !== undefined ? newFrameCount : this.frameCount;
        this.video = videoTarget;

        if ( navigator.webkitGetUserMedia )
        {
            var curVideo = this.video;
            navigator.webkitGetUserMedia({ video: true }, function(stream)
            {
                console.log( "got stream" );
                curVideo.src = webkitURL.createObjectURL( stream );

                curVideo.onerror = function ()
                {
                    console.log( "video.onerror" );
                    stream.stop();
                    console.log( "Camera error" );
                };
            },
            function ()
            {
                console.log( "No camera available" );
            } );

            this.video = document.getElementById( 'monitor' );
            var i = 0;
        }
        else
        {
            console.log( "No native camera support available" );
        }
    },
    getFrames: function ()
    {
        var list = null;
        try
        {
            list = this.imageList.slice();
        }
        catch ( e )
        {
            console.log( "list:" + list );
        }

        return list;
    },
    snapshot: function ()
    {
        if ( this.snapShotTimerId === null )
        {
            var curFrameSource = this;

            var handleTimeOut = function ()
            {
                if ( curFrameSource.video.readyState == curFrameSource.video.HAVE_ENOUGH_DATA )
                {
                    var newSnapShot = document.createElement( 'canvas' );
                    newSnapShot.width = curFrameSource.snapshotWidth;
                    newSnapShot.height = curFrameSource.snapshotHeight;
                    var ctx = newSnapShot.getContext( '2d' );
                    ctx.drawImage( curFrameSource.video, 0, 0, newSnapShot.width, newSnapShot.height );

                    if ( curFrameSource.imageList.length > curFrameSource.frameCount )
                    {
                        curFrameSource.imageList.pop();
                    }

                    var data = newSnapShot.toDataURL( "image/png" );

                    var img = document.createElement( "img" );

                    img.width = newSnapShot.width;
                    img.height = newSnapShot.width;
                    img.src = data;

                    curFrameSource.imageList.unshift( img );
                    curFrameSource.snapShotTimerId = null;
                }
                else
                {
                    curFrameSource.snapShotTimerId = null;
                }
            };

            this.snapShotTimerId = setTimeout( handleTimeOut, this.snapshotTiming );
        }
    }
};