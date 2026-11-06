'use client'

import { OrbitControls } from '@react-three/drei'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import {
  Component,
  createContext,
  Suspense,
  useDeferredValue,
  useEffect,
  useMemo,
  useContext,
  useRef,
  type ComponentRef,
  type ReactNode,
} from 'react'
import {
  Shape,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
  type Mesh,
  type PerspectiveCamera,
  type Texture,
} from 'three'

import { ModelCanvas } from '@/components/model/ModelCanvas'
import { useLensZoom } from '@/components/model/useLensZoom'
import { BOTA_LETTER_COLORS, BOTA_SCREEN_PALETTE } from '@/lib/colors'
import {
  cardImage,
  EDGE_BY_ID,
  keyLetter,
  EDGES,
  FACES,
  type CardStyle,
  type CubeDirection,
  type CubeFace,
  type EdgeId,
  type FlowDirection,
} from '@/lib/cubeOfSpace'

// The Cube of Space seen from inside, after botatoolbox's: each face a
// wall in its letter's colour with the letter's Tarot key on it, framed by
// mitred borders in the colours of the four edges round it, and over each
// border half of that edge's key, so that the two halves meet across the
// corner. The cube is 4 units on a side; the viewer stands at its centre.

const HALF = 2
const BORDER = 0.12

const colorOf = (letter: string) =>
  BOTA_SCREEN_PALETTE[BOTA_LETTER_COLORS[letter]]

// ---- Flow (tweak freely) ---------------------------------------------------------
// Dots per edge, speed in edge-lengths per second, dot radius and opacity.
const FLOW_COUNT = 4
const FLOW_SPEED = 0.25
const FLOW_SIZE = 0.1
const FLOW_OPACITY = 0.5

// ---- Geometry ----------------------------------------------------------------------

// +X east, +Y up, +Z south. Facing the Empress in the east from inside,
// the Tower (north) is on the left and the Sun (south) on the right, as
// in the BOTA diagrams.
type Vec3 = [number, number, number]

const CORNER = {
  'top-SE': [+HALF, +HALF, +HALF],
  'top-SW': [-HALF, +HALF, +HALF],
  'top-NE': [+HALF, +HALF, -HALF],
  'top-NW': [-HALF, +HALF, -HALF],
  'bot-SE': [+HALF, -HALF, +HALF],
  'bot-SW': [-HALF, -HALF, +HALF],
  'bot-NE': [+HALF, -HALF, -HALF],
  'bot-NW': [-HALF, -HALF, -HALF],
} satisfies Record<string, Vec3>

type Corner = keyof typeof CORNER

const EDGE_CORNERS: Record<EdgeId, [Corner, Corner]> = {
  'T-N': ['top-NW', 'top-NE'],
  'T-E': ['top-SE', 'top-NE'],
  'T-S': ['top-SW', 'top-SE'],
  'T-W': ['top-NW', 'top-SW'],
  'B-N': ['bot-NW', 'bot-NE'],
  'B-E': ['bot-SE', 'bot-NE'],
  'B-S': ['bot-SW', 'bot-SE'],
  'B-W': ['bot-NW', 'bot-SW'],
  NE: ['bot-NE', 'top-NE'],
  NW: ['bot-NW', 'top-NW'],
  SE: ['bot-SE', 'top-SE'],
  SW: ['bot-SW', 'top-SW'],
}

// Which axis each flow direction runs along, and whether it runs toward
// the positive end.
const FLOW_AXIS: Record<FlowDirection, [0 | 1 | 2, boolean]> = {
  east: [0, true],
  west: [0, false],
  up: [1, true],
  down: [1, false],
  south: [2, true],
  north: [2, false],
}

// An edge's two corners, in the order its current flows.
function flowEnds(id: EdgeId): [Vec3, Vec3] {
  const [a, b] = EDGE_CORNERS[id].map((c) => CORNER[c])
  const [axis, positive] = FLOW_AXIS[EDGE_BY_ID[id].flow]
  const aIsEnd = positive ? a[axis] > b[axis] : a[axis] < b[axis]
  return aIsEnd ? [b, a] : [a, b]
}

// Where each face stands, turned to face the centre. The keys on the
// ceiling and floor lie a quarter turn round so they read from the east.
interface FacePlacement {
  position: Vec3
  rotation: Vec3
  cardRotation?: Vec3
  halves: 'lateral' | 'above' | 'below'
}

