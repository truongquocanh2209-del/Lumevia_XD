# Asset provenance — Caelunyra StudyOS 1.21

Verified on 2026-10-28. These four landscape photographs are shipped as local WebP derivatives for the welcome screen and Focus Room; no third-party request is needed to display them.

## Pexels photographs

Each original photo page below identifies the photographer and links its **License / Free** label to the [Pexels License](https://www.pexels.com/license/). That license permits free use and modification, including websites and apps. Attribution is appreciated, and is supplied here. The original photographers retain their rights. The website's source-code license does not replace the photo license.

| Local file (desktop and mobile) | Original photograph and photographer | License evidence |
| --- | --- | --- |
| `assets/scenes/forest.webp`, `forest-mobile.webp` | [Misty Forest with Tall Trees in Atmosphere](https://www.pexels.com/photo/misty-forest-with-tall-trees-in-atmosphere-36328279/) — **Jacob Postuma**, Pexels ID 36328279 | Original page: License → Free → Pexels License. Camera metadata: Sony ILCE-7M3; taken 2023-08-08. |
| `assets/scenes/lake.webp`, `lake-mobile.webp` | [Lake and Forest behind](https://www.pexels.com/photo/lake-and-forest-behind-15092159/) — **Yuanpang Wa**, Pexels ID 15092159 | Original page: License → Free → Pexels License. Camera metadata: Sony ILCE-7RM2; taken 2022-06-22. |
| `assets/scenes/ocean.webp`, `ocean-mobile.webp` | [Beach During Sunset](https://www.pexels.com/photo/beach-during-sunset-635279/) — **Bella White**, Pexels ID 635279 | Original page: License → Free → Pexels License. Camera metadata: Nikon D90; taken 2014-05-10. |
| `assets/scenes/snow.webp`, `snow-mobile.webp` | [Snowy Cabin Nestled in Winter Forest Landscape](https://www.pexels.com/photo/snowy-cabin-nestled-in-winter-forest-landscape-37156667/) — **Dawid Zawiła**, Pexels ID 37156667 | Original page: License → Free → Pexels License. Published 2026-04-19. |

### Transformations

- Source bytes downloaded from each original page's `images.pexels.com` photo URL, with CDN resizing.
- Converted to WebP, with metadata stripped. No generative image editing, object replacement, or compositing.
- Desktop: original aspect ratio, width 1920 px (ocean 1600 px). Mobile: center crop to 768 × 1024 px.
- Compression: quality 76–82 desktop and 72–77 mobile. All delivered desktop files are below 350,000 bytes; all mobile files below 120,000 bytes.
- A contact-sheet visual review confirmed coherent trees, reflections, water and cabin structure. Display overlays and blur are implemented separately by the app and do not alter the underlying files.

### License boundaries

Pexels prohibits selling unaltered copies, redistribution on other stock-photo/wallpaper platforms, implied endorsement, and use of images as a trademark. These images are UI backgrounds in a study application, not a stock image catalog. Do not extract them from this package for resale as wallpaper assets. There are no identifiable people in these selected photographs. No endorsement by Pexels or the photographers is implied.

Primary license: https://www.pexels.com/license/

Additional official explanation: https://help.pexels.com/hc/en-us/articles/360042295174-What-is-the-license-of-the-photos-and-videos-on-Pexels

## AEVORA brand assets

Logo A/leaf/star recreated using built-in image generation from the user-provided AEVORA brand board. PNG transparent mark, favicon and app icons derived for application use. It is a faithful visual adaptation, not the original vector. User-provided source LICENSE retained.

Prompt: “Extract/recreate only the exact AEVORA emblem from the upper main panel: pointed A formed from two flowing folded leaf/ribbon strokes in silver, sapphire, cyan and violet, four-point star inside. Transparent background; single centered emblem; no text or landscape.”

Generated source copied into the project as aevora-mark.png; app icons include safe padding. New 10 photos and their provenance are documented separately in NEW-SCENE-LICENSES.md.
