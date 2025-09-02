/**
 * MicroInteractions - Framer-motion micro-interactions and animations
 */

import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Box, useTheme } from '@mui/material';

// Animation variants
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

export const fadeInScale: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

export const slideInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -30
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    x: -30,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

export const slideInRight: Variants = {
  initial: {
    opacity: 0,
    x: 30
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    x: 30,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

export const bounceIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.3
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17
    }
  },
  exit: {
    opacity: 0,
    scale: 0.3,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

export const staggerChildren: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const flipIn: Variants = {
  initial: {
    opacity: 0,
    rotateY: -90
  },
  animate: {
    opacity: 1,
    rotateY: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    rotateY: 90,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

// Interactive components
interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'scale' | 'lift' | 'glow' | 'rotate';
  disabled?: boolean;
  className?: string;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  variant = 'scale',
  disabled = false,
  className
}) => {
  const getHoverAnimation = () => {
    switch (variant) {
      case 'scale':
        return { scale: 1.05 };
      case 'lift':
        return { y: -2, boxShadow: "0 8px 25px rgba(0,0,0,0.15)" };
      case 'glow':
        return { boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)" };
      case 'rotate':
        return { rotate: 5, scale: 1.05 };
      default:
        return { scale: 1.05 };
    }
  };

  return (
    <motion.div
      whileHover={disabled ? {} : getHoverAnimation()}
      whileTap={disabled ? {} : { scale: 0.95 }}
      onClick={onClick}
      className={className}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  );
};

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  variant?: 'fadeInUp' | 'fadeInScale' | 'slideInLeft' | 'slideInRight' | 'bounceIn' | 'flipIn';
  hoverEffect?: boolean;
  className?: string;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  delay = 0,
  variant = 'fadeInUp',
  hoverEffect = true,
  className
}) => {
  const variants = {
    fadeInUp,
    fadeInScale,
    slideInLeft,
    slideInRight,
    bounceIn,
    flipIn
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants[variant]}
      transition={{ delay }}
      whileHover={hoverEffect ? { 
        y: -5, 
        transition: { type: "spring", stiffness: 400, damping: 17 }
      } : {}}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface StaggeredListProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  staggerDelay = 0.1,
  className
}) => {
  const childArray = React.Children.toArray(children);
  
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      className={className}
    >
      {childArray.map((child, index) => (
        <motion.div
          key={index}
          variants={fadeInUp}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

interface PulsingDotProps {
  color?: string;
  size?: number;
  intensity?: 'subtle' | 'medium' | 'strong';
}

export const PulsingDot: React.FC<PulsingDotProps> = ({
  color = '#10b981',
  size = 8,
  intensity = 'medium'
}) => {
  const getAnimation = () => {
    switch (intensity) {
      case 'subtle':
        return {
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7]
        };
      case 'medium':
        return {
          scale: [1, 1.2, 1],
          opacity: [0.6, 1, 0.6]
        };
      case 'strong':
        return {
          scale: [1, 1.4, 1],
          opacity: [0.5, 1, 0.5]
        };
      default:
        return {
          scale: [1, 1.2, 1],
          opacity: [0.6, 1, 0.6]
        };
    }
  };

  return (
    <motion.div
      animate={getAnimation()}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        display: 'inline-block'
      }}
    />
  );
};

interface FloatingActionProps {
  children: React.ReactNode;
  intensity?: 'gentle' | 'medium' | 'strong';
}

export const FloatingAction: React.FC<FloatingActionProps> = ({
  children,
  intensity = 'medium'
}) => {
  const getAnimation = () => {
    switch (intensity) {
      case 'gentle':
        return {
          y: [0, -2, 0],
          transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        };
      case 'medium':
        return {
          y: [0, -5, 0],
          transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
        };
      case 'strong':
        return {
          y: [0, -8, 0],
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        };
      default:
        return {
          y: [0, -5, 0],
          transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
        };
    }
  };

  return (
    <motion.div animate={getAnimation()}>
      {children}
    </motion.div>
  );
};

interface GlowEffectProps {
  children: React.ReactNode;
  color?: string;
  intensity?: number;
  trigger?: 'hover' | 'always';
}

export const GlowEffect: React.FC<GlowEffectProps> = ({
  children,
  color = '#3b82f6',
  intensity = 0.4,
  trigger = 'hover'
}) => {
  const glowStyle = {
    boxShadow: `0 0 20px ${color}${Math.floor(intensity * 100).toString(16)}`
  };

  if (trigger === 'always') {
    return (
      <motion.div
        animate={{
          boxShadow: [
            `0 0 5px ${color}${Math.floor(intensity * 0.5 * 100).toString(16)}`,
            `0 0 20px ${color}${Math.floor(intensity * 100).toString(16)}`,
            `0 0 5px ${color}${Math.floor(intensity * 0.5 * 100).toString(16)}`
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={glowStyle}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

interface TypewriterTextProps {
  text: string;
  delay?: number;
  speed?: number;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  delay = 0,
  speed = 50
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      <motion.span
        initial={{ width: 0 }}
        animate={{ width: "auto" }}
        transition={{
          duration: text.length * speed / 1000,
          ease: "linear",
          delay
        }}
        style={{
          display: "inline-block",
          overflow: "hidden",
          whiteSpace: "nowrap"
        }}
      >
        {text}
      </motion.span>
    </motion.div>
  );
};

interface CountUpProps {
  from: number;
  to: number;
  duration?: number;
  delay?: number;
  suffix?: string;
  prefix?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  from,
  to,
  duration = 1,
  delay = 0,
  suffix = '',
  prefix = ''
}) => {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      <motion.span
        initial={{ textContent: String(from) }}
        animate={{ textContent: String(to) }}
        transition={{
          duration,
          ease: "easeOut",
          delay
        }}
        onUpdate={(latest) => {
          if (typeof latest.textContent === 'string') {
            const current = parseInt(latest.textContent);
            latest.textContent = `${prefix}${current}${suffix}`;
          }
        }}
      />
    </motion.span>
  );
};

interface ParallaxContainerProps {
  children: React.ReactNode;
  offset?: number;
  className?: string;
}

export const ParallaxContainer: React.FC<ParallaxContainerProps> = ({
  children,
  offset = 50,
  className
}) => {
  return (
    <motion.div
      initial={{ y: offset, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface MorphingIconProps {
  icons: React.ReactNode[];
  interval?: number;
  className?: string;
}

export const MorphingIcon: React.FC<MorphingIconProps> = ({
  icons,
  interval = 2000,
  className
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % icons.length);
    }, interval);

    return () => clearInterval(timer);
  }, [icons.length, interval]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
        transition={{ duration: 0.3 }}
        className={className}
      >
        {icons[currentIndex]}
      </motion.div>
    </AnimatePresence>
  );
};

interface SparkleEffectProps {
  children: React.ReactNode;
  count?: number;
  duration?: number;
}

export const SparkleEffect: React.FC<SparkleEffectProps> = ({
  children,
  count = 5,
  duration = 2
}) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      {children}
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            opacity: 0,
            scale: 0,
            x: Math.random() * 100 - 50,
            y: Math.random() * 100 - 50
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: Math.random() * 150 - 75,
            y: Math.random() * 150 - 75
          }}
          transition={{
            duration,
            repeat: Infinity,
            delay: Math.random() * duration,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            width: 4,
            height: 4,
            borderRadius: '50%',
            backgroundColor: theme.palette.primary.main,
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
      ))}
    </Box>
  );
};