const PLACEMENT: Record<CubeDirection, FacePlacement> = {
  east: {
    position: [HALF, 0, 0],
    rotation: [0, -Math.PI / 2, 0],
    halves: 'lateral',
  },
  west: {
    position: [-HALF, 0, 0],
    rotation: [0, Math.PI / 2, 0],
    halves: 'lateral',
  },
  above: {
    position: [0, HALF, 0],
    rotation: [Math.PI / 2, 0, 0],
    cardRotation: [0, 0, -Math.PI / 2],
    halves: 'above',
  },
  below: {
    position: [0, -HALF, 0],
    rotation: [-Math.PI / 2, 0, 0],
    cardRotation: [0, 0, -Math.PI / 2],
    halves: 'below',
  },
  north: { position: [0, 0, -HALF], rotation: [0, 0, 0], halves: 'lateral' },
  south: {
    position: [0, 0, HALF],
    rotation: [0, Math.PI, 0],
    halves: 'lateral',
  },
}

type Side = 'top' | 'bottom' | 'left' | 'right'
const SIDES: Side[] = ['top', 'bottom', 'left', 'right']

// The mitred border along one side of a face.
// The strips reach a little past the face's edge (`LIP`): each sits a
// hair off its face, so without it the two strips of an edge would stop
// just short of each other at the corner, and from outside a thin line of
// the wall beneath would show between them. Both strips are the edge's
// colour, so where they overlap nothing shows.
const LIP = 0.008

function borderShape(side: Side) {
  const H = HALF
  const O = HALF + LIP
  const T = BORDER
  const s = new Shape()
  switch (side) {
    case 'top':
      s.moveTo(-H + T, H - T)
      s.lineTo(H - T, H - T)
      s.lineTo(O, O)
      s.lineTo(-O, O)
      break
    case 'bottom':
      s.moveTo(H - T, -H + T)
      s.lineTo(-H + T, -H + T)
      s.lineTo(-O, -O)
      s.lineTo(O, -O)
      break
    case 'left':
      s.moveTo(-H + T, -H + T)
      s.lineTo(-H + T, H - T)
      s.lineTo(-O, O)
      s.lineTo(-O, -O)
      break
    case 'right':
      s.moveTo(H - T, H - T)
      s.lineTo(H - T, -H + T)
      s.lineTo(O, -O)
      s.lineTo(O, O)
      break
  }
  s.closePath()
  return s
}

const BORDER_SHAPES = Object.fromEntries(
  SIDES.map((side) => [side, borderShape(side)]),
) as Record<Side, Shape>

// Half of an edge's key, laid against one side of a face: its size and
// place on the face, and which half of the image it shows. Each edge
// touches two faces, and the two halves meet across the corner. (The
// same table is mirrored in botatoolbox's paper cube.)
interface HalfCard {
  size: [number, number]
  position: Vec3
  rotation: Vec3
  uvOffset: [number, number]
  uvRepeat: [number, number]
}

const halfCard = (
  size: [number, number],
  position: Vec3,
  rotateZ: number,
  uvOffset: [number, number],
  uvRepeat: [number, number],
): HalfCard => ({
  size,
  position,
  rotation: [0, 0, rotateZ],
  uvOffset,
  uvRepeat,
})

const WIDE: [number, number] = [1.0, 0.8]
const TALL: [number, number] = [0.5, 1.6]
const Z = 0.012
const TOP_HALF: [number, number] = [0, 0.5]
const BOTTOM_HALF: [number, number] = [0, 0]
const HALF_HIGH: [number, number] = [1, 0.5]

