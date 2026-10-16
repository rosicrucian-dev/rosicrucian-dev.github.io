import { useEffect, useState } from 'react'
import {
  BackSide,
  type CanvasTexture,
  DoubleSide,
  MeshBasicMaterial,
  Vector3,
} from 'three'
import { type Fonts } from '@/components/model/fonts'
import { useTexture } from '@/lib/canvasTexture'
import {
  SPHERE_RADIUS,
  sphereCentre,
  SPHERES,
  type Sphere,
  type TreeLayout,
} from '@/lib/treeOfLife'
import { LABEL_SPAN, labelTexture, sphereTexture } from './textures'
import { Glow } from './Glow'
import { OVERVIEW_FOV, sphereScale } from './layout'
import { SPHERE_ORDER } from './renderOrder'

// A Sephirah: a sphere of its colour, seen from within (and, in the
// overview, from without), with doorways cut where its tunnels leave.
export function SephirahSphere({
  room,
  fonts,
  overview,
  layout,
}: {
  room: Sphere
  fonts: Fonts
  overview: boolean
  layout: TreeLayout
}) {
  const map = useTexture(() => sphereTexture(room))
  const outside = useTexture(() =>
    sphereTexture(room, { glows: false, doors: layout === 'tree' }),
  )
  const label = useTexture(() => labelTexture(room, fonts))
  const [litFromKether] = useState(() => keterLit(room, outside, label, layout))
  useEffect(() => () => litFromKether.dispose(), [litFromKether])
  const centre = sphereCentre(room.id, layout)
  return (
    <group position={centre} scale={sphereScale(layout)}>
      <mesh renderOrder={overview ? SPHERE_ORDER : 0}>
        <sphereGeometry args={[SPHERE_RADIUS, 64, 32]} />
        {overview ? (
          <primitive object={litFromKether} attach="material" />
        ) : (
          <meshBasicMaterial
            map={map}
            side={BackSide}
            alphaTest={0.5}
            toneMapped={false}
          />
        )}
      </mesh>
      {overview && <Glow room={room} layout={layout} />}
    </group>
  )
}

// ---- Light ---------------------------------------------------------------------

// Seen from outside, each sphere is shaded as BOTA paints them, lit from
// Kether: brightest on the side facing it, with a soft highlight there,
// and falling into shadow on the side away. Not real lighting (nothing
// casts a shadow) but painted light. Kether itself is the source, lit
// evenly. The light comes from Kether's direction across the Tree and also
// from above, towards whoever looks down on it, so the lit side faces
// the viewer.
// The label is painted onto the sphere's face turned towards the outside
// view's first, straight-down view, upright with Kether at the top:
// wrapped round the ball by angle, so it curves with it like writing on a
// beach ball, and turning with the sphere when the Tree is turned.
//
// Each label faces the camera's default place, above the middle of the
// Tree, rather than straight up: the outer spheres are seen a little from
// the side, and a label facing straight up would sit off their middle
// (Kether's high, Malkuth's low). The place is taken for a window of 16:10;
// other shapes move the camera only a little.
function treeMiddle(layout: TreeLayout): Vector3 {
  const centres = SPHERES.map((r) => new Vector3(...sphereCentre(r.id, layout)))
  return centres
    .reduce((sum, c) => sum.add(c), new Vector3())
    .multiplyScalar(1 / centres.length)
}

function labelAxes(room: Sphere, layout: TreeLayout) {
  const zs = SPHERES.map((r) => sphereCentre(r.id, layout)[2])
  const height = Math.max(...zs) - Math.min(...zs) + SPHERE_RADIUS * 3.6
  const distance =
    height / 2 / (Math.tan(((OVERVIEW_FOV / 2) * Math.PI) / 180) * 0.92)
  const eye = treeMiddle(layout).add(new Vector3(0, distance, 0))
  const facing = eye
    .sub(new Vector3(...sphereCentre(room.id, layout)))
    .normalize()
  // Upright on the screen: towards Kether, which lies up the screen.
  const right = new Vector3().crossVectors(new Vector3(0, 0, -1), facing)
  right.normalize()
  const up = new Vector3().crossVectors(facing, right)
  return { facing, right, up }
}

