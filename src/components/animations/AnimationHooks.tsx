/**
 * AnimationHooks - Custom hooks for framer-motion animations
 */

import { useAnimation, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

// Hook for scroll-triggered animations
export const useScrollAnimation = (threshold = 0.1) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { threshold });

  useEffect(() => {
    if (inView) {
      controls.start('animate');
    } else {
      controls.start('initial');
    }
  }, [controls, inView]);

  return { ref, controls };
};

// Hook for hover animations with delay
export const useHoverAnimation = (delay = 0) => {
  const [isHovered, setIsHovered] = useState(false);
  const controls = useAnimation();

  const handleMouseEnter = () => {
    setIsHovered(true);
    setTimeout(() => {
      if (isHovered) {
        controls.start('hover');
      }
    }, delay);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    controls.start('initial');
  };

  return {
    controls,
    mouseEvents: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave
    }
  };
};

// Hook for sequence animations
export const useSequenceAnimation = (steps: Array<{ delay: number; animation: any }>) => {
  const controls = useAnimation();

  const playSequence = async () => {
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.delay * 1000));
      await controls.start(step.animation);
    }
  };

  return { controls, playSequence };
};

// Hook for mouse tracking animations
export const useMouseTracking = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (event.clientY - rect.top - rect.height / 2) / rect.height;
        setMousePosition({ x: x * 20, y: y * 20 });
      }
    };

    const element = ref.current;
    if (element) {
      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('mouseleave', () => setMousePosition({ x: 0, y: 0 }));
    }

    return () => {
      if (element) {
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('mouseleave', () => setMousePosition({ x: 0, y: 0 }));
      }
    };
  }, []);

  return { ref, mousePosition };
};

// Hook for auto-rotating animations
export const useAutoRotate = (duration = 10, paused = false) => {
  const controls = useAnimation();

  useEffect(() => {
    if (!paused) {
      controls.start({
        rotate: 360,
        transition: {
          duration,
          repeat: Infinity,
          ease: "linear"
        }
      });
    } else {
      controls.stop();
    }
  }, [controls, duration, paused]);

  return controls;
};

// Hook for visibility-based animations
export const useVisibilityAnimation = (animation: any, threshold = 0.1) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { threshold, once: true });

  useEffect(() => {
    if (inView) {
      controls.start(animation);
    }
  }, [controls, inView, animation]);

  return { ref, controls };
};

// Hook for gesture-based animations
export const useGestureAnimation = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const dragConstraints = { left: 0, right: 0, top: 0, bottom: 0 };

  const dragHandlers = {
    onDragStart: () => setIsDragging(true),
    onDragEnd: () => setIsDragging(false),
    onPointerDown: () => setIsPressed(true),
    onPointerUp: () => setIsPressed(false),
    onPointerLeave: () => setIsPressed(false)
  };

  return {
    isDragging,
    isPressed,
    dragConstraints,
    dragHandlers
  };
};

// Hook for spring physics animations
export const useSpringAnimation = (config = { stiffness: 400, damping: 17 }) => {
  const controls = useAnimation();

  const springTo = (values: any) => {
    return controls.start({
      ...values,
      transition: {
        type: "spring",
        ...config
      }
    });
  };

  return { controls, springTo };
};

// Hook for chain animations
export const useChainAnimation = () => {
  const controls = useAnimation();
  const [isPlaying, setIsPlaying] = useState(false);

  const playChain = async (animations: Array<{ animation: any; duration?: number }>) => {
    setIsPlaying(true);
    
    for (const { animation, duration = 0.3 } of animations) {
      await controls.start({
        ...animation,
        transition: { duration }
      });
    }
    
    setIsPlaying(false);
  };

  return { controls, playChain, isPlaying };
};

export {
  useAnimation,
  useInView
} from 'framer-motion';
