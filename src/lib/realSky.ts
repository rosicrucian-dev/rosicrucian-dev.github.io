// Where the sphere sits in a real observer's sky.
//
// The sphere is pinned to the stars (ecliptic coordinates, longitude counted
// from Regulus as 0° Leo; see treeOfLifeSphere.ts), so lining it up with the sky
// over someone's head is one rotation, which depends only on where they are
// and what time it is. No ephemeris: the stars don't move, the Earth turns.
//
// The local frame used throughout is X east, Y up, Z south. That is the
// frame three.js's camera and the device-orientation sensors share, so a
// camera turned by the phone's sensors looks at the right part of it.

import type { Vec3 } from './treeOfLifeSphere'

const DEG = Math.PI / 180

// Regulus's ecliptic longitude at J2000. The sphere calls it 120° (0° Leo).
// The same value the baked star data was shifted by (scripts/gen-sky.ts).
const REGULUS_LONGITUDE = 149.8292
const SPHERE_TO_ECLIPTIC = REGULUS_LONGITUDE - 120

// Per Julian century: how far the equinox slides back along the ecliptic
// (which moves every star's longitude forward), and how the tilt of the
// Earth's axis changes. The star data is for the year 2000; this carries
// it to today, a shift of about a third of a degree so far.
const PRECESSION = 1.396971
const OBLIQUITY_J2000 = 23.4392911
const OBLIQUITY_RATE = -0.0130042

export interface Observer {
  // Degrees: north and east positive.
  latitude: number
  longitude: number
}

// Julian centuries since J2000, and Greenwich mean sidereal time in degrees.
function timeOf(date: Date): { centuries: number; gmst: number } {
  const days = date.getTime() / 86400000 + 2440587.5 - 2451545
  const centuries = days / 36525
  const gmst =
    280.46061837 +
    360.98564736629 * days +
    0.000387933 * centuries * centuries -
    (centuries * centuries * centuries) / 38710000
  return { centuries, gmst }
}

// The ordinary (tropical) ecliptic longitude, counted from the equinox of
// `date`, of a longitude on the sphere, which is counted from Regulus as
// 0° Leo (sidereal). The two differ by Regulus's tropical longitude less
// 120°, about 30° now, growing by the precession of the equinoxes.
export function tropicalLongitude(lon: number, date: Date): number {
  const { centuries } = timeOf(date)
  const value = lon + SPHERE_TO_ECLIPTIC + PRECESSION * centuries
  return ((value % 360) + 360) % 360
}

// A direction on the sphere (its own longitude and latitude, degrees) as a
// unit vector in the observer's local frame: X east, Y up, Z south.
export function toLocalSky(
  lon: number,
  lat: number,
  date: Date,
  observer: Observer,
): Vec3 {
  const { centuries, gmst } = timeOf(date)

  // Sphere -> ecliptic of date.
  const lambda = (lon + SPHERE_TO_ECLIPTIC + PRECESSION * centuries) * DEG
  const beta = lat * DEG
  const x = Math.cos(beta) * Math.cos(lambda)
  const y = Math.cos(beta) * Math.sin(lambda)
  const z = Math.sin(beta)

  // Ecliptic -> equatorial: tilt by the obliquity. X stays on the equinox,
  // Z becomes the north celestial pole.
  const eps = (OBLIQUITY_J2000 + OBLIQUITY_RATE * centuries) * DEG
  const ex = x
  const ey = y * Math.cos(eps) - z * Math.sin(eps)
  const ez = y * Math.sin(eps) + z * Math.cos(eps)

  // Equatorial -> the observer's meridian: turn by the local sidereal time.
  // `meridian` points where the celestial equator crosses due south.
  const lst = (gmst + observer.longitude) * DEG
  const meridian = ex * Math.cos(lst) + ey * Math.sin(lst)
  const east = -ex * Math.sin(lst) + ey * Math.cos(lst)

  // Meridian -> horizon: tip by the latitude.
  const phi = observer.latitude * DEG
  const north = -meridian * Math.sin(phi) + ez * Math.cos(phi)
  const up = meridian * Math.cos(phi) + ez * Math.sin(phi)

  return [east, up, -north]
}

// The rotation that carries the whole sphere into the observer's sky, as
// the images of the sphere's own X, Y and Z axes (the columns of a rotation
// matrix).
export function skyBasis(date: Date, observer: Observer): [Vec3, Vec3, Vec3] {
  return [
    toLocalSky(0, 0, date, observer),
    toLocalSky(0, 90, date, observer),
    // toVector puts longitude 270° on +Z.
    toLocalSky(270, 0, date, observer),
  ]
}

// A direction given in the equatorial frame of J2000 (X to the equinox, Z to
// the celestial pole; any length) as the sphere's own longitude and
// latitude, in degrees. The same conversion the baked stars went through,
// so anything placed this way lands among them correctly.
export function sphereFromEquatorial(
  x: number,
  y: number,
  z: number,
): { lon: number; lat: number } {
  const eps = OBLIQUITY_J2000 * DEG
  const ey = y * Math.cos(eps) + z * Math.sin(eps)
  const ez = -y * Math.sin(eps) + z * Math.cos(eps)
  const lon = Math.atan2(ey, x) / DEG - SPHERE_TO_ECLIPTIC
  return {
    lon: ((lon % 360) + 360) % 360,
    lat: Math.asin(ez / Math.hypot(x, ey, ez)) / DEG,
  }
}

// A point of the local sky as a unit vector: azimuth clockwise from north,
// altitude above the horizon, both in degrees.
export function fromHorizon(azimuth: number, altitude: number): Vec3 {
  const cos = Math.cos(altitude * DEG)
  return [
    Math.sin(azimuth * DEG) * cos,
    Math.sin(altitude * DEG),
    -Math.cos(azimuth * DEG) * cos,
  ]
}
