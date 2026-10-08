import { useEffect, useState } from 'react'
import { Color, ShaderMaterial, Vector3 } from 'three'
import {
  SPHERE_RADIUS,
  sphereCentre,
  type Sphere,
  type TreeLayout,
} from '@/lib/treeOfLife'
import type { SephirahId } from '@/lib/tree'
import { sphereScale } from './layout'
import { GLOW_ORDER, GLOW_PASS } from './renderOrder'

// ---- Glow ----------------------------------------------------------------------

// The light round a sphere seen from outside, as BOTA paints its Tree: a
// thin white rim hugging the sphere, then the sphere's own colour glowing
// out beyond it; Malkuth's glow is instead a narrow rainbow, with no white
// rim, as in BOTA's painting of the Kingdom. Drawn on a shell round the
// sphere: each point is lit by how far the line of sight through it passes
// from the sphere's centre, so the rim follows the sphere's true outline
// from any angle (a flat image would sit off it where perspective
// stretches the sphere).
const GLOW_REACH = 2.1 // the shell's radius, in sphere radii

// Kether, Tiphareth and Yesod shine out in pointed rays, as BOTA paints
// them, rather than a plain glow: Kether a white star of many sharp
// points, Tiphareth the Sun's broad golden rays, Yesod the Moon's few soft
// ones. Long and short rays alternate. `reach` is how far the long rays
// run, in sphere radii; `sharp` how fine their points.
const RAYS: Partial<
  Record<
    SephirahId,
    {
      count: number
      reach: number
      sharp: number
      strength: number
      // Kether's star, as BOTA paints it, has rays of three lengths in a
      // set pattern (`lengths`: short, medium, long, in sphere radii), the
      // long ones reaching out level to either side, and a strong white
      // haze about it (`haze`).
      uneven?: boolean
      lengths?: [number, number, number]
      haze?: number
    }
  >
> = {
  kether: {
    // Five to a quarter turn, so that rays point straight up, down and
    // across.
    count: 20,
    reach: 2.7,
    sharp: 0.6,
    strength: 1.5,
    uneven: true,
    lengths: [1.6, 2.0, 2.7],
    haze: 0.5,
  },
  tiphareth: { count: 12, reach: 2.7, sharp: 0.45, strength: 0.9 },
  yesod: { count: 8, reach: 2.2, sharp: 0.3, strength: 0.6 },
}

const glowVertex = `
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const glowFragment = `
  uniform vec3 uCentre;
  uniform float uRadius;
  uniform vec3 uColor;
  uniform float uRainbow;
  uniform float uReach;
  uniform float uRays;
  uniform float uRayReach;
  uniform float uRaySharp;
  uniform float uRayStrength;
  uniform float uUneven;
  uniform float uShort;
  uniform float uMedium;
  uniform float uLong;
  uniform float uHaze;
  uniform float uShell;
  varying vec3 vWorld;

  // The rainbow in six equal bands, red at the sphere's edge to violet
  // without, blended softly one into the next; green and yellow, which
  // the eye sees brightest, are set a little lower so no band dominates.
  vec3 spectrum(float t) {
    vec3 bands[6];
    bands[0] = vec3(1.0, 0.08, 0.06);
    bands[1] = vec3(1.0, 0.42, 0.04);
    bands[2] = vec3(0.92, 0.8, 0.05);
    bands[3] = vec3(0.12, 0.7, 0.2);
    bands[4] = vec3(0.1, 0.35, 1.0);
    bands[5] = vec3(0.5, 0.15, 0.95);
    float f = clamp(t, 0.0, 0.999) * 6.0 - 0.5;
    int i = int(floor(clamp(f, 0.0, 4.999)));
    float k = smoothstep(0.0, 1.0, clamp(f - float(i), 0.0, 1.0));
    vec3 a = bands[0];
    vec3 b = bands[0];
    for (int n = 0; n < 6; n++) {
      if (n == i) a = bands[n];
      if (n == i + 1) b = bands[n];
    }
    return f < 0.0 ? bands[0] : mix(a, b, k);
  }

  void main() {
    vec3 d = normalize(vWorld - cameraPosition);
    vec3 o = uCentre - cameraPosition;
    float x = length(cross(d, o)) / uRadius; // 1 at the sphere's outline
    // Begun a little inside the outline: the sphere is drawn with flat
    // facets, whose edge falls just within the true circle, and the sphere
    // itself hides whatever of the glow lies behind it.
    if (x < 0.97) discard;
    vec3 light;
    if (uRainbow > 0.5) {
      // Ten-sided, as BOTA paints the Kingdom's light (Malkuth is the
      // tenth): the bands follow a decagon about the round sphere, red
      // filling out to it from the very edge with no dark gap.
      vec3 q = cameraPosition + d * dot(o, d) - uCentre;
      vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
      vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
      float a = atan(dot(q, right), dot(q, up));
      float side = 6.2831853 / 10.0;
      float phi = mod(a, side) - side * 0.5;
      // Softened at the corners, as an airbrush would.
      float poly = mix(1.0, cos(side * 0.5) / cos(phi), 0.85) + 0.02;
      float t = max(0.0, x / poly - 1.0) / 0.55;
      if (t > 1.0) discard;
      light = spectrum(t) * 0.8 * (1.0 - t * t);
    } else {
      // A soft white edge, and the sphere's own colour glowing well out.
      float rim = (1.0 - smoothstep(1.0, 1.1, x)) * 0.4;
      float glow = 1.05 * exp(-(x - 1.0) * 2.2)
        // Fading out to nothing before the shell's edge.
        * (1.0 - smoothstep(uReach * 0.62, uReach, x));
      light = vec3(rim) + uColor * glow;
      if (uRays > 0.5) {
        // Where round the sphere this point lies, as seen: its angle on the
        // screen about the sphere's centre.
        vec3 q = cameraPosition + d * dot(o, d) - uCentre;
        vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
        vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
        float a = atan(dot(q, up), dot(q, right));
        // A ray every 2π/uRays, long and short in turn; each tapers to its
        // point as it runs out.
        float k = a * uRays / 2.0;
        float index = floor(k / 3.14159265 + 0.5);
        float isLong = step(0.5, fract(index * 0.5));
        // How long this ray runs: long and short in turn, or (for Kether)
        // each its own length, longer the nearer it points level.
        float len = 1.0 + (uRayReach - 1.0) * mix(0.62, 1.0, isLong);
        if (uUneven > 0.5) {
          // Kether's pattern, counted clockwise from the ray pointing up:
          // short (up), medium, short, medium, short, long (across), and
          // back again to short (down), the same on the other side.
          float quarter = uRays / 4.0;
          float fromUp = mod(quarter - index, uRays);
          float place = mod(fromUp, 2.0 * quarter);
          float reach = place == quarter
            ? uLong
            : mod(place, 2.0) == 1.0 ? uMedium : uShort;
          len = reach;
        }
        float run = clamp((x - 1.0) / (len - 1.0), 0.0, 1.0);
        float width = pow(abs(cos(k)), 2.0 + 60.0 * uRaySharp * run);
        float ray = width * (1.0 - run) * (1.0 - run * 0.4);
        light += mix(uColor, vec3(1.0), 0.35) * ray * uRayStrength;
        // A white haze about the star.
        light += vec3(uHaze * exp(-(x - 1.0) * 2.0))
          * (1.0 - smoothstep(uShell * 0.6, uShell, x));
      }
    }
    // Glow only ever adds light.
    gl_FragColor = vec4(max(light, 0.0), 1.0);
  }
