import { useState } from 'react'
import useStore from '../store/useStore'
import { geoConfigs } from '../lib/geoConfigs'
import Section from './ui/selection'
import Slider from './ui/slider'
import Toggle from './ui/toggle'
import { EASING_OPTIONS } from '../lib/cameraAnimations'

const ACTION_TYPES = ['move-to', 'zoom-in', 'zoom-out', 'focus-object', 'orbit', 'sequence']
const ACTION_LABELS = {
  'move-to':      'Move To',
  'zoom-in':      'Zoom In',
  'zoom-out':     'Zoom Out',
  'focus-object': 'Focus Object',
  'orbit':        'Orbit',
  'sequence':     'Sequence',
}

function Vec3Row({ label, value, min = -20, max = 20, step = 0.1, onChange }) {
  const [x, y, z] = value ?? [0, 0, 0]
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] text-gray-400 uppercase tracking-wide">{label}</span>
      {[['X', x, 0], ['Y', y, 1], ['Z', z, 2]].map(([ax, val, i]) => (
        <Slider key={ax}
          label={`${ax}: ${val.toFixed(1)}`}
          value={val} min={min} max={max} step={step}
          onChange={(v) => { const n = [...(value ?? [0,0,0])]; n[i] = v; onChange(n) }}
        />
      ))}
    </div>
  )
}

