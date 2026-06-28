# Portrait prompt — Pro

For Gemini (image generation). Generate **square, 1:1**. Save the result to
`static/lore/pro.png`, then set `image: "/lore/pro.png"` on the `pro` entry in
`src/lib/content/lore.js` — the placeholder is replaced automatically.

Keep the **STYLE BLOCK** identical across every portrait so the whole gallery
reads as one painter's hand. Lead each prompt with the two hard canon features
(bi-pupiled eyes, hairless) because models drop those first.

> Note on the eyes: "two pupils per eye" is hard for the model — generate a few
> and pick the best, or it tends to default to normal eyes. Reinforce it.

---

## Ready-to-paste prompt

Pro — a gaunt, weary working-class man, gazing inward. TWO CANON FEATURES THAT
MUST BE PRESENT: (1) he is completely hairless — a bare, smooth skull, no hair,
no eyebrows, no stubble; (2) his eyes are bi-pupiled — EACH eye holds two
distinct dark pupils set side by side within a single iris, an uncanny,
otherworldly, heavy-lidded gaze. Hollow cheeks, tired hooded eyes, long slender
fingers. He wears a worn grey technician's jumpsuit; a faded corporate patch on
the shoulder bears a simple "C" with three radiating lines, painted loosely. At
one temple, the faintest ambiguous seam of an old implant — painted as part of
the flesh, almost nothing, not a device. A sorrowful, contemplative pose, lost
in thought. Cold, diffuse blue light from one side; the rest dissolving into
warm shadow.

STYLE BLOCK — Painterly Expressionism in the spirit of Disco Elysium's character
portraits (Aleksander Rostov): a loose, gestural OIL PAINTING where the features
are SUGGESTED, not described — edges dissolve into the brushwork, forms melt at
their boundaries, whole passages of the face left unresolved and indistinct.
Thick impasto and dragged palette-knife strokes beside thin scumbled paint;
visible canvas tooth. Melancholic, psychologically heavy, dignified yet worn.
Muted, desaturated palette — umber, ash-grey, cold teal shadow — broken by a few
resonant accents of cadmium red and ochre in the flesh. Atmospheric chiaroscuro;
the figure emerges from a dark, abstract painted field. This is emotionally
evocative FINE ART, not illustration — it should make the viewer feel something
before they understand anything. Hand-painted, imperfect, alive. Square 1:1.

Avoid: any hair, eyebrows, or stubble; normal single-pupil eyes; glossy chrome
cybernetics or overt sci-fi tech; clean digital rendering, smooth airbrushed
skin, sharp photographic detail; anime or cartoon styling; a tidy, fully-resolved
"corporate concept-art" look; text or watermarks.

---

## What changed from v1 (and why)

- Hairless + bi-pupiled pushed to the very front and stated as non-negotiable —
  v1 gave him hair and ordinary eyes.
- Style rewritten toward Disco Elysium: features SUGGESTED not rendered, forms
  melting, passages left unresolved — to break the over-structured realism.
- Implant dialled down to "almost nothing, not a device" so it stops reading as
  sci-fi and the feeling leads.

## Reuse for other entries

Swap only the first paragraph (the subject); keep the STYLE BLOCK verbatim. All
Proto-Humans share the hairless + bi-pupiled traits. Later: The Prophet (scarred
zealot, removed-implant scars, fevered eyes), Gress (polished Cicillian, out of
her depth), Nexus Station (a landscape — the colour-marked orange/blue ring hub,
no figure, same paint).
