# Body models

`body-female.glb` and `body-male.glb` are the realistic female and male
bodies from Blender Studio's **Human Base Meshes** bundle (v1.4.1),
released by the Blender Foundation under **CC0 1.0** (public domain):
https://www.blender.org/download/demo-files/

Exported with Blender 4.5 LTS: the first level of each body's sculpted
(multires) detail applied, centred with the soles at the origin, no
materials or UVs, Draco-compressed. The eyes are kept as separate meshes.

They are decoded with Google's Draco decoder (Apache License 2.0), copied
from three.js into `public/draco/`.
