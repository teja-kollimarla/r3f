function Slider({ label, value, min, max, step, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between">
        <span className="text-[10px] text-gray-500">{label}</span>
        <span className="text-[10px] text-blue-500 font-mono">
          {Number(value).toFixed(step < 1 ? 2 : 0)}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value))}
        className="w-full accent-blue-500 h-1"
      />
    </div>
  )
}

export default Slider