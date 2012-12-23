uniform sampler2D tDiffuse;
uniform float brightness;
uniform bool active;
varying vec2 vUv;

void main() {
    vec4 color = texture2D(tDiffuse, vUv);

    if (active) {
        color.rgb += brightness;
    }

    gl_FragColor = color;
}
