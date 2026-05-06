// Shared mutable map: object id → THREE.Vector3 world position
// SceneObject writes here every frame; CameraObject/PreviewCamera reads here.
const objectPositions = new Map()
export default objectPositions
