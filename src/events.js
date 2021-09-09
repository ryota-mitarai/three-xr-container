export const event_open = () => {
  return new CustomEvent('xr-container-open');
};

export const event_canvas = (canvas) => {
  return new CustomEvent('xr-container-canvas', { detail: canvas });
};

export const event_camera = (position, rotation) => {
  const data = { pos: position, rot: rotation };
  return new CustomEvent('xr-container-camera', {
    detail: data,
  });
};

export const event_render = () => {
  return new CustomEvent('xr-container-render');
};

export const event_sessionStarted = () => {
  return new CustomEvent('xr-container-sessionStarted');
};

export const event_sessionEnded = () => {
  return new CustomEvent('xr-container-sessionEnded');
};

//xr
export const event_childBuffer = (buffer) => {
  return new CustomEvent('xr-container-childBuffer', { detail: buffer });
};
