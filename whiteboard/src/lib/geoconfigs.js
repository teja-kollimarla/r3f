export const geoConfigs = {
  box: {
    defaults: [1, 1, 1, 1, 1, 1],
    controls: [
      { label: 'Width',           index: 0, min: 0.1, max: 10, step: 0.1 },
      { label: 'Height',          index: 1, min: 0.1, max: 10, step: 0.1 },
      { label: 'Depth',           index: 2, min: 0.1, max: 10, step: 0.1 },
      { label: 'Width Segments',  index: 3, min: 1,   max: 20, step: 1   },
      { label: 'Height Segments', index: 4, min: 1,   max: 20, step: 1   },
      { label: 'Depth Segments',  index: 5, min: 1,   max: 20, step: 1   },
    ],
  },
  sphere: {
    defaults: [1, 32, 32],
    controls: [
      { label: 'Radius',          index: 0, min: 0.1, max: 10, step: 0.1 },
      { label: 'Width Segments',  index: 1, min: 3,   max: 64, step: 1   },
      { label: 'Height Segments', index: 2, min: 2,   max: 64, step: 1   },
    ],
  },
  plane: {
    defaults: [2, 2, 1, 1],
    defaultMeshRotation: [-Math.PI / 2, 0, 0],
    controls: [
      { label: 'Width',           index: 0, min: 0.1, max: 20, step: 0.1 },
      { label: 'Height',          index: 1, min: 0.1, max: 20, step: 0.1 },
      { label: 'Width Segments',  index: 2, min: 1,   max: 20, step: 1   },
      { label: 'Height Segments', index: 3, min: 1,   max: 20, step: 1   },
    ],
  },
  circle: {
    defaults: [1, 32, 0, Math.PI * 2],
    defaultMeshRotation: [-Math.PI / 2, 0, 0],
    controls: [
      { label: 'Radius',          index: 0, min: 0.1, max: 10,  step: 0.1  },
      { label: 'Segments',        index: 1, min: 3,   max: 64,  step: 1    },
      { label: 'Theta Start',     index: 2, min: 0,   max: 6.28, step: 0.01 },
      { label: 'Theta Length',    index: 3, min: 0,   max: 6.28, step: 0.01 },
    ],
  },
  cylinder: {
    defaults: [1, 1, 2, 32, 1, false],
    controls: [
      { label: 'Radius Top',      index: 0, min: 0,   max: 10, step: 0.1 },
      { label: 'Radius Bottom',   index: 1, min: 0,   max: 10, step: 0.1 },
      { label: 'Height',          index: 2, min: 0.1, max: 20, step: 0.1 },
      { label: 'Radial Segments', index: 3, min: 3,   max: 64, step: 1   },
      { label: 'Height Segments', index: 4, min: 1,   max: 20, step: 1   },
    ],
  },
  cone: {
    defaults: [1, 2, 32, 1, false],
    controls: [
      { label: 'Radius',          index: 0, min: 0.1, max: 10, step: 0.1 },
      { label: 'Height',          index: 1, min: 0.1, max: 20, step: 0.1 },
      { label: 'Radial Segments', index: 2, min: 3,   max: 64, step: 1   },
      { label: 'Height Segments', index: 3, min: 1,   max: 20, step: 1   },
    ],
  },
  torus: {
    defaults: [1, 0.4, 16, 100],
    controls: [
      { label: 'Radius',           index: 0, min: 0.1,  max: 10,  step: 0.1  },
      { label: 'Tube',             index: 1, min: 0.01, max: 5,   step: 0.01 },
      { label: 'Radial Segments',  index: 2, min: 2,    max: 32,  step: 1    },
      { label: 'Tubular Segments', index: 3, min: 3,    max: 200, step: 1    },
      { label: 'Arc',              index: 4, min: 0.1,  max: 6.28, step: 0.01 },
    ],
  },
  torusKnot: {
    defaults: [1, 0.4, 100, 16, 2, 3],
    controls: [
      { label: 'Radius',           index: 0, min: 0.1,  max: 10,  step: 0.1  },
      { label: 'Tube',             index: 1, min: 0.01, max: 5,   step: 0.01 },
      { label: 'Tubular Segments', index: 2, min: 10,   max: 300, step: 1    },
      { label: 'Radial Segments',  index: 3, min: 3,    max: 32,  step: 1    },
      { label: 'P',                index: 4, min: 1,    max: 20,  step: 1    },
      { label: 'Q',                index: 5, min: 1,    max: 20,  step: 1    },
    ],
  },
  dodecahedron: {
    defaults: [1, 0],
    controls: [
      { label: 'Radius', index: 0, min: 0.1, max: 10, step: 0.1 },
      { label: 'Detail', index: 1, min: 0,   max: 5,  step: 1   },
    ],
  },
  icosahedron: {
    defaults: [1, 0],
    controls: [
      { label: 'Radius', index: 0, min: 0.1, max: 10, step: 0.1 },
      { label: 'Detail', index: 1, min: 0,   max: 5,  step: 1   },
    ],
  },
  octahedron: {
    defaults: [1, 0],
    controls: [
      { label: 'Radius', index: 0, min: 0.1, max: 10, step: 0.1 },
      { label: 'Detail', index: 1, min: 0,   max: 5,  step: 1   },
    ],
  },
  tetrahedron: {
    defaults: [1, 0],
    controls: [
      { label: 'Radius', index: 0, min: 0.1, max: 10, step: 0.1 },
      { label: 'Detail', index: 1, min: 0,   max: 5,  step: 1   },
    ],
  },
}