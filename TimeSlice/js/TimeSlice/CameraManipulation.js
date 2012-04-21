var TimeSlice = TimeSlice || {};

TimeSlice.CameraManipulation = function ( CamPosX, CamPosY, CamPosZ, CamRotX, CamRotY, CamRotZ, CamAtX, CamAtY, CamAtZ,
CamPosXElName, CamPosYElName, CamPosZElName, CamRotXElName, CamRotYElName, CamRotZElName, CamAtXElName, CamAtYElName, CamAtZElName)
{
    this.CamPosXEl = document.getElementById( CamPosXElName );
    this.CamPosYEl = document.getElementById( CamPosYElName );
    this.CamPosZEl = document.getElementById( CamPosZElName );
    this.CamRotXEl = document.getElementById( CamRotXElName );
    this.CamRotYEl = document.getElementById( CamRotYElName );
    this.CamRotZEl = document.getElementById( CamRotZElName );
    this.CamAtXEl = document.getElementById( CamAtXElName );
    this.CamAtYEl = document.getElementById( CamAtYElName );
    this.CamAtZEl = document.getElementById( CamAtZElName );

    this.CamPosXEl.value = this.CamPosX = CamPosX;
    this.CamPosYEl.value = this.CamPosY = CamPosY;
    this.CamPosZEl.value = this.CamPosZ = CamPosZ;
    this.CamRotXEl.value = this.CamRotX = CamRotX;
    this.CamRotYEl.value = this.CamRotY = CamRotY;
    this.CamRotZEl.value = this.CamRotZ = CamRotZ;
    this.CamAtXEl.value = this.CamAtX = CamAtX;
    this.CamAtYEl.value = this.CamAtY = CamAtY;
    this.CamAtZEl.value = this.CamAtZ = CamAtZ;

    this.initializeControls();
};

TimeSlice.CameraManipulation.prototype = {

    CamPosX: 0,
    CamPosY: 0,
    CamPosZ: 0,
    CamRotX: 0,
    CamRotY: 0,
    CamRotZ: 0,
    CamAtX: 0,
    CamAtY: 0,
    CamAtZ: 0,

    CamPosXEl: null,
    CamPosYEl: null,
    CamPosZEl: null,
    CamRotXEl: null,
    CamRotYEl: null,
    CamRotZEl: null,
    CamAtXEl: null,
    CamAtYEl: null,
    CamAtZEl: null,

    setCamPosX: function ( newValue )
    {
        this.CamPosXEl.value = this.CamPosX = newValue;
    },

    setCamPosY: function ( newValue )
    {
        this.CamPosYEl.value = this.CamPosY = newValue;
    },

    setCamPosZ: function ( newValue )
    {
        this.CamPosZEl.value = this.CamPosZ = newValue;
    },

    setCamRotX: function ( newValue )
    {
        this.CamRotXEl.value = this.CamRotX = newValue;
    },

    setCamRotY: function ( newValue )
    {
        this.CamRotYEl.value = this.CamRotY = newValue;
    },

    setCamRotZ: function ( newValue )
    {
        this.CamRotZEl.value = this.CamRotZ = newValue;
    },

    setCamAtX: function ( newValue )
    {
        this.CamAtXEl.value = this.CamAtX = newValue;
    },

    setCamAtY: function ( newValue )
    {
        this.CamAtYEl.value = this.CamAtY = newValue;
    },

    setCamAtZ: function ( newValue )
    {
        this.CamAtZEl.value = this.CamAtZ = newValue;
    },

    initializeControls: function ()
    {
        var _this = this;

        $( "#CamPosX" ).change( function ( eventObject )
        {
            _this.setCamPosX( eventObject.srcElement.valueAsNumber );
        } );

        $( "#CamPosY" ).change( function ( eventObject )
        {
            _this.setCamPosY( eventObject.srcElement.valueAsNumber );
        } );

        $( "#CamPosZ" ).change( function ( eventObject )
        {
            _this.setCamPosZ( eventObject.srcElement.valueAsNumber );
        } );

        $( "#CamRotX" ).change( function ( eventObject )
        {
            _this.setCamRotX( eventObject.srcElement.valueAsNumber );
        } );

        $( "#CamRotY" ).change( function ( eventObject )
        {
            _this.setCamRotY( eventObject.srcElement.valueAsNumber );
        } );

        $( "#CamRotZ" ).change( function ( eventObject )
        {
            _this.setCamRotZ( eventObject.srcElement.valueAsNumber );
        } );

        $( "#CamAtX" ).change( function ( eventObject )
        {
            _this.setCamAtX( eventObject.srcElement.valueAsNumber );
        } );

        $( "#CamAtY" ).change( function ( eventObject )
        {
            _this.setCamAtY( eventObject.srcElement.valueAsNumber );
        } );

        $( "#CamAtZ" ).change( function ( eventObject )
        {
            _this.setCamAtZ( eventObject.srcElement.valueAsNumber );
        } );
    }
};
