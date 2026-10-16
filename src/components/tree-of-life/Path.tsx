import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import {
  Color,
  ShaderMaterial,
  DoubleSide,
  FrontSide,
  LineCurve3,
  AlwaysDepth,
  LessEqualDepth,
  MeshBasicMaterial,
  TubeGeometry,
  Vector3,
  type Mesh,
} from 'three'
import {
  tubeEnds,
  isAcross,
  SPHERE_RADIUS,
  sphereCentre,
  TUBE_RADIUS,
  type TreeLayout,
  type Tube,
} from '@/lib/treeOfLife'
import { DOOR_ANGLE, tubeTexture } from './textures'
import { ACROSS_ORDER, GLOW_ORDER, GLOW_PASS } from './renderOrder'

// How fast the light streams along a tunnel, lengths of its texture per
// second.
const FLOW_SPEED = 0.35

// A path: a tube of its colour between two rooms, its light streaming
// from `from` to `to` (the Way of Return).
// Wound close, as BOTA paints its spirals: a strand every 1.3 units, a
// little over half the tube's width.
const SPIRAL_PITCH = 2.6

// A tube's uv runs u along its length and v round it; the tunnel texture
// is painted for v along and u round, as on a cylinder.
function copyUv(g: TubeGeometry) {
  const uv = g.attributes.uv
  for (let k = 0; k < uv.count; k++) {
    const u = uv.getX(k)
    uv.setXY(k, uv.getY(k), u)
  }
}

// The light round a path seen from outside, as BOTA paints its paths: a
// bright white rim along each edge, fading into a soft white glow. Like the
// spheres', it is drawn on a shell round the tube and lit by how near the
// line of sight passes to the tube's axis, so it follows the tube's true
// outline from any angle. Where a path across passes over one that runs up
// the Tree, the lower path's glow is not drawn over it.
const PATH_GLOW_REACH = 2.6

const pathGlowVertex = `
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const pathGlowFragment = `
  uniform vec3 uA;
  uniform vec3 uB;
  uniform float uRadius;
  uniform float uReach;
  varying vec3 vWorld;

  void main() {
    // How near the line of sight through this point passes to the axis.
    vec3 d = normalize(vWorld - cameraPosition);
    vec3 u = normalize(uB - uA);
    vec3 n = cross(d, u);
    float len = length(n);
    float gap = len > 1e-4
      ? abs(dot(cameraPosition - uA, n / len))
      : length(cross(cameraPosition - uA, u));
    float x = gap / uRadius; // 1 at the tube's outline
    if (x < 0.97) discard;
    // A soft white haze, as BOTA airbrushes its paths: brightest at the
    // tube's edge but spread well out from it, fading to nothing.
    float rim = (1.0 - smoothstep(1.0, 1.35, x)) * 0.42;
    float glow = 0.42 * exp(-(max(x, 1.0) - 1.0) * 2.0)
      * (1.0 - smoothstep(uReach * 0.6, uReach, x));
    gl_FragColor = vec4(vec3(max(rim + glow, 0.0)), 1.0);
  }
