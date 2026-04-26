# Game artwork

Drop game cover and gameplay images here. The schema and components pick them up automatically when their paths are referenced from the MDX frontmatter.

## Convention

```
/public/images/games/{slug}/
  cover.jpg          # vertical poster, 2:3 aspect ratio (preferred 600x900 or 800x1200)
  hero.jpg           # wide hero/banner, 16:9 aspect ratio (preferred 1600x900)
  gameplay-1.jpg     # gameplay screenshot, 16:9 (preferred 1280x720 or 1920x1080)
  gameplay-2.jpg
  gameplay-3.jpg
```

The `{slug}` matches the `slug` field in the game's MDX frontmatter at `/content/catalog/{slug}.mdx`.

## Wiring images into a game

In `/content/catalog/{slug}.mdx` frontmatter, add:

```yaml
cover_image: /images/games/eve-online/cover.jpg
hero_image: /images/games/eve-online/hero.jpg
gameplay_images:
  - { src: /images/games/eve-online/gameplay-1.jpg, caption: "Capital fleet engagement", credit: "CCP Games" }
  - { src: /images/games/eve-online/gameplay-2.jpg, caption: "Null-sec sovereignty map", credit: "CCP Games" }
```

When `cover_image` is missing, the GameCover component renders a procedural placeholder using the game's category glyph and name. The site stays presentable until real art is added.

## Sourcing rules

Use officially distributed press kits, store header images (Steam CDN, Epic, etc.), Wikipedia / Wikimedia Commons assets, and developer screenshots permitted under press use. Always credit the publisher in the `credit` field.

Avoid: fan art without attribution, ripped game UI, copyrighted material with explicit no-redistribution licenses, anything blurry or below 720p.

## Optimization

Target file sizes:
- Cover: under 200KB (JPG quality 82, 600px wide)
- Hero: under 400KB (JPG quality 82, 1600px wide)
- Gameplay: under 250KB each (JPG quality 80, 1280px wide)

If you have many images at once, run them through a batch optimizer (Squoosh, ImageOptim, or `sharp` via a Node script) before committing.