const HALVES: Record<FacePlacement['halves'], Record<Side, HalfCard>> = {
  lateral: {
    top: halfCard(WIDE, [0, HALF - 0.4, Z], 0, BOTTOM_HALF, HALF_HIGH),
    bottom: halfCard(WIDE, [0, -HALF + 0.4, Z], 0, TOP_HALF, HALF_HIGH),
    right: halfCard(TALL, [HALF - 0.25, 0, Z], 0, [0, 0], [0.5, 1]),
    left: halfCard(TALL, [-HALF + 0.25, 0, Z], 0, [0.5, 0], [0.5, 1]),
  },
  above: {
    top: halfCard(WIDE, [0, HALF - 0.4, Z], Math.PI, TOP_HALF, HALF_HIGH),
    bottom: halfCard(WIDE, [0, -HALF + 0.4, Z], 0, TOP_HALF, HALF_HIGH),
    right: halfCard(WIDE, [HALF - 0.4, 0, Z], Math.PI / 2, TOP_HALF, HALF_HIGH),
    left: halfCard(
      WIDE,
      [-HALF + 0.4, 0, Z],
      -Math.PI / 2,
      TOP_HALF,
      HALF_HIGH,
    ),
  },
  below: {
    top: halfCard(WIDE, [0, HALF - 0.4, Z], 0, BOTTOM_HALF, HALF_HIGH),
    bottom: halfCard(
      WIDE,
      [0, -HALF + 0.4, Z],
      Math.PI,
      BOTTOM_HALF,
      HALF_HIGH,
    ),
    right: halfCard(
      WIDE,
      [HALF - 0.4, 0, Z],
      -Math.PI / 2,
      BOTTOM_HALF,
      HALF_HIGH,
    ),
    left: halfCard(
      WIDE,
      [-HALF + 0.4, 0, Z],
      Math.PI / 2,
      BOTTOM_HALF,
      HALF_HIGH,
    ),
  },
}

// ---- Card images -------------------------------------------------------------------

