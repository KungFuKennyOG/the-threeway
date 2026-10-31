# Goon style guide

Read this before you make or change a goon (an enemy). It exists because a batch of 15 goons shipped as uniforms instead of characters. They had the right clothes and the right fighting style, but no flair. Next to the originals they looked bland. Every goon must hold up beside the originals: the boxer, Bat Boy, Rocco, the bōsōzoku punk, the neon kicker, Aoki Security, the wrestler, the cook, Ivan, Volkov.

## The rule: characters, not uniforms

A goon is a character you'd recognise from across the room. "A clerk in a waistcoat" is a uniform. "A sweating clerk in a green eyeshade, hugging a tower of files, holding up a rubber stamp like a weapon" is a character.

## Checklist (every goon, every time)

1. **One loud signature shape** you can read at 10 m in silhouette: giant gloves, a bat, a riot shield, a pompadour, a long coat, a barrel chest, a plumed hat, a giant moustache, a flagpole, an instrument. If you can't name it in three words, the goon doesn't have one.
2. **Pushed proportions.** Don't use one default body. Push it: huge forearms and hands, barrel chests on short legs, skinny limbs, refrigerator shoulders with a tiny head, a belly. Exaggerate until it reads, then keep going a little.
3. **A face with a personality.** It should be big and distinct, with a strong jaw or none, heavy brows, a scowl, a grin, a beard, a moustache, scars, glasses or shades. No two goons share a face type.
4. **Dense hand-pixeled sheets, not flat colour blocks.** Paint graphic motifs (a star, patches, flames, checks, stripes, a cog, medals), highlights and shadows, folds, wear, stitching and dither. Use the original sheets' density as the target: they use 17–29 colours, and goonkit allows up to 32 on goon sheets. Paint every face from scratch, never from a shared template. If a sheet looks like a flag, it's not finished.
5. **Attitude in the idle pose.** Guards up, a wide stance, a hunch, a swagger, ramrod posture, a crouch. A neutral stance with the arms down is forbidden.
6. **Distinct front, back and side panels.** No tie on a back. Give the back something too: a number, a patch, a coat seam, hair.
7. **Their gear is part of the read**, not hidden. The prop, the hat and the instrument are drawn big enough to see in VR.
8. **Value contrast in the bar's light.** A dark suit or coat vanishes against the wood. Every goon needs a bright mass (white, red or gold); avoid dark-on-dark.
9. **The face must show at the player's eye height** (about 1.65 m, looking slightly down). Caps, visors, fur collars, raised shoulders and big chests easily hide a face.

## Kit notes (from the first flair pass)

- **Use `lean` in `humanoid()`.** It subdivides only the face and the chest front, which frees about 54 triangles for signature boxes.
- **Push proportions within the fixed skeleton.** Joint lengths drive the physics, so don't change them. Push thickness with `armK`, `farmK`, `handK`, `legK`, `shinK`, `neckW`, and fake short legs with stance and low belly boxes.
- **Extra boxes:** one panel wraps every face of an extra box unless you split it, so a badge ends up on the back too. `peakedCap()` already splits its side and back.
- **Boxes on a raised forearm:** the local front faces backwards, so a held board needs its paper on `b`.
- **Side panels:** they're mirrored front to back between the left and right faces.

## The bar for done

- Render a lineup that mixes the new goon with the originals, front and back, in the bar's light. Zoom in.
- If it is the blandest one in the row, it isn't done.
- Show the owner that lineup before calling it finished.

## Hard limits (these don't change)

- Invented people only. No real leaders and no real-world symbols; Krasnovia's emblem is a gold cogwheel.
- Sheets are 64x128, with faces at (0,0), (32,0) and (0,32), body panels, the chest's back panel TA_B and its side panel TA_S. See `src/characters.js`.
- One mesh per goon, about 250 to 340 triangles. Signature shapes are a few rigid boxes inside that budget.
- Heights must stay in the physics test's range (about 1.75 to 1.85 m; heavies bigger).
- Tone is Jackie Chan scrappy, not gory.

## Sector palettes

- **Krasnovia:** greatcoat greys, banner red `#b8231e`, sodium orange, gold `#f2c14e`.
- **Columbia:** red, white, navy `#1a2a5a`, gold trim. Americana people in an art-deco city.
- **Hinomoto:** Akira neon (red, magenta, cyan) on the street, black suits for the Aoki side.
