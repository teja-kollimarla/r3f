import { create } from "zustand";

const useSelected = create((set) => ({
  // 🔹 current selected object
  selected: null,          // "Sun"
  selectedRef: null,       // ref to mesh (optional for future)

  // 🔹 set selected object
  setSelected: (name, ref = null) =>
    set({
      selected: name,
      selectedRef: ref,
    }),

  // 🔹 clear selection
  clearSelected: () =>
    set({
      selected: null,
      selectedRef: null,
    }),
}));

export default useSelected;