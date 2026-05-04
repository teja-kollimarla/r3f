import { useState } from 'react'
import useStore from '../store/useStore'
import { geometries } from '../lib/geometrics'
import Section from './ui/selection'
import LightingPanel from './LightingPannel'
import Toggle from './ui/toggle'

function LabelsPanel() {
  const objects         = useStore((s) => s.objects)
  const labels          = useStore((s) => s.labels)
  const selectedLabelId = useStore((s) => s.selectedLabelId)
  const addLabel        = useStore((s) => s.addLabel)
  const removeLabel     = useStore((s) => s.removeLabel)
  const updateLabel     = useStore((s) => s.updateLabel)
  const selectLabel     = useStore((s) => s.selectLabel)

  const [targetId, setTargetId] = useState('')

  const handleAdd = () => {
    const tid = targetId !== '' ? parseInt(targetId) : null
    addLabel(tid)
    setTargetId('')
  }

  return (
    <Section title="Labels">
      <div className="flex flex-col gap-1.5">
        <select
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          className="text-[10px] text-gray-600 bg-gray-100 rounded px-1.5 py-1 border border-gray-200 w-full"
        >
          <option value="">No target (free)</option>
          {objects.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          className="text-[10px] bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded font-medium transition-colors"
        >
          + Add Label
        </button>
      </div>

      {labels.length > 0 && (
        <div className="flex flex-col gap-1 mt-1">
          {labels.map((label) => {
            const isSelected = label.id === selectedLabelId
            return (
              <div
                key={label.id}
                onClick={() => selectLabel(label.id)}
                className={`flex flex-col gap-1 p-1.5 rounded cursor-pointer border transition-colors
                  ${isSelected ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-gray-50 hover:border-gray-300'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-gray-600 truncate">{label.text}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeLabel(label.id) }}
                    className="text-[9px] text-gray-400 hover:text-red-500 font-bold ml-1"
                  >
                    ✕
                  </button>
                </div>

                {isSelected && (
                  <div className="flex flex-col gap-1 mt-0.5">
                    <input
                      type="text"
                      value={label.text}
                      onChange={(e) => updateLabel(label.id, 'text', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Label text"
                      className="text-[10px] border border-gray-200 rounded px-1.5 py-0.5 w-full bg-white outline-none focus:border-blue-400"
                    />
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-gray-400 w-10">BG</span>
                      <input type="color" value={label.bgColor}
                        onChange={(e) => updateLabel(label.id, 'bgColor', e.target.value)}
                        className="w-6 h-5 rounded cursor-pointer border border-gray-200" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-gray-400 w-10">Text</span>
                      <input type="color" value={label.textColor}
                        onChange={(e) => updateLabel(label.id, 'textColor', e.target.value)}
                        className="w-6 h-5 rounded cursor-pointer border border-gray-200" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-gray-400 w-10">Line</span>
                      <input type="color" value={label.lineColor}
                        onChange={(e) => updateLabel(label.id, 'lineColor', e.target.value)}
                        className="w-6 h-5 rounded cursor-pointer border border-gray-200" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-gray-400">Font size</span>
                      <span className="text-[9px] text-blue-500 font-mono">{label.fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={8} max={32} step={1}
                      value={label.fontSize}
                      onChange={(e) => updateLabel(label.id, 'fontSize', parseInt(e.target.value))}
                      className="w-full accent-blue-500 h-1"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Section>
  )
}

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
                  className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer text-xs font-medium transition-colors
                    ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  onClick={() => selectObject(obj.id)}
                >
                  <span className="capitalize truncate">{obj.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeObject(obj.id) }}
                    className="ml-1 w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-bold transition-colors bg-white/20 hover:bg-red-500 text-white"
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      <LabelsPanel />

      <LightingPanel />

    </div>
  )
}

export default LeftPanel