`

// A sphere's glow is its own colour, but Binah's black would cast none:
// BOTA paints a soft slate-blue light about it, dimmer than Mercy's.
// Yesod's deep purple, likewise, glows a brighter purple.
const GLOW_COLORS: Partial<Record<SephirahId, string>> = {
  binah: '#3f5a9a',
  yesod: '#8a3c96',
}

// How far out, in sphere radii, a sphere's glow shell must reach.
function glowShell(id: SephirahId): number {
  const rays = RAYS[id]
  if (!rays) return GLOW_REACH
  return Math.max(GLOW_REACH, rays.reach, ...(rays.lengths ?? []))
}

export function Glow({ room, layout }: { room: Sphere; layout: TreeLayout }) {
  const [material] = useState(
    () =>
      new ShaderMaterial({
        uniforms: {
          uCentre: { value: new Vector3(...sphereCentre(room.id, layout)) },
          // In world units: the shell itself is scaled with its sphere.
          uRadius: { value: SPHERE_RADIUS * sphereScale(layout) },
          // In the colour's own (sRGB) values: the shader writes them out
          // as they are, so they must not be taken into linear light first.
          uColor: {
            value: new Color(
              GLOW_COLORS[room.id] ?? room.color,
            ).convertLinearToSRGB(),
          },
          uRainbow: { value: room.id === 'malkuth' ? 1 : 0 },
          uReach: { value: GLOW_REACH },
          uRays: { value: RAYS[room.id]?.count ?? 0 },
          uRayReach: { value: RAYS[room.id]?.reach ?? 1 },
          uRaySharp: { value: RAYS[room.id]?.sharp ?? 0 },
          uRayStrength: { value: RAYS[room.id]?.strength ?? 0 },
          uUneven: { value: RAYS[room.id]?.uneven ? 1 : 0 },
          uShort: { value: RAYS[room.id]?.lengths?.[0] ?? 1 },
          uMedium: { value: RAYS[room.id]?.lengths?.[1] ?? 1 },
          uLong: { value: RAYS[room.id]?.lengths?.[2] ?? 1 },
          uHaze: { value: RAYS[room.id]?.haze ?? 0 },
          uShell: { value: glowShell(room.id) },
        },
        vertexShader: glowVertex,
        fragmentShader: glowFragment,
        ...GLOW_PASS,
      }),
  )
  useEffect(() => () => material.dispose(), [material])
  return (
    <mesh material={material} renderOrder={GLOW_ORDER}>
      <sphereGeometry args={[SPHERE_RADIUS * glowShell(room.id), 64, 48]} />
    </mesh>
  )
}
