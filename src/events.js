export const event_open = () => {
  return new CustomEvent('xr-container-open');
};

export const event_camera = (position, rotation) => {
  const data = { pos: position, rot: rotation };
  return new CustomEvent('xr-container-camera', {
    detail: data,
  });
};

//xr
export const event_sessionStarted = () => {
  return new CustomEvent('xr-container-sessionStarted');
};

export const event_sessionEnded = () => {
  return new CustomEvent('xr-container-sessionEnded');
};

export const event_childBuffer = (buffer) => {
  return new CustomEvent('xr-container-childBuffer', { detail: buffer });
};

export const event_animationFrame = (time, frame) => {
  const data = { time, frame };
  return new CustomEvent('xr-container-animationFrame', { detail: data });
};

export const event_resolution = (x, y) => {
  const data = { x, y };
  return new CustomEvent('xr-container-resolution', { detail: data });
};
