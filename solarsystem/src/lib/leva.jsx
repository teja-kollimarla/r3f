import { useControls } from "leva";
import useSelected from "./zustand";

const defaultConfig = {
  speed: { value: 0.005, min: 0, max: 0.05, step: 0.001 },
  size: { value: 1, min: 0.1, max: 50, step: 0.1 },
  color: "#ffffff",
};

const useLeva = (name, config) => {
  const { selected } = useSelected();
  const isSelected = selected === name;

  const mergedConfig = { ...defaultConfig, ...config };

  // 🔥 ONLY create controls when selected
  const values = useControls(
    isSelected ? name : `${name}-hidden`,
    isSelected ? mergedConfig : {}
  );

  return isSelected ? values : {};
};

export default useLeva;