function RightPanel() {
  const objects = useStore((s) => s.objects)
  const cameras = useStore((s) => s.cameras)
  const hotspots = useStore((s) => s.hotspots)
  const selectedId = useStore((s) => s.selectedId)
  const selectedCameraId = useStore((s) => s.selectedCameraId)
  const selectedHotspotId = useStore((s) => s.selectedHotspotId)
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
  const updateHotspot = useStore((s) => s.updateHotspot)
  const updateHotspotAction = useStore((s) => s.updateHotspotAction)
  const updateHotspotTransition = useStore((s) => s.updateHotspotTransition)
  const removeHotspot = useStore((s) => s.removeHotspot)
  const triggerHotspot = useStore((s) => s.triggerHotspot)
  const isAnimating = useStore((s) => s.isAnimating)
  const requestCaptureCamera  = useStore((s) => s.requestCaptureCamera)
  const addHotspotWaypoint    = useStore((s) => s.addHotspotWaypoint)
  const removeHotspotWaypoint = useStore((s) => s.removeHotspotWaypoint)
  const updateHotspotWaypoint = useStore((s) => s.updateHotspotWaypoint)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const obj = objects.find((o) => o.id === selectedId)
  const camera = cameras.find((c) => c.id === selectedCameraId)
  const hotspot = hotspots.find((h) => h.id === selectedHotspotId)

  if (!obj && !camera && !hotspot) return null

  // ── Hotspot Panel ──────────────────────────────────────────────────────────
  if (hotspot && !obj && !camera) {
    const { action, transition, position, color, name } = hotspot
    const hid = hotspot.id

    const startEdit  = () => { setDraft(name); setEditing(true) }
    const commitEdit = () => { updateHotspot(hid, 'name', draft.trim() || name); setEditing(false) }
    const handleKey  = (e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false) }

    return (
      <div className="flex-[0_0_220px] border-l border-gray-200 p-4 overflow-y-auto flex flex-col gap-5 bg-gray-50">

        {/* Name + delete */}
        <div className="flex items-center justify-between gap-2">
          {editing ? (
            <input autoFocus value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitEdit} onKeyDown={handleKey}
              className="flex-1 text-sm font-semibold text-gray-700 border-b border-amber-400 bg-transparent outline-none"
            />
          ) : (
            <p onClick={startEdit} title="Click to rename"
              className="flex-1 text-sm font-semibold text-gray-700 cursor-text truncate hover:text-amber-500 transition-colors">
              {name}
            </p>
          )}
          <button onClick={() => removeHotspot(hid)}
            className="text-[10px] bg-red-100 hover:bg-red-500 text-red-500 hover:text-white px-2 py-0.5 rounded transition-colors font-medium">
            Delete
          </button>
        </div>

        {/* Marker appearance */}
        <Section title="Marker">
          <div className="flex items-center gap-3">
            <input type="color" value={color}
              onChange={(e) => updateHotspot(hid, 'color', e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
            <span className="text-xs text-gray-500">Color</span>
          </div>
          <Vec3Row label="Position" value={position}
            onChange={(v) => updateHotspot(hid, 'position', v)} />
        </Section>

        {/* Start Position */}
        <Section title="Start Position">
          <Toggle
            label={`Use Defined Start ${action.useDefinedStart ? 'On' : 'Off'}`}
            value={action.useDefinedStart ?? false}
            onChange={(v) => updateHotspotAction(hid, 'useDefinedStart', v)}
          />
          {(action.useDefinedStart) && (
            <>
              <Vec3Row label="Start Camera Pos" value={action.startPosition ?? [0,3,5]}
                onChange={(v) => updateHotspotAction(hid, 'startPosition', v)} />
              <Vec3Row label="Start Look At" value={action.startLookAt ?? [0,0,0]}
                onChange={(v) => updateHotspotAction(hid, 'startLookAt', v)} />
              <Slider label={`Start FOV: ${action.startFov ?? 45}°`} value={action.startFov ?? 45}
                min={5} max={120} step={1}
                onChange={(v) => updateHotspotAction(hid, 'startFov', v)} />
              <button onClick={() => requestCaptureCamera(hid, 'start')}
                className="text-[10px] bg-blue-100 hover:bg-blue-500 text-blue-600 hover:text-white px-2 py-1 rounded transition-colors w-full font-medium">
                Use Current Camera as Start
              </button>
            </>
          )}
        </Section>

        {/* Action */}
        <Section title="Action">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Type</span>
            <select value={action.type}
              onChange={(e) => updateHotspotAction(hid, 'type', e.target.value)}
              className="text-xs bg-white border border-gray-200 rounded px-2 py-1 text-gray-700">
              {ACTION_TYPES.map((t) => (
                <option key={t} value={t}>{ACTION_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {/* move-to / zoom-in / zoom-out — all share the same explicit end-position fields */}
          {(action.type === 'move-to' || action.type === 'zoom-in' || action.type === 'zoom-out') && (
            <>
              <Vec3Row label="End Camera Pos" value={action.toPosition ?? [5,3,5]}
                onChange={(v) => updateHotspotAction(hid, 'toPosition', v)} />
              <Vec3Row label="End Look At" value={action.toLookAt ?? [0,0,0]}
                onChange={(v) => updateHotspotAction(hid, 'toLookAt', v)} />
              <Slider label={`End FOV: ${action.toFov ?? 45}°`} value={action.toFov ?? 45}
                min={5} max={120} step={1}
                onChange={(v) => updateHotspotAction(hid, 'toFov', v)} />
              <button
                onClick={() => requestCaptureCamera(hid, 'end')}
                className="text-[10px] bg-red-100 hover:bg-red-500 text-red-600 hover:text-white px-2 py-1 rounded font-medium w-full transition-colors"
              >
                Use Current Camera as End
              </button>
            </>
          )}

          {/* focus-object params */}
          {action.type === 'focus-object' && (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-wide">Target Object</span>
                <select value={action.focusObjectId ?? ''}
                  onChange={(e) => updateHotspotAction(hid, 'focusObjectId', e.target.value === '' ? null : Number(e.target.value))}
                  className="text-xs bg-white border border-gray-200 rounded px-2 py-1 text-gray-700">
                  <option value="">None</option>
                  {objects.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <Slider label={`Distance: ${action.focusDistance ?? 5}`} value={action.focusDistance ?? 5}
                min={0.5} max={20} step={0.1}
                onChange={(v) => updateHotspotAction(hid, 'focusDistance', v)} />
              <Slider label={`FOV: ${action.focusFov ?? 45}°`} value={action.focusFov ?? 45}
                min={5} max={120} step={1}
                onChange={(v) => updateHotspotAction(hid, 'focusFov', v)} />
            </>
          )}

          {/* orbit params */}
          {action.type === 'orbit' && (
            <>
              <Vec3Row label="Orbit Center" value={action.orbitTarget}
                onChange={(v) => updateHotspotAction(hid, 'orbitTarget', v)} />
              <Slider label={`Radius: ${action.orbitRadius ?? 5}`} value={action.orbitRadius ?? 5}
                min={0.5} max={30} step={0.1}
                onChange={(v) => updateHotspotAction(hid, 'orbitRadius', v)} />
              <Slider label={`Angle: ${action.orbitAngle ?? 360}°`} value={action.orbitAngle ?? 360}
                min={15} max={720} step={15}
                onChange={(v) => updateHotspotAction(hid, 'orbitAngle', v)} />
              <Slider label={`Height: ${action.orbitHeight ?? 0}`} value={action.orbitHeight ?? 0}
                min={-10} max={10} step={0.1}
                onChange={(v) => updateHotspotAction(hid, 'orbitHeight', v)} />
            </>
          )}

          {/* sequence params */}
          {action.type === 'sequence' && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">Steps (in order)</span>
              {hotspots.filter((h) => h.id !== hid && h.action.type !== 'sequence').map((h) => {
                const inSeq = (action.sequenceIds ?? []).includes(h.id)
                return (
                  <label key={h.id} className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={inSeq}
                      className="accent-amber-500 cursor-pointer"
                      onChange={() => {
                        const ids = action.sequenceIds ?? []
                        updateHotspotAction(hid, 'sequenceIds',
                          inSeq ? ids.filter((i) => i !== h.id) : [...ids, h.id])
                      }} />
                    <span className="text-xs text-gray-700 truncate">{h.name}</span>
                    <span className="text-[9px] text-gray-400 ml-auto">{ACTION_LABELS[h.action.type]}</span>
                  </label>
                )
              })}
              {hotspots.filter((h) => h.id !== hid && h.action.type !== 'sequence').length === 0 && (
                <span className="text-xs text-gray-400 italic">Add more hotspots first</span>
              )}
            </div>
          )}
        </Section>

        {/* Waypoints */}
        <Section title="Waypoints">
          <button onClick={() => addHotspotWaypoint(hid)}
            className="text-[10px] bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded font-medium w-full transition-colors">
            + Add Waypoint
          </button>
          {(action.waypoints ?? []).map((wp, i) => (
            <div key={i} className="flex flex-col gap-1 p-2 border border-gray-200 rounded bg-white mt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-gray-500">Waypoint {i + 1}</span>
                <button onClick={() => removeHotspotWaypoint(hid, i)}
                  className="text-[9px] text-gray-400 hover:text-red-500 font-bold">✕</button>
              </div>
              <Vec3Row label="Position" value={wp.position}
                onChange={(v) => updateHotspotWaypoint(hid, i, 'position', v)} />
              <Vec3Row label="Look At" value={wp.lookAt}
                onChange={(v) => updateHotspotWaypoint(hid, i, 'lookAt', v)} />
              <Slider label={`FOV: ${wp.fov ?? 45}°`} value={wp.fov ?? 45}
                min={5} max={120} step={1}
                onChange={(v) => updateHotspotWaypoint(hid, i, 'fov', v)} />
              <button onClick={() => requestCaptureCamera(hid, 'waypoint', i)}
                className="text-[10px] bg-blue-100 hover:bg-blue-500 text-blue-600 hover:text-white px-2 py-1 rounded transition-colors w-full font-medium">
                Use Current Camera
              </button>
            </div>
          ))}
        </Section>

        {/* Transition */}
        <Section title="Transition">
          <Slider label={`Duration: ${transition.duration ?? 1.5}s`} value={transition.duration ?? 1.5}
            min={0.1} max={10} step={0.1}
            onChange={(v) => updateHotspotTransition(hid, 'duration', v)} />
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Easing</span>
            <select value={transition.easing ?? 'ease-in-out'}
              onChange={(e) => updateHotspotTransition(hid, 'easing', e.target.value)}
              className="text-xs bg-white border border-gray-200 rounded px-2 py-1 text-gray-700">
              {EASING_OPTIONS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <Slider label={`Delay: ${transition.delay ?? 0}s`} value={transition.delay ?? 0}
            min={0} max={5} step={0.1}
            onChange={(v) => updateHotspotTransition(hid, 'delay', v)} />
          <Toggle
            label={`Loop Back ${transition.loopBack ? 'On' : 'Off'}`}
            value={transition.loopBack ?? false}
            onChange={(v) => updateHotspotTransition(hid, 'loopBack', v)}
          />
          {(transition.loopBack) && (
            <Slider label={`Loop Back Duration: ${transition.loopBackDuration ?? 1.5}s`}
              value={transition.loopBackDuration ?? 1.5}
              min={0.1} max={10} step={0.1}
              onChange={(v) => updateHotspotTransition(hid, 'loopBackDuration', v)} />
          )}
        </Section>

        {/* Play */}
        <Section title="Actions">
          <button
            disabled={isAnimating}
            onClick={() => triggerHotspot(hid)}
            className={`w-full py-2 px-4 rounded font-medium text-sm transition-colors text-white
              ${isAnimating ? 'bg-gray-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600'}`}
          >
            {isAnimating ? 'Animating…' : '▶ Play Hotspot'}
          </button>
        </Section>

      </div>
    )
  }

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