`

function pathGlow(tunnel: Tube, layout: TreeLayout): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      uA: { value: new Vector3(...sphereCentre(tunnel.from, layout)) },
      uB: { value: new Vector3(...sphereCentre(tunnel.to, layout)) },
      uRadius: { value: isAcross(tunnel) ? ACROSS_RADIUS : TUBE_RADIUS },
      uReach: { value: PATH_GLOW_REACH },
    },
    vertexShader: pathGlowVertex,
    fragmentShader: pathGlowFragment,
    ...GLOW_PASS,
  })
}

// A path's spiral catches the light where the tube faces the eye, down the
// middle of the path, and fades into the path's own colour towards its
// edges, where the tube turns away; the tube itself deepens a little at
// its edges. So it reads as a rounded, polished cord, as BOTA paints it.
function catchLight(
  material: MeshBasicMaterial,
  color: string,
): MeshBasicMaterial {
  const before = material.onBeforeCompile
  const key = material.customProgramCacheKey
  material.onBeforeCompile = (shader, renderer) => {
    before.call(material, shader, renderer)
    shader.uniforms.uPathColor = { value: new Color(color) }
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vSheenNormal;\nvarying vec3 vSheenView;',
      )
      .replace(
        '#include <project_vertex>',
        `#include <project_vertex>
        vSheenNormal = normalize(normalMatrix * normal);
        vSheenView = -mvPosition.xyz;`,
      )
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vSheenNormal;
        varying vec3 vSheenView;
        uniform vec3 uPathColor;`,
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        float facing = abs(dot(normalize(vSheenNormal), normalize(vSheenView)));
        diffuseColor.rgb = mix(uPathColor, diffuseColor.rgb, pow(facing, 1.4));
        diffuseColor.rgb *= mix(0.72, 1.0, facing);`,
      )
  }
  material.customProgramCacheKey = () => `sheen-${key.call(material)}`
  return material
}

// How full a path across the Tree is drawn from outside.
export const ACROSS_RADIUS = TUBE_RADIUS * 1.12

// Where a tunnel meets its room: flush with the doorway cut in the room's
// wall, so it neither sticks into the room as a lip (whose rim would show
// as a thin line) nor stops short of it. A hair inside, to cover the
// sphere's facets.
const DOOR_SET = SPHERE_RADIUS * Math.cos(DOOR_ANGLE) - 0.03

export function PathTube({
  tunnel,
  flow,
  overview,
  layout,
  hidden,
}: {
  tunnel: Tube
  flow: boolean
  overview: boolean
  layout: TreeLayout
  // Walking a path that crosses this one: not drawn, so that path runs on
  // alone.
  hidden: boolean
}) {
  // Straight from doorway to doorway, each a little inside its room's
  // wall.
  const [geometry] = useState(() => {
    const [a, b] = tubeEnds(tunnel, tunnel.from, DOOR_SET, layout)
    const curve = new LineCurve3(new Vector3(...a), new Vector3(...b))
    const g = new TubeGeometry(curve, 96, TUBE_RADIUS, 48, false)
    copyUv(g)
    // From outside a path across is drawn a little fuller than the paths
    // it crosses, so it wholly encloses them where they meet it and runs
    // solid from end to end.
    const outsideRadius = isAcross(tunnel) ? ACROSS_RADIUS : TUBE_RADIUS
    const outer = new TubeGeometry(curve, 96, outsideRadius, 48, false)
    copyUv(outer)
    // The glow's shell runs on from centre to centre, so its open ends lie
    // deep inside the spheres, hidden from every side; ended at the
    // doorways, as the tube does, it is wider than the tube there and its
    // ends would show past the spheres' outline as hard edges in the haze.
    const rim = new TubeGeometry(
      new LineCurve3(
        new Vector3(...sphereCentre(tunnel.from, layout)),
        new Vector3(...sphereCentre(tunnel.to, layout)),
      ),
      48,
      outsideRadius * PATH_GLOW_REACH,
      24,
      false,
    )
    return { g, outer, rim, length: curve.getLength() }
  })
  const [map] = useState(() => {
    const t = tubeTexture(tunnel.color)
    // Once round the tube per tile, so just the two strands wind along
    // it, a full turn every SPIRAL_PITCH units.
    t.repeat.set(1, geometry.length / SPIRAL_PITCH)
    return t
  })
  useEffect(
    () => () => {
      map.dispose()
      geometry.g.dispose()
      geometry.rim.dispose()
      geometry.outer.dispose()
    },
    [map, geometry],
  )
  const [materials] = useState(() => ({
    wall: catchLight(
      new MeshBasicMaterial({ map, side: DoubleSide, toneMapped: false }),
      tunnel.color,
    ),
    // From outside: a path across drawn over those it crosses.
    outer: catchLight(
      new MeshBasicMaterial({
        map,
        // Drawn over whatever is there, a path across shows only its near
        // face, or its far side would show through it.
        side: isAcross(tunnel) ? FrontSide : DoubleSide,
        toneMapped: false,
        // Passing the depth test always, rather than skipping it: with the
        // test off WebGL marks no depth either, and the spheres drawn after
        // would cover the path wherever they overlap it on screen, cutting
        // it off at their outline instead of letting it run into them.
        depthFunc: isAcross(tunnel) ? AlwaysDepth : LessEqualDepth,
      }),
      tunnel.color,
    ),
    rim: pathGlow(tunnel, layout),
  }))
  useEffect(
    () => () => {
      materials.wall.dispose()
      materials.outer.dispose()
      materials.rim.dispose()
    },
    [materials],
  )
  const mesh = useRef<Mesh>(null)
  const invalidate = useThree((s) => s.invalidate)
  useFrame((_, delta) => {
    if (!flow) return
    // Texture v runs from the tube's start (`from`) to its end; lowering
    // the offset slides the bands towards `to`.
    const material = mesh.current?.material as MeshBasicMaterial | undefined
    if (material?.map)
      material.map.offset.y -= Math.min(delta, 0.05) * FLOW_SPEED
    invalidate()
  })
  return (
    <>
      <mesh
        ref={mesh}
        geometry={overview ? geometry.outer : geometry.g}
        material={overview ? materials.outer : materials.wall}
        renderOrder={overview && isAcross(tunnel) ? ACROSS_ORDER : 0}
        visible={!hidden}
      />
      {/* Seen from outside, a thin white rim of light along the path. */}
      {overview && (
        <mesh
          geometry={geometry.rim}
          material={materials.rim}
          renderOrder={GLOW_ORDER}
        />
      )}
    </>
  )
}
