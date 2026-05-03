import useStore from '../store/useStore'
import Section from './ui/selection'
import Slider from './ui/slider'
import Toggle from './ui/toggle'
import ColorRow from './ui/ColorRow'

function LightBlock({ title, type, children, enabled }) {
  const updateLight = useStore((s) => s.updateLight)
  return (
    <div className="flex flex-col gap-1.5 border border-gray-100 rounded p-2">
      <Toggle
        label={`${title} ${enabled ? 'On' : 'Off'}`}
        value={enabled}
        onChange={(v) => updateLight(type, 'enabled', v)}
      />
      {enabled && children}
    </div>
  )
}

function HelperToggle({ type, showHelper, helperSize, showSize = true }) {
  const updateLight = useStore((s) => s.updateLight)
  return (
    <>
      <div className="border-t border-gray-100 pt-1.5 mt-0.5">
        <Toggle
          label={`Helper ${showHelper ? 'On' : 'Off'}`}
          value={showHelper}
          onChange={(v) => updateLight(type, 'showHelper', v)}
        />
      </div>
      {showHelper && showSize && (
        <Slider
          label="Helper Size"
          value={helperSize}
          min={0.1} max={10} step={0.1}
          onChange={(v) => updateLight(type, 'helperSize', v)}
        />
      )}
    </>
  )
}

function LightingPanel() {
  const lights      = useStore((s) => s.lights)
  const updateLight = useStore((s) => s.updateLight)
  const resetLights = useStore((s) => s.resetLights)

  const u = (type, key) => (v) => updateLight(type, key, v)

  return (
    <Section title="Lighting">
      <button
        onClick={resetLights}
        className="text-[10px] text-red-400 hover:text-red-600 text-left"
      >
        Reset Lights
      </button>

      {/* ── Ambient ───────────────────────────────── */}
      <LightBlock title="Ambient" type="ambient" enabled={lights.ambient.enabled}>
        <ColorRow label="Color"     value={lights.ambient.color}     onChange={u('ambient', 'color')}     />
        <Slider   label="Intensity" value={lights.ambient.intensity} min={0} max={5} step={0.01} onChange={u('ambient', 'intensity')} />
        {/* Ambient has no positional helper — nothing extra */}
      </LightBlock>

      {/* ── Directional ───────────────────────────── */}
      <LightBlock title="Directional" type="directional" enabled={lights.directional.enabled}>
        <ColorRow label="Color"     value={lights.directional.color}     onChange={u('directional', 'color')}     />
        <Slider   label="Intensity" value={lights.directional.intensity} min={0} max={10} step={0.01} onChange={u('directional', 'intensity')} />
        <Slider   label="Pos X"     value={lights.directional.x}         min={-20} max={20} step={0.1}  onChange={u('directional', 'x')}         />
        <Slider   label="Pos Y"     value={lights.directional.y}         min={-20} max={20} step={0.1}  onChange={u('directional', 'y')}         />
        <Slider   label="Pos Z"     value={lights.directional.z}         min={-20} max={20} step={0.1}  onChange={u('directional', 'z')}         />
        <HelperToggle
          type="directional"
          showHelper={lights.directional.showHelper}
          helperSize={lights.directional.helperSize}
          showSize
        />
      </LightBlock>

      {/* ── Point ─────────────────────────────────── */}
      <LightBlock title="Point" type="point" enabled={lights.point.enabled}>
        <ColorRow label="Color"     value={lights.point.color}     onChange={u('point', 'color')}     />
        <Slider   label="Intensity" value={lights.point.intensity} min={0} max={10}  step={0.01} onChange={u('point', 'intensity')} />
        <Slider   label="Pos X"     value={lights.point.x}         min={-20} max={20} step={0.1}  onChange={u('point', 'x')}         />
        <Slider   label="Pos Y"     value={lights.point.y}         min={-20} max={20} step={0.1}  onChange={u('point', 'y')}         />
        <Slider   label="Pos Z"     value={lights.point.z}         min={-20} max={20} step={0.1}  onChange={u('point', 'z')}         />
        <Slider   label="Distance"  value={lights.point.distance}  min={0}   max={100} step={0.1} onChange={u('point', 'distance')}  />
        <Slider   label="Decay"     value={lights.point.decay}     min={0}   max={5}   step={0.01} onChange={u('point', 'decay')}    />
        <HelperToggle
          type="point"
          showHelper={lights.point.showHelper}
          helperSize={lights.point.helperSize}
          showSize
        />
      </LightBlock>

      {/* ── Spot ──────────────────────────────────── */}
      <LightBlock title="Spot" type="spot" enabled={lights.spot.enabled}>
        <ColorRow label="Color"     value={lights.spot.color}     onChange={u('spot', 'color')}     />
        <Slider   label="Intensity" value={lights.spot.intensity} min={0} max={10}   step={0.01} onChange={u('spot', 'intensity')} />
        <Slider   label="Pos X"     value={lights.spot.x}         min={-20} max={20} step={0.1}  onChange={u('spot', 'x')}         />
        <Slider   label="Pos Y"     value={lights.spot.y}         min={-20} max={20} step={0.1}  onChange={u('spot', 'y')}         />
        <Slider   label="Pos Z"     value={lights.spot.z}         min={-20} max={20} step={0.1}  onChange={u('spot', 'z')}         />
        <Slider   label="Angle"     value={lights.spot.angle}     min={0}   max={1.57} step={0.01} onChange={u('spot', 'angle')}   />
        <Slider   label="Penumbra"  value={lights.spot.penumbra}  min={0}   max={1}   step={0.01} onChange={u('spot', 'penumbra')} />
        <Slider   label="Distance"  value={lights.spot.distance}  min={0}   max={100} step={0.1}  onChange={u('spot', 'distance')} />
        <Slider   label="Decay"     value={lights.spot.decay}     min={0}   max={5}   step={0.01} onChange={u('spot', 'decay')}    />
        {/* SpotLightHelper auto-sizes from the light's cone — no size slider */}
        <HelperToggle
          type="spot"
          showHelper={lights.spot.showHelper}
          showSize={false}
        />
      </LightBlock>

      {/* ── Hemisphere ────────────────────────────── */}
      <LightBlock title="Hemisphere" type="hemisphere" enabled={lights.hemisphere.enabled}>
        <ColorRow label="Sky"       value={lights.hemisphere.skyColor}    onChange={u('hemisphere', 'skyColor')}    />
        <ColorRow label="Ground"    value={lights.hemisphere.groundColor} onChange={u('hemisphere', 'groundColor')} />
        <Slider   label="Intensity" value={lights.hemisphere.intensity}   min={0} max={5} step={0.01} onChange={u('hemisphere', 'intensity')} />
        <HelperToggle
          type="hemisphere"
          showHelper={lights.hemisphere.showHelper}
          helperSize={lights.hemisphere.helperSize}
          showSize
        />
      </LightBlock>

    </Section>
  )
}

export default LightingPanel