import React from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

const AnimatedBackground = () => {
  const particlesInit = async (main) => {
    await loadFull(main);
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(135deg, #3B82F6 0%, #7C3AED 100%)',
          zIndex: -2,
        }}
      />

      <Particles
        init={particlesInit}
        options={{
          fullScreen: { enable: true, zIndex: -1 },
          background: { color: 'transparent' },
          fpsLimit: 60,
          interactivity: {
            events: {
              onHover: { enable: true, mode: 'repulse' },
              onClick: { enable: false },
              resize: true,
            },
            modes: {
              repulse: { distance: 100, duration: 0.4 },
            },
          },
          particles: {
            number: { value: 55, density: { enable: true, area: 900 } },
            color: { value: ['#FFFFFF', '#DDF6FF', '#BEEBFF'] },
            opacity: { value: 0.18, random: false },
            size: { value: { min: 1, max: 3 } },
            move: {
              enable: true,
              speed: 0.6,
              direction: 'none',
              outModes: { default: 'out' },
            },
            links: {
              enable: true,
              distance: 140,
              color: '#FFFFFF',
              opacity: 0.12,
              width: 1,
            },
          },
        }}
      />
    </>
  );
};

export default AnimatedBackground;
