import { create } from "zustand";

const useSelected = create((set) => ({
  selected: null,
  setSelected: (name,ref) => set({ selected: name,ref:ref }),
}));

export default useSelected;