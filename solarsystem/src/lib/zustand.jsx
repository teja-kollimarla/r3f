import { create } from "zustand";

const useSelected = create((set) => ({
  // 🔹 current selected object
  selected: null,          
  selectedRef: null,       // ref to mesh (optional for future)

  // 🔹 set selected object
  setSelected: (name, ref = null) =>
    set({
      selected: name,
      selectedRef: ref,
    }),

  // 🔹 clear selection
  clearSelected: () =>
  set((state) => {
    console.log("Clearing selection", state.selected);
    return {
      selected: null,
      selectedRef: null,
    };
  }),
}));

export default useSelected;