// Keeps one card image's failure to itself: if it doesn't load, only that
// image is missing and the coloured wall or border beneath still shows.
// No retry; the plain colour is a quiet enough fallback. Keyed by the
// image, so a change of deck (or of the Star/Moon switch) tries afresh.
class CardFallback extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: Error) {
    console.warn('Cube of Space: a card image failed to load', error)
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

// Seen from outside, every face is turned outward (reflected through its
// own plane) and every card image flipped left to right about the card's
// middle, so the cards read the right way round and each edge's two halves
// still meet on the correct sides of their corner.
const OutsideContext = createContext(false)

// A card image, loading on its own so the walls show at once.
function Card({ src, children }: { src: string; children: ReactNode }) {
  return (
    <CardFallback key={src}>
      <Suspense fallback={null}>{children}</Suspense>
    </CardFallback>
  )
}

// Half of an edge's key. The texture is cloned: the window into the image
// (offset and repeat) lives on the texture, and each half needs its own.
function EdgeHalf({ src, half }: { src: string; half: HalfCard }) {
  const shared = useLoader(TextureLoader, src) as Texture
  const outside = useContext(OutsideContext)
  const texture = useMemo(() => {
    const t = shared.clone()
    t.colorSpace = SRGBColorSpace
    const [u, v] = half.uvOffset
    const [ru, rv] = half.uvRepeat
    t.offset.set(outside ? 1 - u : u, v)
    t.repeat.set(outside ? -ru : ru, rv)
    t.needsUpdate = true
    return t
  }, [shared, half, outside])
  // Clones left behind by a change of card style would otherwise pile up
  // on the GPU.
  useEffect(() => () => texture.dispose(), [texture])
  return (
    <mesh position={half.position} rotation={half.rotation}>
      <planeGeometry args={half.size} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  )
}

function FaceCard({ src, rotation }: { src: string; rotation?: Vec3 }) {
  const shared = useLoader(TextureLoader, src) as Texture
  const outside = useContext(OutsideContext)
  const texture = useMemo(() => {
    const t = shared.clone()
    t.colorSpace = SRGBColorSpace
    if (outside) {
      t.offset.set(1, 0)
      t.repeat.set(-1, 1)
    }
    t.needsUpdate = true
    return t
  }, [shared, outside])
  useEffect(() => () => texture.dispose(), [texture])
  return (
    <mesh position={[0, 0, 0.01]} rotation={rotation ?? [0, 0, 0]}>
      <planeGeometry args={[1.0, 1.6]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  )
}

// ---- The scene ---------------------------------------------------------------------

function Face({
  face,
  style,
  starMoon,
}: {
  face: CubeFace
  style: CardStyle
  starMoon: boolean
}) {
  const place = PLACEMENT[face.id]
  const outside = useContext(OutsideContext)
  return (
    <group
      position={place.position}
      rotation={place.rotation}
      scale={outside ? [1, 1, -1] : [1, 1, 1]}
    >
      <mesh>
        <planeGeometry args={[2 * HALF, 2 * HALF]} />
        <meshBasicMaterial color={colorOf(face.letter)} toneMapped={false} />
      </mesh>
      {SIDES.map((side) => {
        const edge = EDGE_BY_ID[face.borders[side]]
        const src = cardImage(keyLetter(edge.letter, starMoon), style)
        return (
          <group key={side}>
            <mesh position={[0, 0, 0.005]}>
              <shapeGeometry args={[BORDER_SHAPES[side]]} />
              <meshBasicMaterial
                color={colorOf(edge.letter)}
                toneMapped={false}
              />
            </mesh>
            <Card src={src}>
              <EdgeHalf src={src} half={HALVES[place.halves][side]} />
            </Card>
          </group>
        )
      })}
      <Card src={cardImage(face.letter, style)}>
        <FaceCard
          src={cardImage(face.letter, style)}
          rotation={place.cardRotation}
        />
      </Card>
    </group>
  )
}

// One dot sliding along an edge, its place a function of the time alone.
// While any dot is moving it asks for the next frame, so the canvas can
// otherwise draw only on demand.
function FlowDot({
  start,
  end,
  phase,
}: {
  start: Vec3
  end: Vec3
  phase: number
}) {
  const ref = useRef<Mesh>(null)
  useFrame(({ clock, invalidate }) => {
    if (!ref.current) return
    const t = (clock.elapsedTime * FLOW_SPEED + phase) % 1
    ref.current.position.set(
      start[0] + (end[0] - start[0]) * t,
      start[1] + (end[1] - start[1]) * t,
      start[2] + (end[2] - start[2]) * t,
    )
    invalidate()
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[FLOW_SIZE, 12, 12]} />
      <meshBasicMaterial
        color="white"
        transparent
        opacity={FLOW_OPACITY}
        toneMapped={false}
      />
    </mesh>
  )
}

function Flow() {
  return (
    <>
      {EDGES.map((edge) => {
        const [start, end] = flowEnds(edge.id)
        return Array.from({ length: FLOW_COUNT }, (_, i) => (
          <FlowDot
            key={`${edge.id}-${i}`}
            start={start}
            end={end}
            phase={i / FLOW_COUNT}
          />
        ))
      })}
    </>
  )
}

export interface CubeSceneProps {
  cardStyle: CardStyle
  // The Star on Qoph's edge and the Moon on Tzaddi's.
  starMoon?: boolean
  // Dots running along each edge in the direction of its current.
  flow: boolean
  // Seen from outside, turning the cube in the hand, rather than from its
  // centre.
  outside?: boolean
}

// The cube's contents: walls, borders, cards and flow, with no camera or
// controls, so it can be placed in any canvas.
export function CubeScene({
  cardStyle,
  starMoon = false,
  flow,
  outside = false,
}: CubeSceneProps) {
  // Deferred, so a change of style keeps the current cards on show while
  // the new ones load.
  const style = useDeferredValue(cardStyle)
  const invalidate = useThree((state) => state.invalidate)
  // Frames are drawn on demand; one is needed when flow is switched off,
  // to clear the dots.
  useEffect(() => invalidate(), [flow, style, outside, invalidate])
  return (
    <OutsideContext.Provider value={outside}>
      {FACES.map((face) => (
        <Face key={face.id} face={face} style={style} starMoon={starMoon} />
      ))}
      {flow && <Flow />}
    </OutsideContext.Provider>
  )
}

// Inside, the camera turns in place at the centre of the cube; the wheel
// and a pinch zoom the lens, and a drag turns more slowly when zoomed in.
// Outside, it orbits the cube like an object in the hand, the wheel and a
// pinch moving it nearer or further.
const FOV = 90
// A tall, narrow screen gets a wider view, so a whole face still fits.
const FOV_PORTRAIT = 118
const MIN_FOV = 35
const MAX_FOV = 125
const ROTATE_SPEED = 0.4
const OUTSIDE_FOV = 40
const OUTSIDE_ROTATE_SPEED = 0.6
// How much of the shorter side of the window the cube's corners span when
// the outside view opens.
const OUTSIDE_FILL = 0.8
// The outside view's angle: turned this far round from square on (so the
// face to its left shows too), and raised this far above level.
const OUTSIDE_TURN = (35 * Math.PI) / 180
const OUTSIDE_TILT = (25 * Math.PI) / 180
// The depth range each view needs. The layers of a face (wall, borders,
// cards) lie a hundredth of a unit apart, so the near plane must not be
// set closer than the view needs, or those layers flicker through each
// other as the cube turns.
const INSIDE_NEAR = 0.01
const INSIDE_FAR = 10
const OUTSIDE_NEAR = 0.5
const OUTSIDE_FAR = 60
const UP = new Vector3(0, 1, 0)
const EAST_AXIS = new Vector3(1, 0, 0)
const EPS = 0.001

export function CubeRig({ outside = false }: { outside?: boolean }) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null)
  const fov = useRef<number | null>(null)
  const get = useThree((state) => state.get)
  const invalidate = useThree((state) => state.invalidate)

