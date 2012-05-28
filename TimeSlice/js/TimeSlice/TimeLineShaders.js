/// <reference path="TimeSlice.js" />
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
    'brightnesscontrast': {

        uniforms: {

            tDiffuse: { type: "t", value: 0, texture: null },
            brightness: { type: "f", value: 1.0 },
            contrast: { type: "f", value: 1.0 },
            transparent: { type: "i", value: true},
            transparency: { type: "f", value: 1.0 },
            borw: { type: "i", value: false }
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
        "uniform float contrast;",
        "uniform float transparency;",
        "uniform bool transparent;",
        "uniform bool borw;",
        "varying vec2 vUv;",

        "void main() {",
            "vec4 color = texture2D(tDiffuse, vUv);",
            "color.rgb += brightness;",
            "if (contrast > 0.0) {",
                "color.rgb = (color.rgb - 0.5) / (1.0 - contrast) + 0.5;",
            "} else {",
                "color.rgb = (color.rgb - 0.5) * (1.0 + contrast) + 0.5;",
            "}",
            "if(transparent)",
            "{",
                "if(borw)",
                "{",
                    "if(color.r < 0.3 && color.g < 0.3 && color.b < 0.3)",
                    "{",
                        "color.a = transparency;",
                    "}",
                "} else {",
                    "if(color.r > 0.8 && color.g > 0.8 && color.b > 0.8)",
                    "{",
                        "color.a = transparency;",
                    "}",
                "}",
            "}",
            "gl_FragColor = color;",
        "}"
		].join("\n")

    }

};