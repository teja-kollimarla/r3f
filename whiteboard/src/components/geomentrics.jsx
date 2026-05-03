function Shape({ type }) {
  const item = geometries[type];
  if (!item) return null;

  const Geometry = item.geometry;

  const defaultArgs = {
    box: [1, 1, 1],
    sphere: [1, 32, 32],
    plane: [2, 2],
  };

  return (
    <mesh>
      <Geometry args={defaultArgs[type] || [1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

export default Shape;