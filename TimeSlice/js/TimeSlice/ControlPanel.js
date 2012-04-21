var TimeSlice = TimeSlice || {};

TimeSlice.ControlPanel = function ( cameraManipulation, frameManipulation )
{
    this.CameraManipulation = cameraManipulation;
    this.FrameManipulation = frameManipulation;

    this.initializeControls();
};

TimeSlice.ControlPanel.prototype = {

    CameraManipulation: null,
    FrameManipulation: null,

    initializeControls: function ()
    {
        var _this = this;
        $( "#ControlPanel fieldset" ).on( "click", ".toggleButton", function ( ev )
        {
            $( this ).toggleClass( "collapsed" );
            $( ev.originalEvent.currentTarget ).find( ".controls" ).toggleClass( "hide" );
        } );
    }
};
