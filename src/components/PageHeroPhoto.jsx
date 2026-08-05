// Framed hero photo for page heroes - mirrors the business page treatment.
// Sits beside the hero text; the image is shown contained (never cropped) over
// a blurred, zoomed copy of itself so off-ratio photos look clean without black
// bars. Use inside a `.page-hero .inner` that has the `has-photo` modifier.
//
// Server component (no interactivity needed).
//
// Props:
//   src     image URL (jpg/png/webp). For <picture> with a webp source, pass
//           `webp` as the webp URL.
//   webp    optional webp source URL
//   alt     alt text

export default function PageHeroPhoto({ src, webp, alt = '' }) {
  if (!src) return null;
  return (
    <div className="page-hero-photo">
      <div className="page-hero-photo-bg" style={{ backgroundImage: `url(${src})` }} aria-hidden="true" />
      {webp ? (
        <picture>
          <source srcSet={webp} type="image/webp" />
          <img src={src} alt={alt} loading="eager" />
        </picture>
      ) : (
        <img src={src} alt={alt} loading="eager" />
      )}
    </div>
  );
}
