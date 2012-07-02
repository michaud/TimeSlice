/// <reference path="TimeSlice.js" />
//use some https://github.com/evanw/glfx.js
TimeSlice.ShaderExtras = {
    'sepia': {

        uniforms: {
            tDiffuse: { type: "t", value: 0, texture: null },
            amount: { type: "f", value: 1.0 }
        },

        vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = vec2( uv.x, 1.0 - uv.y );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

        fragmentShader: [

			"uniform float amount;",

			"uniform sampler2D tDiffuse;",

			"varying vec2 vUv;",

			"void main() {",

				"vec4 color = texture2D( tDiffuse, vUv );",
				"gl_FragColor = vec4( color.r, color.g, color.b , color.a * amount);",

			"}"

		].join("\n")

    },
    'brightness': {
        uniforms:
        {
            tDiffuse: { type: "t", value: 0, texture: null },
            active: { type: "i", value: false },
            brightness: { type: "f", value: 1.0 }
        },

        vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = vec2( uv.x, 1.0 - uv.y );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

        fragmentShader: [

        "uniform sampler2D tDiffuse;",
        "uniform float brightness;",
        "uniform bool active;",
        "varying vec2 vUv;",

        "void main() {",
            "vec4 color = texture2D(tDiffuse, vUv);",

            "if (active) {",
                "color.rgb += brightness;",
            "}",

            "gl_FragColor = color;",
        "}"
		].join("\n")
    },
    'contrast': {
        uniforms:
        {
            tDiffuse: { type: "t", value: 0, texture: null },
            active: { type: "i", value: false },
            contrast: { type: "f", value: 1.0 },
            center: { type: "f", value: 1.0 },
            uncenter: { type: "f", value: 1.0 }
        },

        vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = vec2( uv.x, 1.0 - uv.y );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

        ].join("\n"),

        fragmentShader: [

        "uniform sampler2D tDiffuse;",
        "uniform float contrast;",
        "uniform float center;",
        "uniform float uncenter;",
        "uniform bool active;",
        "varying vec2 vUv;",

        "void main() {",
            "vec4 color = texture2D(tDiffuse, vUv);",

            "if (active) {",
                    "color.rgb -= center;",
                    //Adjusts by Contrast_Value//[-127.5, 127.5], usually [-1, 1]
                    //New_Value *= Contrast_Value
                    "color.rgb *= contrast;",
                    //Re-add .5 (un-center over 0)//[-127, 128]
                    //New_Value += 0.5
                    "color.rgb += uncenter;",
            "}",
            "gl_FragColor = color;",
        "}"
        ].join("\n")
    },
    'grayscale': {

        uniforms: {

            tDiffuse: { type: "t", value: 0, texture: null },
            active: { type: "i", value: false }

        },

        vertexShader: [

			"varying vec2 vUv;",

			"void main() {",
				"vUv = vec2( uv.x, 1.0 - uv.y );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
			"}"

		].join("\n"),

        fragmentShader: [

        "uniform sampler2D tDiffuse;",
        "uniform bool active;",
        "varying vec2 vUv;",

        "void main() {",
            "vec4 color = texture2D(tDiffuse, vUv);",
            "if (active) {",
                "color.r = color.g = color.b;",
            "}",
            "gl_FragColor = color;",
        "}"
		].join("\n")
    },

    'huesaturation': {

        uniforms: {

            tDiffuse: { type: "t", value: 0, texture: null },
            hue: { type: "f", value: 0.0 },
            saturation: { type: "f", value: 0.0 },
            active: { type: "i", value: false }

        },

        vertexShader: [

			"varying vec2 vUv;",

			"void main() {",
				"vUv = vec2( uv.x, 1.0 - uv.y );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
			"}"

		].join("\n"),

        fragmentShader: [
            "uniform sampler2D tDiffuse;",
            "uniform float hue;",
            "uniform float saturation;",
            "uniform bool active;",

            "varying vec2 vUv;",

            "void main() {",

                "vec4 color = texture2D(tDiffuse, vUv);",

                "if (active) {",

                    "/* hue adjustment, wolfram alpha: RotationTransform[angle, {1, 1, 1}][{x, y, z}] */",
                    "float angle = hue * 3.14159265;",
                    "float s = sin(angle), c = cos(angle);",
                    "vec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c) + 1.0) / 3.0;",
                    "float len = length(color.rgb);",

                    "color.rgb = vec3(",
                        "dot(color.rgb, weights.xyz),",
                        "dot(color.rgb, weights.zxy),",
                        "dot(color.rgb, weights.yzx)",
                    ");",

                    "/* saturation adjustment */",
                    "float average = (color.r + color.g + color.b) / 3.0;",

                    "if (saturation > 0.0) {",
                        "color.rgb += (average - color.rgb) * (1.0 - 1.0 / (1.001 - saturation));",
                    "} else {",
                        "color.rgb += (average - color.rgb) * (-saturation);",
                    "}",
                "}",

                "gl_FragColor = color;",

            "}"].join("\n")
    },

    'triangleBlur': {

        uniforms: {

            tDiffuse: { type: "t", value: 0, texture: null },
            delta1: { type: "f", value: 0.01 },
            delta2: { type: "f", value: 0.01 },
            active: { type: "i", value: false }
        },

        vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = vec2( uv.x, 1.0 - uv.y );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

        fragmentShader: [

		"#define ITERATIONS 10.0",

		"uniform sampler2D tDiffuse;",
		"uniform float delta1;",
		"uniform float delta2;",
        "uniform bool active;",

		"varying vec2 vUv;",

		"float random( vec3 scale, float seed ) {",

        // use the fragment position for a different seed per-pixel

			"return fract( sin( dot( gl_FragCoord.xyz + seed, scale ) ) * 43758.5453 + seed );",

		"}",

		"void main() {",

            "vec4 basecolor = texture2D(tDiffuse, vUv);",

            "if (active) {",
                "vec4 color = vec4( 0.0 );",

                "float total = 0.0;",

        // randomize the lookup values to hide the fixed number of samples

                "float offset = random( vec3( 12.9898, 78.233, 151.7182 ), 0.0 );",

                "for ( float t = -ITERATIONS; t <= ITERATIONS; t ++ ) {",

                    "float percent = ( t + offset - 0.5 ) / ITERATIONS;",
                    "float weight = 1.0 - abs( percent );",

                    "color += texture2D( tDiffuse, vUv + vec2(delta1,delta2) * percent ) * weight;",
                    "total += weight;",

                "}",

                "gl_FragColor = color / total;",
            "} else {",

                "gl_FragColor = basecolor;",
            "}",
		"}"

		].join("\n")
    },

    'invert': {

        uniforms: {

            tDiffuse: { type: "t", value: 0, texture: null },
            active: { type: "i", value: false }

        },

        vertexShader: [

			"varying vec2 vUv;",

			"void main() {",
				"vUv = vec2( uv.x, 1.0 - uv.y );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
			"}"

		].join("\n"),

        fragmentShader: [

        "uniform sampler2D tDiffuse;",
        "uniform bool active;",
        "varying vec2 vUv;",

        "void main() {",
            "vec4 color = texture2D(tDiffuse, vUv);",
            "if (active) {",
                "color.r = 1.0 - color.r;",
                "color.g = 1.0 - color.g;",
                "color.b = 1.0 - color.b;",
            "}",
            "gl_FragColor = color;",
        "}"
		].join("\n")
    },
    'slice': {

        uniforms: {
            tDiffuse: { type: "t", value: 0, texture: null },
            tSlice: { type: "t", value: 1, texture: null },
            active: { type: "i", value: true },
            zindex: { type: "i", value: 0 },
            frameCount: { type: "i", value: 0 },
            frameWidth: { type: "i", value: 0 },
            frameHeight: { type: "i", value: 0 },
            frameopacity: { type: "f", value: 0.01 },
            sliceopacity: { type: "f", value: 1.0 }
        },

        vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = vec2( uv.x, 1.0 - uv.y );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

        fragmentShader: [

            "uniform sampler2D tDiffuse;",
            "uniform sampler2D tSlice;",
            "uniform bool active;",
            "uniform int zindex;",
            "uniform int frameCount;",
            "uniform int frameWidth;",
            "uniform int frameHeight;",
            "uniform float frameopacity;",
            "uniform float sliceopacity;",
            "varying vec2 vUv;",

			"void main() {",

                "vec4 color = texture2D(tDiffuse, vUv);",
                "vec4 scolor = texture2D(tSlice, vUv);",

                "if (active) {",

                    "int targetDepth = int(scolor.r * float(255));",

                    "if(targetDepth == zindex)",
                    "{",
                        "color.a = sliceopacity;",
                    "} else {",
                        "color.a = frameopacity;",
                    "}",
                "}",

				"gl_FragColor = color;",

			"}"

		].join("\n")

    },
    'coloralpha': {

        uniforms: {

            tDiffuse: { type: "t", value: 0, texture: null },
            active: { type: "i", value: false },
            invert: { type: "i", value: false },
            coloralpha: { type: "v3", value: new THREE.Vector3(0.0, 0.0, 0.0) },
            range: {type: "f", value: 0.1}


        },

        vertexShader: [

			"varying vec2 vUv;",

			"void main() {",
				"vUv = vec2( uv.x, 1.0 - uv.y );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
			"}"

        ].join("\n"),

        fragmentShader: [

        "uniform sampler2D tDiffuse;",
        "uniform bool active;",
        "uniform bool invert;",
        "uniform vec3 coloralpha;",
        "uniform float range;",
        "varying vec2 vUv;",

        "void main() {",
            "vec4 color = texture2D(tDiffuse, vUv);",
            "if (active) {",
                "if(",
                    "(color.r > coloralpha.x - range &&  color.r < coloralpha.x + range) && ",
                    "(color.g > coloralpha.y - range &&  color.g < coloralpha.y + range) && ",
                    "(color.b > coloralpha.z - range &&  color.b < coloralpha.z + range)",
                ")",
                "{",
                    "if(invert)",
                    "{",
                        "color.a = 1.0;",
                    "}",
                    "else",
                    "{",
                        "color.a = 0.0;",
                    "}",
                "}",
                "else",
                "{",
                    "if(!invert)",
                    "{",
                        "color.a = 1.0;",
                    "}",
                    "else",
                    "{",
                        "color.a = 0.0;",
                    "}",
                "}",
            "}",
            "gl_FragColor = color;",
        "}"
        ].join("\n")
    },

};