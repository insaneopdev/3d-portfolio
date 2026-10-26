import { useEffect, useRef, useState } from 'react';
import { getScrollProgress } from './motion-utils.js';
import './loading-scroll-progress.css';
import portfolioLogo from '../Portfolio Logo.png';

const LOADER_MIN_DURATION = 880;
const LOADER_MAX_DURATION = 1900;

export default function LoadingScrollProgress() {
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [loaderExiting, setLoaderExiting] = useState(false);
  const railRef = useRef(null);
  const fillRef = useRef(null);
  const keychainRef = useRef(null);
  const loaderFillRef = useRef(null);
  const percentRef = useRef(null);
  const statusRef = useRef(null);

  useEffect(() => {
    let frameId = 0;
    let exitTimerId = 0;
    let hideTimerId = 0;
    let finished = false;
    const startedAt = performance.now();
    let pageLoaded = document.readyState === 'complete';

    const markPageLoaded = () => {
      pageLoaded = true;
    };

    const paintProgress = (amount) => {
      const percentage = Math.min(100, Math.max(0, Math.round(amount)));
      if (loaderFillRef.current) {
        loaderFillRef.current.style.width = `${percentage}%`;
      }
      if (percentRef.current) {
        percentRef.current.textContent = `${percentage}`.padStart(2, '0');
      }
    };

    const finishLoading = () => {
      if (finished) return;
      finished = true;
      paintProgress(100);
      if (statusRef.current) statusRef.current.textContent = 'READY TO EXPLORE';

      exitTimerId = window.setTimeout(() => {
        setLoaderExiting(true);
        hideTimerId = window.setTimeout(() => {
          setLoaderVisible(false);
        }, 460);
      }, 160);
    };

    const animateLoading = (now) => {
      const elapsed = now - startedAt;

      if ((pageLoaded && elapsed >= LOADER_MIN_DURATION) || elapsed >= LOADER_MAX_DURATION) {
        finishLoading();
        return;
      }

      const progress = Math.min(94, 5 + (elapsed / LOADER_MAX_DURATION) * 89);
      paintProgress(progress);
      frameId = window.requestAnimationFrame(animateLoading);
    };

    window.addEventListener('load', markPageLoaded, { once: true });
    frameId = window.requestAnimationFrame(animateLoading);

    return () => {
      window.removeEventListener('load', markPageLoaded);
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(exitTimerId);
      window.clearTimeout(hideTimerId);
    };
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    const fill = fillRef.current;
    const keychain = keychainRef.current;
    if (!rail || !fill || !keychain) return undefined;

    let frameId = 0;
    let previousEndpoint = null;
    let lastTimestamp = 0;
    let swing = 0;
    let angularVelocity = 0;

    const updateProgress = (timestamp) => {
      const dt = Math.min(Math.max((timestamp - lastTimestamp) / 1000 || 1 / 60, 1 / 240), 1 / 30);
      lastTimestamp = timestamp;
      const documentHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body ? document.body.scrollHeight : 0,
      );
      const progress = getScrollProgress(
        window.scrollY,
        window.innerHeight,
        documentHeight,
      );

      const availableWidth = Math.max(0, window.innerWidth - 28);
      const endpoint = availableWidth * progress;
      const endpointVelocity = previousEndpoint === null ? 0 : (endpoint - previousEndpoint) / dt;
      previousEndpoint = endpoint;

      // A damped pendulum: scroll speed gives the tag momentum, while the spring
      // always returns it to the end of the progress rail.
      // CSS uses a downward Y axis: a right-moving attachment needs a positive
      // rotation so the pendant mass correctly lags to the left.
      const scrollForce = Math.max(-960, Math.min(960, endpointVelocity * 0.18));
      angularVelocity += (-34 * swing - 9 * angularVelocity + scrollForce) * dt;
      swing = Math.max(-24, Math.min(24, swing + angularVelocity * dt));
      if (Math.abs(swing) < 0.015 && Math.abs(angularVelocity) < 0.015 && Math.abs(endpointVelocity) < 0.01) {
        swing = 0;
        angularVelocity = 0;
      }

      // The fill remains the attachment point; only the hanging tag swings.
      fill.style.width = `${endpoint}px`;
      keychain.style.setProperty('--keychain-swing', `${swing.toFixed(2)}deg`);
      keychain.style.setProperty('--keychain-depth', `${Math.min(16, Math.abs(angularVelocity) * 0.18).toFixed(2)}deg`);
      rail.setAttribute('aria-valuenow', String(Math.round(progress * 100)));

      if (Math.abs(swing) > 0.015 || Math.abs(angularVelocity) > 0.015 || Math.abs(endpointVelocity) > 0.01) {
        frameId = window.requestAnimationFrame(updateProgress);
      } else {
        frameId = 0;
      }
    };

    const scheduleUpdate = () => {
      if (frameId !== 0) return;
      frameId = window.requestAnimationFrame(updateProgress);
    };

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    window.addEventListener('load', scheduleUpdate, { once: true });

    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(scheduleUpdate)
      : null;

    if (observer) observer.observe(document.documentElement);
    scheduleUpdate();

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('load', scheduleUpdate);
      window.cancelAnimationFrame(frameId);
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <>
      <div
        ref={railRef}
        className='site-progress-rail'
        role='progressbar'
        aria-label='Page scroll progress'
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
      >
        <div ref={fillRef} className='site-progress-fill'>
          <div ref={keychainRef} className='site-progress-keychain' aria-hidden='true'>
            <span className='site-progress-keychain__ring' />
            <span className='site-progress-keychain__connector' />
            <span className='site-progress-keychain__tag'>
              <span className='site-progress-keychain__mark' />
            </span>
          </div>
        </div>
      </div>

      {loaderVisible && (
        <div
          className={`site-intro-loader${loaderExiting ? ' is-exiting' : ''}`}
          role='status'
          aria-live='polite'
          aria-label='Loading portfolio'
        >
          <div className='site-intro-loader__content'>
            <div className='site-intro-loader__identity'>
              <img className='site-intro-loader__monogram' src={portfolioLogo} alt='Raghul Sah' />
              <span className='site-intro-loader__brand'>RAGHUL SAH<small>DIGITAL PORTFOLIO</small></span>
            </div>

            <div className='site-intro-loader__message'>
              <p className='site-intro-loader__eyebrow'>INITIALIZING EXPERIENCE</p>
              <h2>Ideas in motion<span>.</span></h2>
              <p className='site-intro-loader__description'>Preparing the things I build.</p>
            </div>

            <div className='site-intro-loader__progress'>
              <div className='site-intro-loader__track'>
                <div ref={loaderFillRef} className='site-intro-loader__fill' style={{ width: '0%' }} />
              </div>
              <div className='site-intro-loader__meta'>
                <span ref={statusRef}>LOADING PORTFOLIO</span>
                <span><span ref={percentRef}>00</span><span className='site-intro-loader__percent'>%</span></span>
              </div>
            </div>
          </div>
          <span className='site-intro-loader__corner'>DESIGN · CODE · INTELLIGENCE</span>
        </div>
      )}
    </>
  );
}
