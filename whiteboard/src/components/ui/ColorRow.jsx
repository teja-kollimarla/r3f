function ColorRow({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-7 h-7 rounded cursor-pointer border border-gray-200"
      />
      <span className="text-[10px] text-gray-500">{label}</span>
      <span className="text-[10px] font-mono text-blue-500 ml-auto">{value}</span>
    </div>
  )
}

export default ColorRow