import useStore from '../store/useStore'
import { geometries } from '../lib/geometrics'
import Section from './ui/selection'
import LightingPanel from './LightingPannel'

function LeftPanel() {
  const selectedGeometry   = useStore((s) => s.selectedGeometry)
  const transformMode      = useStore((s) => s.transformMode)
  const selectGeometry     = useStore((s) => s.selectGeometry)
  const setTransformMode   = useStore((s) => s.setTransformMode)
  const backgroundColor    = useStore((s) => s.backgroundColor)
  const setBackgroundColor = useStore((s) => s.setBackgroundColor)

  return (
    <div className="flex-[0_0_180px] border-r border-gray-200 p-3 overflow-y-auto overflow-x-hidden flex flex-col gap-4">

      {/* ── Scene Background ───────────────────── */}
      <Section title="Scene">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="w-7 h-7 rounded cursor-pointer border border-gray-200"
          />
          <span className="text-[10px] text-gray-500">Background</span>
          <span className="text-[10px] font-mono text-blue-500 ml-auto">{backgroundColor}</span>
        </div>
      </Section>

      {/* ── Transform ──────────────────────────── */}
      <Section title="Transform">
        <div className="flex flex-col gap-1">
          {[
            { key: 'translate', label: '↔ Move'  },
            { key: 'rotate',    label: '↻ Rotate' },
            { key: 'scale',     label: '⤡ Scale'  },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => setTransformMode(m.key)}
              className={`text-xs py-1.5 px-2 rounded font-medium transition-colors text-left
                ${transformMode === m.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </Section>

      {/* ── Geometries ─────────────────────────── */}
      <Section title="Geometries">
        <div className="grid grid-cols-3 gap-1.5 w-full">
          {Object.entries(geometries).map(([key, item]) => {
            const Icon = item.icon
            const isSelected = selectedGeometry === key
            return (
              <div
                key={key}
                onClick={() => selectGeometry(key)}
                className={`flex flex-col items-center justify-start gap-1 p-1.5 rounded cursor-pointer transition-colors
                  ${isSelected
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <div className="icon-wrapper"><Icon /></div>
                <span className="text-[9px] text-center w-full truncate leading-tight">{item.name}</span>
              </div>
            )
          })}
        </div>
      </Section>

      <LightingPanel />

    </div>
  )
}

export default LeftPanel