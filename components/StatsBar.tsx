'use client';

import { motion } from 'framer-motion';

const stats = [
  {
    value: '10+',
    unit: 'hrs/week',
    label: 'saved per automation on average',
    accent: 'from-brand-500 to-brand-600',
  },
  {
    value: '< 1',
    unit: 'week',
    label: 'from audit to first live workflow',
    accent: 'from-accent-500 to-accent-600',
  },
  {
    value: '0',
    unit: 'code',
    label: 'required from your team',
    accent: 'from-success-500 to-success-600',
  },
];

export default function StatsBar() {
  return (
    <section className="bg-gradient-to-r from-gray-900 via-brand-950 to-gray-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center text-center md:border-r md:last:border-r-0 border-gray-700 px-4"
            >
              <div className={`text-5xl md:text-6xl font-extrabold bg-gradient-to-r ${stat.accent} bg-clip-text text-transparent leading-none mb-1`}>
                {stat.value}
                <span className="text-2xl md:text-3xl ml-1 font-bold">{stat.unit}</span>
              </div>
              <p className="text-gray-400 text-sm mt-2 max-w-[180px]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
