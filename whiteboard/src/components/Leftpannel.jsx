import useStore from '../store/useStore'
import { geometries } from '../lib/geometrics'
import Section from './ui/selection'
import LightingPanel from './LightingPannel'
import Toggle from './ui/toggle'

function LeftPanel() {
  const objects            = useStore((s) => s.objects)
  const selectedId         = useStore((s) => s.selectedId)
  const addObject          = useStore((s) => s.addObject)
  const removeObject       = useStore((s) => s.removeObject)
  const selectObject       = useStore((s) => s.selectObject)
  const transformMode      = useStore((s) => s.transformMode)
  const showTransform      = useStore((s) => s.showTransform)
  const setTransformMode   = useStore((s) => s.setTransformMode)
  const setShowTransform   = useStore((s) => s.setShowTransform)
  const backgroundColor    = useStore((s) => s.backgroundColor)
  const setBackgroundColor = useStore((s) => s.setBackgroundColor)

  return (
    <div className="flex-[0_0_180px] border-r border-gray-200 p-3 overflow-y-auto overflow-x-hidden flex flex-col gap-4">

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

      <Section title="Transform">
        <Toggle
          label={`Gizmo ${showTransform ? 'On' : 'Off'}`}
          value={showTransform}
          onChange={setShowTransform}
        />
        <div className="flex flex-col gap-1">
          {[
            { key: 'translate', label: '↔ Move'  },
            { key: 'rotate',    label: '↻ Rotate' },
            { key: 'scale',     label: '⤡ Scale'  },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => showTransform && setTransformMode(m.key)}
              className={`text-xs py-1.5 px-2 rounded font-medium transition-colors text-left
                ${!showTransform
                  ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                  : transformMode === m.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Geometries">
        <p className="text-[9px] text-gray-400">Click to add to scene</p>
        <div className="grid grid-cols-3 gap-1.5 w-full">
          {Object.entries(geometries).map(([key, item]) => {
            const Icon = item.icon
            return (
              <div
                key={key}
                onClick={() => addObject(key)}
                className="flex flex-col items-center justify-start gap-1 p-1.5 rounded cursor-pointer transition-colors bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600 active:scale-95"
              >
                <div className="icon-wrapper"><Icon /></div>
                <span className="text-[9px] text-center w-full truncate leading-tight">{item.name}</span>
              </div>
            )
          })}
        </div>
      </Section>

      {objects.length > 0 && (
        <Section title="Objects">
          <div className="flex flex-col gap-1">
            {objects.map((obj) => {
              const isSelected = obj.id === selectedId
              return (
                <div
                  key={obj.id}
                  onClick={() => selectObject(obj.id)}
                  className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer text-xs font-medium transition-colors
                    ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <span className="truncate">{obj.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeObject(obj.id) }}
                    className={`ml-1 text-[10px] font-bold transition-colors flex-shrink-0
                      ${isSelected ? 'text-white hover:text-red-200' : 'text-gray-400 hover:text-red-500'}`}
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      <LightingPanel />

    </div>
  )
}

export default LeftPanel