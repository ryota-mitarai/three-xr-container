export const fragmentShader = `
precision mediump float;

uniform sampler2D colorMap;
varying vec2 vTexCoords;

void main()
{
    gl_FragColor = texture2D(colorMap, vTexCoords);
}
`;

export const vertexShader = `
precision lowp float;

attribute vec2 vertexPositionNDC;
varying vec2 vTexCoords;

void main()
{
    gl_Position = vec4(vertexPositionNDC, 0.0, 1.0);
}
`;

export const bruhShader = `
precision lowp float;

// xy = vertex position in normalized device coordinates ([-1,+1] range).
attribute vec2 vertexPositionNDC;

varying vec2 vTexCoords;

const vec2 scale = vec2(0.5, 0.5);

void main()
{
    vTexCoords  = vertexPositionNDC * scale + scale; // scale vertex attribute to [0,1] range
    gl_Position = vec4(vertexPositionNDC, 0.0, 1.0);
}
`;
