function SedeSelector({ onSedeChange }) {
  const sede = localStorage.getItem("sede_id") || "s1"

  function handleChange(e) {
    localStorage.setItem("sede_id", e.target.value)
    if (onSedeChange) onSedeChange()
  }

  return (
    <select value={sede} onChange={handleChange}
      className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7991e5]/40 focus:border-[#7991e5]/50 transition-all appearance-none cursor-pointer">
      <option value="s1" className="text-on-surface bg-white">Ramiriquí</option>
      <option value="s2" className="text-on-surface bg-white">Tunja</option>
    </select>
  )
}

export default SedeSelector