  // Move between the views, keeping the same face in front: inside you
  // look at it from the centre, outside you look at it from beyond it.
  useEffect(() => {
    const { camera, size } = get()
    const cam = camera as PerspectiveCamera
    const look = new Vector3()
    cam.getWorldDirection(look)
    if (outside) {
      // Leaving the inside: stand out beyond the face that was in view.
      if (cam.position.length() < 1) look.negate()
      else look.copy(cam.position).normalize().negate()
      const fit = Math.min(1, size.width / size.height)
      const radius = HALF * Math.sqrt(3)
      const distance =
        radius /
        Math.sin(
          Math.atan(
            Math.tan((OUTSIDE_FOV * Math.PI) / 360) * fit * OUTSIDE_FILL,
          ),
        )
      // Not square on to it but a little round to one side and above, as
      // you'd hold a cube to see that it is one: three faces in view, the
      // one you were facing foremost.
      const out = look.negate()
      if (Math.abs(out.y) < 0.9) {
        out.applyAxisAngle(UP, -OUTSIDE_TURN)
        const level = Math.hypot(out.x, out.z)
        out.set(
          (out.x / level) * Math.cos(OUTSIDE_TILT),
          Math.sin(OUTSIDE_TILT),
          (out.z / level) * Math.cos(OUTSIDE_TILT),
        )
      } else {
        out.applyAxisAngle(EAST_AXIS, Math.sign(out.y) * OUTSIDE_TILT)
      }
      cam.position.copy(out).multiplyScalar(distance)
      cam.lookAt(0, 0, 0)
      cam.fov = OUTSIDE_FOV
      cam.near = OUTSIDE_NEAR
      cam.far = OUTSIDE_FAR
    } else {
      // Entering: look from the centre at the face that was nearest.
      if (cam.position.length() > 1) look.copy(cam.position).normalize()
      cam.position.copy(look).multiplyScalar(-EPS)
      cam.lookAt(0, 0, 0)
      cam.near = INSIDE_NEAR
      cam.far = INSIDE_FAR
      fov.current ??= size.width < size.height ? FOV_PORTRAIT : FOV
      cam.fov = fov.current
    }
    cam.updateProjectionMatrix()
    if (controls.current) {
      controls.current.target.set(0, 0, 0)
      controls.current.rotateSpeed = outside
        ? OUTSIDE_ROTATE_SPEED
        : (-ROTATE_SPEED * (fov.current ?? FOV)) / FOV
      controls.current.update()
    }
    invalidate()
  }, [outside, get, invalidate])

  useLensZoom({
    enabled: !outside,
    fov,
    min: MIN_FOV,
    max: MAX_FOV,
    fallback: FOV,
    onZoom: (next) => {
      if (controls.current) {
        controls.current.rotateSpeed = (-ROTATE_SPEED * next) / FOV
      }
    },
  })

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      target={[0, 0, 0]}
      enablePan={false}
      enableZoom={outside}
      minDistance={outside ? HALF * 2.2 : EPS}
      maxDistance={outside ? HALF * 9 : EPS}
    />
  )
}

// The cube in the shared model canvas. The container's size is left to
// the caller.
export function CubeOfSpaceCanvas(props: CubeSceneProps) {
  return (
    <ModelCanvas
      // Just west of the centre, so the first view is of the east face.
      camera={{
        position: [-0.001, 0, 0],
        fov: FOV,
        near: INSIDE_NEAR,
        far: INSIDE_FAR,
      }}
      flat
    >
      <CubeScene {...props} />
      <CubeRig outside={props.outside} />
    </ModelCanvas>
  )
}
