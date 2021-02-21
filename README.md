![Chonky logo](chonklogo.png 'CHONK')

# CHONK

## Use

```
npm install chonk -g

// from any directory
chonk
```

`chonk` will recursively loop through current and subdirectories to find any jpgs or pngs. It will find any above a given threshold (100kb at the moment, but configurable option coming soon) and list the files found. You can then optionally compress the files.

## Why

Inspired by [#LetsGreenTheWeb](https://twitter.com/hashtag/LetsGreenTheWeb), I wanted to make a simple CLI tool to help devs check their projects for any cheeky/chonky large images that may have crept in (we've all done it).

Hopefully running `chonk` before you ship will catch (and compress) any large images and contribute to reducing overheads & energy consumption (as well as making your project faster to load, right?).

This is a personal/side project and should probably not be used in production (there are many many grunt/build tools that do this same thing far better than I)

### Read before using

- `chonk` overwrites the images!
- we copy the compressed images into a temporary folder - tested on \*nix systems, not on Windows.
- 100kb is default threshold at the minute
- you can optionally pass a directory e.g. `chonk '../../madproject/'