interface ShimmerEffectProps {
  children: React.ReactNode;
  color?: string;
  duration?: number;
}

export const ShimmerEffect: React.FC<ShimmerEffectProps> = ({
  children,
  color = 'rgba(255, 255, 255, 0.1)',
  duration = 1.5
}) => {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          animation: `shimmer ${duration}s infinite`,
          zIndex: 1
        },
        '@keyframes shimmer': {
          '0%': { left: '-100%' },
          '100%': { left: '100%' }
        }
      }}
    >
      {children}
    </Box>
  );
};

interface RippleEffectProps {
  children: React.ReactNode;
  color?: string;
  duration?: number;
}

export const RippleEffect: React.FC<RippleEffectProps> = ({
  children,
  color = '#3b82f6',
  duration = 1
}) => {
  const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);
  const [nextId, setNextId] = React.useState(0);

  const handleClick = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setRipples(prev => [...prev, { id: nextId, x, y }]);
    setNextId(prev => prev + 1);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== nextId - 1));
    }, duration * 1000);
  };

  return (
    <Box
      sx={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
      onClick={handleClick}
    >
      {children}
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          initial={{
            width: 0,
            height: 0,
            x: ripple.x,
            y: ripple.y,
            opacity: 0.5
          }}
          animate={{
            width: 300,
            height: 300,
            x: ripple.x - 150,
            y: ripple.y - 150,
            opacity: 0
          }}
          transition={{ duration }}
          style={{
            position: 'absolute',
            borderRadius: '50%',
            backgroundColor: color,
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
      ))}
    </Box>
  );
};

interface NumberTickerProps {
  value: number;
  duration?: number;
  format?: (num: number) => string;
}

export const NumberTicker: React.FC<NumberTickerProps> = ({
  value,
  duration = 0.5,
  format = (num) => num.toString()
}) => {
  const [displayValue, setDisplayValue] = React.useState(value);

  React.useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  return (
    <motion.span
      key={value}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration }}
    >
      {format(displayValue)}
    </motion.span>
  );
};

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 60,
  strokeWidth = 4,
  color = '#3b82f6',
  backgroundColor = 'rgba(59, 130, 246, 0.2)',
  animated = true
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.svg
      width={size}
      height={size}
      initial={animated ? { rotate: -90 } : false}
      animate={animated ? { rotate: -90 } : false}
    >
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={backgroundColor}
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      
      {/* Progress circle */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={strokeDasharray}
        initial={animated ? { strokeDashoffset: circumference } : false}
        animate={animated ? { strokeDashoffset } : false}
        transition={animated ? { duration: 1, ease: "easeInOut" } : false}
        strokeLinecap="round"
      />
    </motion.svg>
  );
};

interface WaveLoadingProps {
  color?: string;
  height?: number;
  count?: number;
}

export const WaveLoading: React.FC<WaveLoadingProps> = ({
  color = '#3b82f6',
  height = 40,
  count = 5
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        height
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            scaleY: [1, 2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
          style={{
            width: 4,
            height: height / 4,
            backgroundColor: color,
            borderRadius: 2
          }}
        />
      ))}
    </Box>
  );
};

export default {
  AnimatedButton,
  AnimatedCard,
  StaggeredList,
  PulsingDot,
  FloatingAction,
  GlowEffect,
  ShimmerEffect,
  RippleEffect,
  NumberTicker,
  ProgressRing,
  SparkleEffect,
  WaveLoading,
  TypewriterText,
  CountUp,
  ParallaxContainer,
  MorphingIcon
};
