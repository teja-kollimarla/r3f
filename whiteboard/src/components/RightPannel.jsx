import { useState } from 'react'
import useStore from '../store/useStore'
import { geoConfigs } from '../lib/geoConfigs'
import Section from './ui/selection'
import Slider from './ui/slider'
import Toggle from './ui/toggle'

function RightPanel() {
  const objects = useStore((s) => s.objects)
  const cameras = useStore((s) => s.cameras)
  const selectedId = useStore((s) => s.selectedId)
  const selectedCameraId = useStore((s) => s.selectedCameraId)
  const previewCameraId = useStore((s) => s.previewCameraId)
  const setObjectProp = useStore((s) => s.setObjectProp)
  const setGeoArg = useStore((s) => s.setGeoArg)
  const resetObjectProps = useStore((s) => s.resetObjectProps)
  const removeObject = useStore((s) => s.removeObject)
  const renameObject = useStore((s) => s.renameObject)
  const setCameraProp = useStore((s) => s.setCameraProp)
  const renameCamera = useStore((s) => s.renameCamera)
  const removeCamera = useStore((s) => s.removeCamera)
  const startPreview = useStore((s) => s.startPreview)
  const stopPreview = useStore((s) => s.stopPreview)
  const setCameraPosition = useStore((s) => s.setCameraPosition)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const obj = objects.find((o) => o.id === selectedId)
  const camera = cameras.find((c) => c.id === selectedCameraId)

  if (!obj && !camera) return null

  if (camera) {
    const { cameraProps, name, position } = camera
    const { rotation, revolve } = cameraProps   

    const startEdit = () => { setDraft(name); setEditing(true) }
    const commitEdit = () => { renameCamera(selectedCameraId, draft.trim() || name); setEditing(false) }
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') commitEdit()
      if (e.key === 'Escape') setEditing(false)
    }

    const isPreviewing = previewCameraId === selectedCameraId

    const setPosition = (axis, value) => {
      const newPos = [...position]
      newPos[axis === 'x' ? 0 : axis === 'y' ? 1 : 2] = value
      setCameraPosition(selectedCameraId, newPos)
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
          <button
            onClick={() => removeCamera(selectedCameraId)}
            className="text-[10px] bg-red-100 hover:bg-red-500 text-red-500 hover:text-white px-2 py-0.5 rounded transition-colors font-medium"
          >
            Delete
          </button>
        </div>

        <Section title="Position">
          <Slider label={`X: ${position[0].toFixed(1)}`} value={position[0]} min={-20} max={20} step={0.1} onChange={(v) => setPosition('x', v)} />
          <Slider label={`Y: ${position[1].toFixed(1)}`} value={position[1]} min={-20} max={20} step={0.1} onChange={(v) => setPosition('y', v)} />
          <Slider label={`Z: ${position[2].toFixed(1)}`} value={position[2]} min={-20} max={20} step={0.1} onChange={(v) => setPosition('z', v)} />
        </Section>

        <Section title="Camera Properties">
          <Slider label="FOV" value={cameraProps.fov} min={10} max={180} step={1} onChange={(v) => setCameraProp(selectedCameraId, 'fov', v)} />
          <Slider label="Near" value={cameraProps.near} min={0.01} max={10} step={0.01} onChange={(v) => setCameraProp(selectedCameraId, 'near', v)} />
          <Slider label="Far" value={cameraProps.far} min={10} max={10000} step={10} onChange={(v) => setCameraProp(selectedCameraId, 'far', v)} />
          <Toggle
            label={`Helper ${cameraProps.showHelper ? 'On' : 'Off'}`}
            value={cameraProps.showHelper}
            onChange={(v) => setCameraProp(selectedCameraId, 'showHelper', v)}
          />
        </Section>

        <Section title="Direction">
          {/* ── Bound objects (multi-select checkboxes) ── */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Frame Objects</span>
            {objects.length === 0 ? (
              <span className="text-xs text-gray-400 italic">No objects in scene</span>
            ) : objects.map((o) => {
              const ids    = cameraProps.lookAtObjectIds ?? []
              const bound  = ids.includes(o.id)
              const toggle = () => setCameraProp(
                selectedCameraId, 'lookAtObjectIds',
                bound ? ids.filter((i) => i !== o.id) : [...ids, o.id]
              )
              return (
                <label key={o.id} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox" checked={bound} onChange={toggle}
                    className="accent-blue-500 cursor-pointer"
                  />
                  <span className="text-xs text-gray-700 truncate">{o.name}</span>
                </label>
              )
            })}
          </div>

          {/* ── Auto Frame toggle (only when objects are bound) ── */}
          {(cameraProps.lookAtObjectIds ?? []).length > 0 && (
            <Toggle
              label={`Auto Frame ${cameraProps.autoFrame ? 'On' : 'Off'}`}
              value={cameraProps.autoFrame ?? false}
              onChange={(v) => setCameraProp(selectedCameraId, 'autoFrame', v)}
            />
          )}

          {/* ── Free rotation sliders (only when no objects bound) ── */}
          {(cameraProps.lookAtObjectIds ?? []).length === 0 && (
            <>
              <Slider
                label={`Pitch: ${(((cameraProps.euler?.[0] ?? 0) * 180) / Math.PI).toFixed(0)}°`}
                value={(cameraProps.euler?.[0] ?? 0) * 180 / Math.PI}
                min={-90} max={90} step={1}
                onChange={(v) => {
                  const e = [...(cameraProps.euler ?? [0, 0, 0])]
                  e[0] = v * Math.PI / 180
                  setCameraProp(selectedCameraId, 'euler', e)
                }}
              />
              <Slider
                label={`Yaw: ${(((cameraProps.euler?.[1] ?? 0) * 180) / Math.PI).toFixed(0)}°`}
                value={(cameraProps.euler?.[1] ?? 0) * 180 / Math.PI}
                min={-180} max={180} step={1}
                onChange={(v) => {
                  const e = [...(cameraProps.euler ?? [0, 0, 0])]
                  e[1] = v * Math.PI / 180
                  setCameraProp(selectedCameraId, 'euler', e)
                }}
              />
              <Slider
                label={`Roll: ${(((cameraProps.euler?.[2] ?? 0) * 180) / Math.PI).toFixed(0)}°`}
                value={(cameraProps.euler?.[2] ?? 0) * 180 / Math.PI}
                min={-180} max={180} step={1}
                onChange={(v) => {
                  const e = [...(cameraProps.euler ?? [0, 0, 0])]
                  e[2] = v * Math.PI / 180
                  setCameraProp(selectedCameraId, 'euler', e)
                }}
              />
            </>
          )}
        </Section>
        <Section title="Auto Rotation">
          <Toggle
            label={`Rotation ${rotation.enabled ? 'On' : 'Off'}`}
            value={rotation.enabled}
            onChange={(v) => setCameraProp(selectedCameraId, 'rotation', { ...rotation, enabled: v })}
          />
          {rotation.enabled && (
            <>
              <div className="flex gap-1">
                {['x', 'y', 'z'].map((axis) => (
                  <button
                    key={axis}
                    onClick={() => setCameraProp(selectedCameraId, 'rotation', { ...rotation, [axis]: !rotation[axis] })}
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
                onChange={(v) => setCameraProp(selectedCameraId, 'rotation', { ...rotation, speed: v })}
              />
            </>
          )}
        </Section>

        {/* ── Revolve ── */}
        <Section title="Revolve">
          <Toggle
            label={`Revolve ${revolve.enabled ? 'On' : 'Off'}`}
            value={revolve.enabled}
            onChange={(v) => setCameraProp(selectedCameraId, 'revolve', { ...revolve, enabled: v })}
          />
          {revolve.enabled && (
            <>
              <Slider label="Speed" value={revolve.speed} min={0} max={10} step={0.01} onChange={(v) => setCameraProp(selectedCameraId, 'revolve', { ...revolve, speed: v })} />
              <Slider label="Radius X" value={revolve.radiusX} min={0.5} max={20} step={0.1} onChange={(v) => setCameraProp(selectedCameraId, 'revolve', { ...revolve, radiusX: v })} />
              <Slider label="Radius Z" value={revolve.radiusZ} min={0.5} max={20} step={0.1} onChange={(v) => setCameraProp(selectedCameraId, 'revolve', { ...revolve, radiusZ: v })} />
              <Slider label="Height Y" value={revolve.y} min={-10} max={10} step={0.1} onChange={(v) => setCameraProp(selectedCameraId, 'revolve', { ...revolve, y: v })} />
            </>
          )}
        </Section>


        <Section title="Actions">
          <button
            onClick={() => isPreviewing ? stopPreview() : startPreview(selectedCameraId)}
            className={`w-full py-2 px-4 rounded font-medium transition-colors text-sm
              ${isPreviewing ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
          >
            {isPreviewing ? 'Stop Preview' : 'Start Preview'}
          </button>
        </Section>

      </div>
    )
  }
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

      <Section title="Auto Revolve">
        <Toggle
          label={`Revolve ${revolve.enabled ? 'On' : 'Off'}`}
          value={revolve.enabled}
          onChange={(v) => setObjectProp(selectedId, 'revolve', { ...revolve, enabled: v })}
        />
        {revolve.enabled && (
          <>
            <Slider label="Speed" value={revolve.speed} min={0} max={10} step={0.01}
              onChange={(v) => setObjectProp(selectedId, 'revolve', { ...revolve, speed: v })} />
            <Slider label="Radius X" value={revolve.radiusX} min={0.5} max={20} step={0.1}
              onChange={(v) => setObjectProp(selectedId, 'revolve', { ...revolve, radiusX: v })} />
            <Slider label="Radius Z" value={revolve.radiusZ} min={0.5} max={20} step={0.1}
              onChange={(v) => setObjectProp(selectedId, 'revolve', { ...revolve, radiusZ: v })} />
            <Slider label="Height Y" value={revolve.y} min={-10} max={10} step={0.1}
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