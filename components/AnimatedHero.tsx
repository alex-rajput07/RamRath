'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface AnimatedHeroProps {
  title?: string;
  description?: string;
}

export function AnimatedHero({ title, description }: AnimatedHeroProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: prefersReducedMotion
      ? { opacity: 1 }
      : {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
          },
        },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: prefersReducedMotion
      ? { opacity: 1, y: 0 }
      : {
          opacity: 1,
          y: 0,
          transition: { duration: 0.8, ease: 'easeOut' },
        },
  };

  const floatVariants = {
    animate: prefersReducedMotion
      ? {}
      : {
          y: [0, -10, 0],
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        },
  };

  const scaleVariants = {
    animate: prefersReducedMotion
      ? {}
      : {
          scale: [1, 1.05, 1],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 px-4 py-12 sm:px-6 lg:px-8"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          variants={floatVariants}
          animate="animate"
          className="absolute right-10 top-20 h-40 w-40 rounded-full bg-blue-100 opacity-20 blur-3xl"
        />
        <motion.div
          variants={floatVariants}
          animate="animate"
          transition={{ delay: 0.2 }}
          className="absolute left-10 bottom-20 h-40 w-40 rounded-full bg-green-100 opacity-20 blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* Logo Animation */}
        <motion.div
          variants={itemVariants}
          className="mb-6 flex justify-center"
        >
          <motion.div
            variants={scaleVariants}
            animate="animate"
            className="text-5xl sm:text-6xl font-bold"
          >
            🚗
          </motion.div>
        </motion.div>

        {/* Main Title */}
        <motion.h1 variants={itemVariants} className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl">
          {title || 'Ram Rath'}
        </motion.h1>

        {/* Subtitle in Hindi */}
        <motion.h2 variants={itemVariants} className="mb-6 text-3xl font-semibold text-green-700">
          राम रथ
        </motion.h2>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="mb-12 text-lg text-gray-600 sm:text-xl"
        >
          {description ||
            'Rural mobility made simple. Zero internet required for booking.'}
        </motion.p>

        {/* Feature Pills */}
        <motion.div
          variants={itemVariants}
          className="mb-12 flex flex-wrap justify-center gap-3"
        >
          {['📍 No Maps', '📱 Low Data', '🤝 Direct Connect'].map((feature, i) => (
            <motion.span
              key={feature}
              variants={itemVariants}
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-md"
            >
              {feature}
            </motion.span>
          ))}
        </motion.div>

        {/* CTA Cards */}
        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2">
          {[
            {
              href: '/direct-book',
              icon: '🚕',
              title: 'Book a Car',
              subtitle: 'गाड़ी बुक करें',
              color: 'from-blue-500 to-blue-600',
            },
            {
              href: '/post-ride',
              icon: '📣',
              title: 'Post a Ride',
              subtitle: 'राइड पोस्ट करें',
              color: 'from-green-500 to-green-600',
            },
          ].map((cta, i) => (
            <motion.div
              key={cta.href}
              variants={itemVariants}
              whileHover={!prefersReducedMotion ? { scale: 1.05, y: -5 } : {}}
              whileTap={!prefersReducedMotion ? { scale: 0.98 } : {}}
              className="relative group"
            >
              <Link
                href={cta.href}
                className={`relative block overflow-hidden rounded-lg bg-gradient-to-br ${cta.color} px-6 py-8 text-white shadow-lg transition-all group-hover:shadow-xl`}
              >
                {/* Shimmer effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                />

                <div className="relative z-10">
                  <div className="mb-2 text-3xl">{cta.icon}</div>
                  <div className="text-xl font-bold">{cta.title}</div>
                  <div className="text-sm font-light opacity-90">{cta.subtitle}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Secondary CTA */}
        <motion.div variants={itemVariants} className="mt-12">
          <Link
            href="/login"
            className="inline-block rounded-lg border-2 border-gray-900 px-6 py-3 font-semibold text-gray-900 transition hover:bg-gray-900 hover:text-white"
          >
            आरंभ करें / Get Started
          </Link>
        </motion.div>
      </div>

      {/* Bottom Stats */}
      <motion.div
        variants={itemVariants}
        className="relative z-10 mt-16 grid grid-cols-3 gap-4 rounded-lg bg-white p-6 shadow-lg"
      >
        {[
          { label: 'Users', value: '1000+' },
          { label: 'Rides', value: '5000+' },
          { label: 'Coverage', value: '10+ States' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="text-center"
            variants={itemVariants}
          >
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-600">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
