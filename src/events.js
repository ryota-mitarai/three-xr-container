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
