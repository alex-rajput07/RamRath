'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export type UserRole = 'booker' | 'driver' | 'admin';

export interface RoleSwitcherProps {
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const ROLES: { id: UserRole; label: string; description: string; icon: string }[] = [
  {
    id: 'booker',
    label: 'बुकर / Booker',
    description: 'Book rides and travel',
    icon: '🚗',
  },
  {
    id: 'driver',
    label: 'ड्राइवर / Driver',
    description: 'Offer rides and earn',
    icon: '🚙',
  },
  {
    id: 'admin',
    label: 'एडमिन / Admin',
    description: 'Manage platform',
    icon: '⚙️',
  },
];

export function RoleSwitcher({ selectedRole, onRoleChange }: RoleSwitcherProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">
        आप कौन हैं? / Who are you?
      </h2>
      <p className="text-center text-gray-600 text-sm mb-8">Select your role to continue</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {ROLES.map((role, index) => (
          <motion.button
            key={role.id}
            onClick={() => onRoleChange(role.id)}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className={`relative group rounded-xl border-2 transition-all overflow-hidden ${
              selectedRole === role.id
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
            }`}
          >
            {/* Background Gradient on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-green-400/0 group-hover:from-blue-400/10 group-hover:to-green-400/10 transition-all" />

            <div className="relative p-8 text-center space-y-3">
              <motion.div
                animate={selectedRole === role.id ? { scale: 1.1, rotate: 5 } : {}}
                className="text-5xl"
              >
                {role.icon}
              </motion.div>
              
              <div>
                <div className="font-bold text-lg text-gray-900">{role.label}</div>
                <div className="text-sm text-gray-600 mt-1">{role.description}</div>
              </div>

              {selectedRole === role.id && (
                <motion.div
                  layoutId="selected-indicator"
                  className="pt-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="inline-block px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-semibold">
                    ✓ Selected
                  </div>
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
