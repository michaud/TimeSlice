var TimeSlice = TimeSlice || {};

TimeSlice.FrameManipulation = function ( frameDistance, frameTransparency, frameDistanceName, frameTransparencyName )
{
    this.FrameDistanceEl = document.getElementById( frameDistanceName );
    this.FrameTransparencyEl = document.getElementById( frameTransparencyName );

    this.FrameDistanceEl.value = this.FrameDistance = frameDistance;
    this.FrameTransparencyEl = this.FrameTransparency = frameTransparency;

    this.initializeControls();
};

TimeSlice.FrameManipulation.prototype = {

    FrameDistance:50,
    FrameTransparency: 1,
    FrameDistanceEl: null,
    FrameTransparencyEl: null,

    setFrameDistance: function ( newValue )
    {
        this.FrameDistanceEl.value = this.FrameDistance = newValue;
    },

    setFrameTransparency: function ( newValue )
    {
        this.FrameTransparencyEl.value = this.FrameTransparency = newValue;
    },

    initializeControls: function ()
    {
        var _this = this;

        $( "#FrameDistance" ).change( function ( eventObject )
        {
            _this.setFrameDistance( eventObject.srcElement.valueAsNumber );
        } );

        $( "#FrameTransparency" ).change( function ( eventObject )
        {
            _this.setFrameTransparency( eventObject.srcElement.valueAsNumber );
        } );
    }
};
