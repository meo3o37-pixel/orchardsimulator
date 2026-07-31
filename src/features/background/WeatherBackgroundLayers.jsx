import React from 'react';

export default function WeatherBackgroundLayers({
  currentImage,
  prevImage,
  crossfading,
  currentVisible,
  prevVisible
}) {
  if (!currentImage) return null;
  return (
    <div
      className={`app-shell__weather-layers ${crossfading ? 'is-crossfading' : ''}`.trim()}
      aria-hidden="true"
    >
      <div
        className={`app-shell__weather-layer app-shell__weather-layer--prev ${(prevImage && prevVisible) ? 'is-visible' : ''}`.trim()}
        style={{
          backgroundImage: prevImage
            ? `linear-gradient(135deg, rgba(255, 250, 240, 0.20), rgba(243, 232, 207, 0.28)), url("${prevImage}")`
            : 'none'
        }}
      />
      <div
        className={`app-shell__weather-layer app-shell__weather-layer--current ${currentVisible ? 'is-visible' : ''}`.trim()}
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(255, 250, 240, 0.20), rgba(243, 232, 207, 0.28)), url("${currentImage}")`
        }}
      />
    </div>
  );
}
