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

  const obj = objects.find((o) => o.id === selectedId)
  if (!obj) return null

  const { geometryKey, geoArgs, objectProps } = obj
  const { rotation } = objectProps
  const config = geoConfigs[geometryKey]

  const set = (key) => (value) => setObjectProp(selectedId, key, value)

  return (
    <div className="flex-[0_0_220px] border-l border-gray-200 p-4 overflow-y-auto flex flex-col gap-5 bg-gray-50">

      {/* ── Header ───────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700 capitalize">
          {geometryKey} #{selectedId}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => resetObjectProps(selectedId)}
            className="text-[10px] text-gray-400 hover:text-gray-600"
          >
            Reset
          </button>
          <button
            onClick={() => removeObject(selectedId)}
            className="text-[10px] bg-red-100 hover:bg-red-500 text-red-500 hover:text-white px-2 py-0.5 rounded transition-colors font-medium"
          >
            Delete
          </button>
        </div>
      </div>

      {/* ── Color ────────────────────────────────── */}
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

      {/* ── Scale ────────────────────────────────── */}
      <Section title="Scale">
        <Slider
          label="Uniform Scale"
          value={objectProps.scale}
          min={0.1} max={5} step={0.1}
          onChange={set('scale')}
        />
      </Section>

      {/* ── Display ──────────────────────────────── */}
      <Section title="Display">
        <Toggle
          label={`Wireframe ${objectProps.wireframe ? 'On' : 'Off'}`}
          value={objectProps.wireframe}
          onChange={set('wireframe')}
        />
      </Section>

      {/* ── Auto Rotation ────────────────────────── */}
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
            <Slider
              label="Speed"
              value={rotation.speed}
              min={0} max={10} step={0.1}
              onChange={(v) => setObjectProp(selectedId, 'rotation', { ...rotation, speed: v })}
            />
          </>
        )}
      </Section>

      {/* ── Geometry ─────────────────────────────── */}
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