export const fragmentShader = `
precision mediump float;

uniform vec2 u_resolution;
uniform sampler2D u_texture;

void main()
{
    vec2 pos = gl_FragCoord.xy/u_resolution.xy;
    gl_FragColor = texture2D(u_texture, pos);
}
`;
export const fragmentShaderVR = `
precision mediump float;

uniform vec2 u_resolution;
uniform sampler2D u_ltexture;
uniform sampler2D u_rtexture;

void main()
{
    vec2 pos = gl_FragCoord.xy/u_resolution.xy;
    if (gl_FragCoord.x > (u_resolution.x / 2.0)) {
        pos.x = pos.x - 0.5;
        gl_FragColor = texture2D(u_rtexture, pos);
    } else {
        gl_FragColor = texture2D(u_ltexture, pos);
    }
}
`;

export const vertexShader = `
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;
