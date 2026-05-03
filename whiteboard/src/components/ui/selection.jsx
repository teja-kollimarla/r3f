function Section({ title, children }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{title}</p>
      {children}
    </div>
  )
}

export default Section