function keterLit(
  room: Sphere,
  map: CanvasTexture,
  label: CanvasTexture,
  layout: TreeLayout,
): MeshBasicMaterial {
  const material = new MeshBasicMaterial({
    map,
    side: DoubleSide,
    alphaTest: 0.5,
    toneMapped: false,
  })
  const [cx, , cz] = sphereCentre(room.id, layout)
  const [kx, , kz] = sphereCentre('kether', layout)
  const across = new Vector3(kx - cx, 0, kz - cz)
  // Kether is the light, and Tiphareth, the Sun, a light of its own: they
  // are lit evenly, with no shadow. Tiphareth keeps a soft white sheen
  // across its top, as BOTA paints it.
  const source = room.id === 'kether' || room.id === 'tiphareth'
  const sheen = room.id === 'tiphareth'
  const light = (across.lengthSq() > 0 ? across.normalize() : new Vector3())
    .multiplyScalar(1.0)
    .add(new Vector3(0, 0.5, 0))
    .normalize()
  const axes = labelAxes(room, layout)
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uLight = { value: light }
    shader.uniforms.uSource = { value: source ? 1 : 0 }
    shader.uniforms.uSheen = { value: sheen ? 1 : 0 }
    // Malkuth's colour-cross has no glassy rim, but a soft shadow at its
    // edge.
    shader.uniforms.uGlass = { value: room.id === 'malkuth' ? 0 : 1 }
    shader.uniforms.uLabel = { value: label }
    shader.uniforms.uSpan = { value: LABEL_SPAN }
    shader.uniforms.uFacing = { value: axes.facing }
    shader.uniforms.uRight = { value: axes.right }
    shader.uniforms.uUp = { value: axes.up }
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vLitNormal;\nvarying vec3 vLitWorld;',
      )
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvLitNormal = normalize(mat3(modelMatrix) * normal);\nvLitWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;',
      )
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vLitNormal;
        varying vec3 vLitWorld;
        uniform vec3 uLight;
        uniform float uSource;
        uniform float uSheen;
        uniform float uGlass;
        uniform sampler2D uLabel;
        uniform float uSpan;
        uniform vec3 uFacing;
        uniform vec3 uRight;
        uniform vec3 uUp;`,
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        // The label, wrapped round the ball by angle, laid on the colour
        // before the light so it is shaded with the sphere like paint.
        vec3 nL = normalize(vLitNormal);
        float inked = 0.0;
        float front = dot(nL, uFacing);
        if (front > 0.0) {
          float lon = atan(dot(nL, uRight), front);
          float lat = asin(clamp(dot(nL, uUp), -1.0, 1.0));
          vec2 luv = vec2(lon, lat) / (2.0 * uSpan) + 0.5;
          if (all(greaterThan(luv, vec2(0.0))) && all(lessThan(luv, vec2(1.0)))) {
            vec4 ink = texture2D(uLabel, luv);
            diffuseColor.rgb = mix(diffuseColor.rgb, ink.rgb, ink.a);
            inked = ink.a;
          }
        }
        // Painted light, as BOTA airbrushes its spheres: from Kether, a
        // broad soft brightening on the side towards it and a deeper tone
        // away; a saturated core; and the colour lifting towards white just
        // inside the outline, so each reads as a ball of glowing glass.
        // Kether and Tiphareth, the lights themselves, take only the rim.
        float toward = dot(nL, uLight); // -1 away from Kether, 1 towards
        vec3 base = diffuseColor.rgb;
        vec3 pale = mix(base, vec3(1.0), 0.42);
        float shade = mix(mix(0.5, 1.22, smoothstep(-0.8, 0.9, toward)), 1.0, uSource);
        vec3 col = base * shade;
        col = mix(col, pale, smoothstep(0.4, 1.0, toward) * 0.42 * (1.0 - uSource) * uGlass);
        vec3 V = normalize(cameraPosition - vLitWorld);
        float rim = pow(1.0 - max(dot(nL, V), 0.0), 3.4);
        col = mix(col, pale, rim * mix(0.6, 0.35, uSource) * uGlass);
        // Malkuth instead darkens softly towards its edge, as BOTA shades
        // its colour-cross: light in the middle, deeper at the rim.
        float edge = pow(1.0 - max(dot(nL, V), 0.0), 0.9);
        col *= mix(1.0, mix(1.3, 0.45, edge), 1.0 - uGlass);
        diffuseColor.rgb = col
          + vec3(uSheen * 0.5 * smoothstep(-0.45, 0.75, dot(nL, uUp)) * (1.0 - inked));`,
      )
  }
  material.customProgramCacheKey = () => 'lit-from-kether'
  return material
}
