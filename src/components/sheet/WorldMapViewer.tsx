import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Minus, Plus, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import magnaMundMap from '@/assets/maps/world/magnamund.jpg'

const IMG_W = 4000
const IMG_H = 4957
const MAX_ZOOM_FACTOR = 8 // deepest zoom relative to the cover scale
const WHEEL_STEP = 1.15
const BUTTON_STEP = 1.5

const btnClass =
  'flex items-center justify-center w-7 h-7 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 transition-colors'
const dividerClass = 'h-px bg-slate-700/60'

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y)

type View = { scale: number; tx: number; ty: number }

interface Props {
  className?: string
}

export function WorldMapViewer({ className }: Props) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)

  // Live view + limits live in refs so wheel/pointer handlers always read
  // fresh values without re-subscribing. A tick state forces re-render.
  const view = useRef<View>({ scale: 0, tx: 0, ty: 0 })
  const home = useRef<View>({ scale: 0, tx: 0, ty: 0 })
  const limits = useRef({ min: 0, max: 0, cw: 0, ch: 0 })
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinchDist = useRef(0)
  const animatedRef = useRef(false)
  const reduceMotion = useRef(false)
  const [, setTick] = useState(0)
  const render = () => setTick(t => t + 1)

  // Clamp pan so the map always covers the container — no edge ever shows.
  // (At scale >= cover, scaled width/height are guaranteed >= container.)
  const clampPan = (tx: number, ty: number, scale: number): View => {
    const { cw, ch } = limits.current
    const sw = IMG_W * scale
    const sh = IMG_H * scale
    const ntx = sw <= cw ? (cw - sw) / 2 : clamp(tx, cw - sw, 0)
    const nty = sh <= ch ? (ch - sh) / 2 : clamp(ty, ch - sh, 0)
    return { scale, tx: ntx, ty: nty }
  }

  // Zoom around a container-space point (cx, cy), keeping that point fixed.
  const zoomAround = (factor: number, cx: number, cy: number, animate: boolean) => {
    const { min, max } = limits.current
    const { scale, tx, ty } = view.current
    const newScale = clamp(scale * factor, min, max)
    if (newScale === scale) return
    const imgX = (cx - tx) / scale
    const imgY = (cy - ty) / scale
    const ntx = cx - imgX * newScale
    const nty = cy - imgY * newScale
    animatedRef.current = animate && !reduceMotion.current
    view.current = clampPan(ntx, nty, newScale)
    render()
  }

  const reflow = (initial: boolean) => {
    const el = containerRef.current
    if (!el) return
    const cw = el.clientWidth
    const ch = el.clientHeight
    if (!cw || !ch) return
    const cover = Math.max(cw / IMG_W, ch / IMG_H)
    limits.current = { min: cover, max: cover * MAX_ZOOM_FACTOR, cw, ch }
    home.current = {
      scale: cover,
      tx: (cw - IMG_W * cover) / 2,
      ty: (ch - IMG_H * cover) / 2,
    }
    if (initial || view.current.scale === 0) {
      view.current = { ...home.current }
    } else {
      const scale = clamp(view.current.scale, limits.current.min, limits.current.max)
      view.current = clampPan(view.current.tx, view.current.ty, scale)
    }
    animatedRef.current = false
    render()
  }

  useLayoutEffect(() => {
    reduceMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => reflow(false))
    ro.observe(el)
    reflow(true)
    return () => ro.disconnect()
  }, [])

  // Native wheel listener so we can preventDefault (React onWheel is passive).
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const factor = e.deltaY < 0 ? WHEEL_STEP : 1 / WHEEL_STEP
      zoomAround(factor, e.clientX - rect.left, e.clientY - rect.top, false)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    containerRef.current?.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      pinchDist.current = distance(a, b)
    }
    render() // update cursor
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return
    const prev = pointers.current.get(e.pointerId)!
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()

    if (pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()]
      const curDist = distance(a, b)
      if (pinchDist.current > 0) {
        const midX = (a.x + b.x) / 2 - rect.left
        const midY = (a.y + b.y) / 2 - rect.top
        zoomAround(curDist / pinchDist.current, midX, midY, false)
      }
      pinchDist.current = curDist
      return
    }

    const dx = e.clientX - prev.x
    const dy = e.clientY - prev.y
    animatedRef.current = false
    const { scale, tx, ty } = view.current
    view.current = clampPan(tx + dx, ty + dy, scale)
    render()
  }

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinchDist.current = 0
    render()
  }

  const zoomButton = (dir: 1 | -1) => {
    const { cw, ch } = limits.current
    zoomAround(dir > 0 ? BUTTON_STEP : 1 / BUTTON_STEP, cw / 2, ch / 2, true)
  }

  const reset = () => {
    animatedRef.current = !reduceMotion.current
    view.current = { ...home.current }
    render()
  }

  const { scale, tx, ty } = view.current
  const panning = pointers.current.size > 0

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={`relative overflow-hidden rounded-lg bg-slate-950 ${className ?? ''}`}
      style={{ touchAction: 'none', cursor: panning ? 'grabbing' : 'grab' }}
    >
      <img
        src={magnaMundMap}
        alt={t('sheet.worldMap')}
        draggable={false}
        onLoad={() => reflow(false)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${IMG_W}px`,
          height: `${IMG_H}px`,
          maxWidth: 'none',
          transformOrigin: '0 0',
          transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
          transition: animatedRef.current
            ? 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)'
            : 'none',
          willChange: 'transform',
          userSelect: 'none',
        }}
      />

      <div
        onPointerDown={e => e.stopPropagation()}
        className="absolute bottom-3 right-3 z-10 flex flex-col rounded-lg overflow-hidden bg-slate-800/80 backdrop-blur-sm border border-slate-700/60"
      >
        <button onClick={() => zoomButton(1)} className={btnClass} title={t('sheet.zoomIn')}>
          <Plus size={13} />
        </button>
        <div className={dividerClass} />
        <button onClick={() => zoomButton(-1)} className={btnClass} title={t('sheet.zoomOut')}>
          <Minus size={13} />
        </button>
        <div className={dividerClass} />
        <button onClick={reset} className={btnClass} title={t('sheet.resetZoom')}>
          <RotateCcw size={11} />
        </button>
      </div>
    </div>
  )
}
