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
  const [hoveredRole, setHoveredRole] = useState<UserRole | null>(null);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-center mb-6 text-gray-800">
        आप कौन हैं? / Who are you?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {ROLES.map((role) => (
          <motion.button
            key={role.id}
            onClick={() => onRoleChange(role.id)}
            onMouseEnter={() => setHoveredRole(role.id)}
            onMouseLeave={() => setHoveredRole(null)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative p-6 rounded-lg border-2 transition-all ${
              selectedRole === role.id
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-300 bg-white hover:border-orange-400'
            }`}
          >
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="text-4xl mb-2">{role.icon}</div>
              <div className="font-bold text-sm text-gray-900 mb-1">{role.label}</div>
              <div className="text-xs text-gray-600">{role.description}</div>
            </motion.div>
            {selectedRole === role.id && (
              <motion.div
                layoutId="selected-role"
                className="absolute inset-0 border-2 border-orange-500 rounded-lg pointer-events-none"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
