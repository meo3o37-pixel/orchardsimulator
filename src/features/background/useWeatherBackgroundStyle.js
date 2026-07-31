import { useEffect, useRef, useState } from 'react';

const FADE_MS = 1400;

export default function useWeatherBackgroundStyle(weatherSceneImage, transitionKey = '') {
  const [currentImage, setCurrentImage] = useState('');
  const [prevImage, setPrevImage] = useState('');
  const [crossfading, setCrossfading] = useState(false);
  const [currentVisible, setCurrentVisible] = useState(true);
  const [prevVisible, setPrevVisible] = useState(false);
  const fadeTimerRef = useRef(null);
  const fadeRafRef = useRef(null);
  const fadeRafRef2 = useRef(null);
  const loadSeqRef = useRef(0);
  const currentImageRef = useRef('');
  const lastTransitionKeyRef = useRef('');

  const clearFadeTimers = () => {
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    if (fadeRafRef.current) {
      cancelAnimationFrame(fadeRafRef.current);
      fadeRafRef.current = null;
    }
    if (fadeRafRef2.current) {
      cancelAnimationFrame(fadeRafRef2.current);
      fadeRafRef2.current = null;
    }
  };

  useEffect(() => {
    currentImageRef.current = currentImage;
  }, [currentImage]);

  useEffect(() => {
    const nextImage = String(weatherSceneImage || '');
    const nextTransitionKey = String(transitionKey || nextImage || '');
    if (!nextImage) {
      loadSeqRef.current += 1;
      clearFadeTimers();
      setPrevImage('');
      setCurrentImage('');
      setCrossfading(false);
      setCurrentVisible(true);
      setPrevVisible(false);
      currentImageRef.current = '';
      lastTransitionKeyRef.current = nextTransitionKey;
      return;
    }
    if (!currentImageRef.current) {
      setCurrentImage(nextImage);
      setCurrentVisible(true);
      setPrevVisible(false);
      currentImageRef.current = nextImage;
      lastTransitionKeyRef.current = nextTransitionKey;
      return;
    }
    const sameImage = nextImage === currentImageRef.current;
    const sameTransition = nextTransitionKey === lastTransitionKeyRef.current;
    if (sameImage && sameTransition) return;
    clearFadeTimers();

    const seq = ++loadSeqRef.current;
    const startFade = () => {
      if (seq !== loadSeqRef.current) return;
      setPrevImage(currentImageRef.current);
      setCurrentImage(nextImage);
      setCrossfading(true);
      setPrevVisible(true);
      setCurrentVisible(false);
      currentImageRef.current = nextImage;
      lastTransitionKeyRef.current = nextTransitionKey;
      fadeRafRef.current = requestAnimationFrame(() => {
        fadeRafRef.current = null;
        fadeRafRef2.current = requestAnimationFrame(() => {
          setPrevVisible(false);
          setCurrentVisible(true);
          fadeRafRef2.current = null;
        });
      });
      fadeTimerRef.current = setTimeout(() => {
        setPrevImage('');
        setCrossfading(false);
        setPrevVisible(false);
        fadeTimerRef.current = null;
      }, FADE_MS);
    };

    startFade();
  }, [weatherSceneImage, transitionKey]);

  useEffect(() => () => {
    clearFadeTimers();
    loadSeqRef.current += 1;
  }, []);

  return {
    currentImage,
    prevImage,
    crossfading,
    currentVisible,
    prevVisible
  };
}
