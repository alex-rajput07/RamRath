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
      className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 px-4 py-16 sm:px-6 lg:px-8 flex flex-col justify-center"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          variants={floatVariants}
          animate="animate"
          className="absolute -right-40 top-10 h-80 w-80 rounded-full bg-blue-200/20 blur-3xl"
        />
        <motion.div
          variants={floatVariants}
          animate="animate"
          transition={{ delay: 0.2 }}
          className="absolute -left-40 -bottom-40 h-80 w-80 rounded-full bg-green-200/20 blur-3xl"
        />
        <motion.div
          variants={floatVariants}
          animate="animate"
          transition={{ delay: 0.4 }}
          className="absolute right-1/4 -top-40 h-60 w-60 rounded-full bg-purple-200/10 blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl text-center space-y-8">
        {/* Logo Animation */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center"
        >
          <motion.div
            variants={scaleVariants}
            animate="animate"
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-green-500 shadow-2xl text-4xl"
          >
            🚗
          </motion.div>
        </motion.div>

        {/* Main Title */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
            Ram Rath
          </h1>
          <h2 className="text-3xl sm:text-4xl font-semibold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            राम रथ
          </h2>
        </motion.div>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
        >
          Rural mobility made simple, safe, and affordable. Connect riders and drivers directly—no internet required.
        </motion.p>

        {/* Feature Pills */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-3 pt-4"
        >
          {[
            { icon: '📍', label: 'No Maps' },
            { icon: '📱', label: 'Low Data' },
            { icon: '🤝', label: 'Direct Connect' },
            { icon: '⚡', label: 'Instant' },
          ].map((feature, i) => (
            <motion.div
              key={feature.label}
              variants={itemVariants}
              className="backdrop-blur-md bg-white/60 border border-white/80 rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              <span className="text-sm font-semibold text-gray-700">
                {feature.icon} {feature.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Cards */}
        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 pt-8 max-w-xl mx-auto">
          {[
            {
              href: '/direct-book',
              icon: '🚕',
              title: 'Book a Ride',
              subtitle: 'गाड़ी बुक करें',
              gradient: 'from-blue-500 to-cyan-500',
            },
            {
              href: '/post-ride',
              icon: '📣',
              title: 'Post a Ride',
              subtitle: 'राइड पोस्ट करें',
              gradient: 'from-green-500 to-emerald-500',
            },
          ].map((cta, i) => (
            <motion.div
              key={cta.href}
              variants={itemVariants}
              whileHover={!prefersReducedMotion ? { scale: 1.05, y: -8 } : {}}
              whileTap={!prefersReducedMotion ? { scale: 0.98 } : {}}
              className="relative group"
            >
              <Link
                href={cta.href}
                className={`relative block overflow-hidden rounded-2xl bg-gradient-to-br ${cta.gradient} px-6 py-10 text-white shadow-xl hover:shadow-2xl transition-all`}
              >
                {/* Shimmer effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                />

                <div className="relative z-10 text-center">
                  <div className="mb-3 text-4xl">{cta.icon}</div>
                  <div className="text-2xl font-bold leading-tight">{cta.title}</div>
                  <div className="text-sm font-light opacity-90 mt-1">{cta.subtitle}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Secondary CTA */}
        <motion.div variants={itemVariants} className="pt-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border-2 border-gray-900 bg-white text-gray-900 font-semibold hover:bg-gray-900 hover:text-white transition-all shadow-lg hover:shadow-xl"
          >
            आरंभ करें / Get Started
            <span className="text-lg">→</span>
          </Link>
        </motion.div>
      </div>

      {/* Bottom Stats */}
      <motion.div
        variants={itemVariants}
        className="relative z-10 mt-24 grid grid-cols-3 gap-4 rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 p-8 shadow-xl max-w-md mx-auto w-full"
      >
        {[
          { label: 'Users', value: '1000+', icon: '👥' },
          { label: 'Rides', value: '5000+', icon: '🚗' },
          { label: 'Coverage', value: '10+ States', icon: '🗺️' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="text-center"
            variants={itemVariants}
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
