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

export const vertexShader = `
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;
