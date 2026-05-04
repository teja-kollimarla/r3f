import { useState } from 'react'
import useStore from '../store/useStore'
import { geoConfigs } from '../lib/geoConfigs'
import Section from './ui/selection'
import Slider from './ui/slider'
import Toggle from './ui/toggle'

function RightPanel() {
  const objects          = useStore((s) => s.objects)
  const selectedId       = useStore((s) => s.selectedId)
  const setObjectProp    = useStore((s) => s.setObjectProp)
  const setGeoArg        = useStore((s) => s.setGeoArg)
  const resetObjectProps = useStore((s) => s.resetObjectProps)
  const removeObject     = useStore((s) => s.removeObject)
  const renameObject     = useStore((s) => s.renameObject)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState('')

  const obj = objects.find((o) => o.id === selectedId)
  if (!obj) return null

  const { geometryKey, geoArgs, objectProps, name } = obj
  const { rotation, revolve, meshRotation } = objectProps
  const config = geoConfigs[geometryKey]

  const set = (key) => (value) => setObjectProp(selectedId, key, value)

  const startEdit = () => { setDraft(name); setEditing(true) }
  const commitEdit = () => { renameObject(selectedId, draft.trim() || name); setEditing(false) }
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') setEditing(false)
  }

  return (
    <div className="flex-[0_0_220px] border-l border-gray-200 p-4 overflow-y-auto flex flex-col gap-5 bg-gray-50">

      <div className="flex items-center justify-between gap-2">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            className="flex-1 text-sm font-semibold text-gray-700 border-b border-blue-400 bg-transparent outline-none"
          />
        ) : (
          <p
            title="Click to rename"
            onClick={startEdit}
            className="flex-1 text-sm font-semibold text-gray-700 cursor-text truncate hover:text-blue-500 transition-colors"
          >
            {name}
          </p>
        )}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => resetObjectProps(selectedId)} className="text-[10px] text-gray-400 hover:text-gray-600">Reset</button>
          <button onClick={() => removeObject(selectedId)} className="text-[10px] bg-red-100 hover:bg-red-500 text-red-500 hover:text-white px-2 py-0.5 rounded transition-colors font-medium">Delete</button>
        </div>
      </div>

      <Section title="Color">
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={objectProps.color}
            onChange={(e) => setObjectProp(selectedId, 'color', e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-gray-200"
          />
          <span className="text-xs text-gray-600 font-mono">{objectProps.color}</span>
        </div>
      </Section>

      <Section title="Scale">
        <Slider label="Uniform Scale" value={objectProps.scale} min={0.1} max={5} step={0.1} onChange={set('scale')} />
      </Section>

      <Section title="Display">
        <Toggle
          label={`Wireframe ${objectProps.wireframe ? 'On' : 'Off'}`}
          value={objectProps.wireframe}
          onChange={set('wireframe')}
        />
        <Toggle
          label={`Double Side ${objectProps.doubleSide ? 'On' : 'Off'}`}
          value={objectProps.doubleSide}
          onChange={set('doubleSide')}
        />
        <Slider label="Opacity" value={objectProps.opacity} min={0} max={1} step={0.01} onChange={set('opacity')} />
      </Section>

      <Section title="Mesh Rotation (deg)">
        {['x', 'y', 'z'].map((axis) => (
          <Slider
            key={axis}
            label={`${axis.toUpperCase()} — ${meshRotation[axis].toFixed(0)}°`}
            value={meshRotation[axis]}
            min={-180} max={180} step={1}
            onChange={(v) => setObjectProp(selectedId, 'meshRotation', { ...meshRotation, [axis]: v })}
          />
        ))}
      </Section>

      <Section title="Auto Rotation">
        <Toggle
          label={`Rotation ${rotation.enabled ? 'On' : 'Off'}`}
          value={rotation.enabled}
          onChange={(v) => setObjectProp(selectedId, 'rotation', { ...rotation, enabled: v })}
        />
        {rotation.enabled && (
          <>
            <div className="flex gap-1">
              {['x', 'y', 'z'].map((axis) => (
                <button
                  key={axis}
                  onClick={() => setObjectProp(selectedId, 'rotation', { ...rotation, [axis]: !rotation[axis] })}
                  className={`flex-1 py-1 rounded text-xs font-bold uppercase transition-colors
                    ${rotation[axis] ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  {axis}
                </button>
              ))}
            </div>
            <Slider label="Speed" value={rotation.speed} min={0} max={10} step={0.1}
              onChange={(v) => setObjectProp(selectedId, 'rotation', { ...rotation, speed: v })} />
          </>
        )}
      </Section>

      <Section title="Revolve">
        <Toggle
          label={`Revolve ${revolve.enabled ? 'On' : 'Off'}`}
          value={revolve.enabled}
          onChange={(v) => setObjectProp(selectedId, 'revolve', { ...revolve, enabled: v })}
        />
        {revolve.enabled && (
          <>
            <Slider label="Speed"    value={revolve.speed}   min={0}   max={10} step={0.01}
              onChange={(v) => setObjectProp(selectedId, 'revolve', { ...revolve, speed: v })} />
            <Slider label="Radius X" value={revolve.radiusX} min={0.5} max={20} step={0.1}
              onChange={(v) => setObjectProp(selectedId, 'revolve', { ...revolve, radiusX: v })} />
            <Slider label="Radius Z" value={revolve.radiusZ} min={0.5} max={20} step={0.1}
              onChange={(v) => setObjectProp(selectedId, 'revolve', { ...revolve, radiusZ: v })} />
            <Slider label="Height Y" value={revolve.y}       min={-10} max={10} step={0.1}
              onChange={(v) => setObjectProp(selectedId, 'revolve', { ...revolve, y: v })} />
          </>
        )}
      </Section>

      {config && (
        <Section title="Geometry">
          {config.controls.map((ctrl) => (
            <Slider
              key={ctrl.label}
              label={ctrl.label}
              value={geoArgs[ctrl.index]}
              min={ctrl.min} max={ctrl.max} step={ctrl.step}
              onChange={(v) => setGeoArg(selectedId, ctrl.index, v)}
            />
          ))}
        </Section>
      )}

    </div>
  )
}

export default RightPanel