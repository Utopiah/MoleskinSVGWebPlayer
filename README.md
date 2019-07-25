![Preview](https://cdn.glitch.com/419d7c35-9ec2-4d43-b954-c849f74954f6%2F2019-07-22_fast.gif?v=1563825275693)

Repository : https://github.com/Utopiah/MoleskinSVGWebPlayer

# todo
- test audio example for mediasync
- allow playing on synced (now only video driven despite being a 2-way sync)
- properly merge editor and mediasync (both work independantly but with the same code i.e `svgplayer.js`)
- parameters via URL (beyond just target svg)
- play bar supporting seeking (0 being first stroke, 100 last)
- refactor to proper web component
- social synced [cf own 360 social player](https://glitch.com/edit/#!/localvideo-webxr-coplay), especially for presentations
- 3D/XR support, failed attempt in `3d.html` despite `child.material.needsUpdate` to true, try instead to save or as dataURI then reload the `src`
- email support to receive, parse and embbed in the player drawing directly from the device, cf e.g. [own attempts](https://glitch.com/edit/#!/email-to-endpoint)
- test usage within [own presentation solution rather](https://codepen.io/utopiah/full/wOJgMW) revealJS
- test layering cf `layers.html` but fails `fill-opacity="0"` or `fill="transparent"`
- explore zoom a la Prezi

# useful resources

- for presistence
  - just via the browser [Saving SVG as a file](https://stackoverflow.com/questions/2483919/how-to-save-svg-canvas-to-local-filesystem)
  - with server-side [JSON CMS](https://glitch.com/edit/#!/cms-json)
  
![Synced media syncronization with seeking](https://cdn.glitch.com/419d7c35-9ec2-4d43-b954-c849f74954f6%2Fseeking.gif?v=1564070503655)