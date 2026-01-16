'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { ROICalculation } from '@/lib/types';
import {
  Clock,
  DollarSign,
  Calendar,
  TrendingUp,
  Calculator,
  Sparkles
} from 'lucide-react';

const commonTasks = [
  'Lead follow-up emails',
  'Invoice processing',
  'Appointment scheduling',
  'Data entry',
  'Customer support tickets',
  'Report generation',
  'Document categorization',
  'Calendar management',
  'Custom task'
];

const buildCostPresets = {
  low: 500,
  medium: 1500,
  high: 3000
};

export default function ROICalculator() {
  const [taskName, setTaskName] = useState(commonTasks[0]);
  const [timePerTask, setTimePerTask] = useState(15);
  const [timesPerWeek, setTimesPerWeek] = useState(20);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [hourlyCost, setHourlyCost] = useState(35);
  const [efficiencyGain, setEfficiencyGain] = useState(70);
  const [buildCostLevel, setBuildCostLevel] = useState<'low' | 'medium' | 'high'>('medium');

  const [results, setResults] = useState<ROICalculation | null>(null);

  useEffect(() => {
    calculateROI();
  }, [taskName, timePerTask, timesPerWeek, numberOfPeople, hourlyCost, efficiencyGain, buildCostLevel]);

  const calculateROI = () => {
    const buildCost = buildCostPresets[buildCostLevel];

    // Calculate time saved
    const minutesPerWeek = timePerTask * timesPerWeek * numberOfPeople;
    const hoursPerWeek = minutesPerWeek / 60;
    const hoursSavedPerWeek = hoursPerWeek * (efficiencyGain / 100);
    const hoursSavedPerMonth = hoursSavedPerWeek * 4.33; // Average weeks per month

    // Calculate savings
    const monthlySavings = hoursSavedPerMonth * hourlyCost;

    // Calculate payback
    const paybackMonths = monthlySavings > 0 ? buildCost / monthlySavings : 0;

    // Calculate 12-month net savings
    const netSavings12Months = (monthlySavings * 12) - buildCost;

    setResults({
      taskName,
      timePerTask,
      timesPerWeek,
      numberOfPeople,
      hourlyCost,
      efficiencyGain,
      buildCost,
      hoursSavedPerMonth,
      monthlySavings,
      paybackMonths,
      netSavings12Months
    });
  };

  return (
    <section id="roi-calculator" className="py-20 px-4 bg-gradient-to-br from-blue-50 via-purple-50/30 to-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-brand-200 shadow-lg mb-6">
            <Calculator className="w-4 h-4 text-brand-600" />
            <span className="text-sm font-medium text-brand-900">
              Calculate Your Savings
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">ROI </span>
            <span className="text-gray-900">Calculator</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See how much automation could save your business
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card p-8 max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Task Name */}
            <div>
              <label htmlFor="task-to-automate" className="block text-sm font-semibold text-gray-700 mb-2">
                Task to Automate
              </label>
              <select
                id="task-to-automate"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="input-field"
              >
                {commonTasks.map((task) => (
                  <option key={task} value={task}>{task}</option>
                ))}
              </select>
            </div>

            {/* Time per task */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Time per Task (minutes): <span className="text-brand-600">{timePerTask}</span>
              </label>
              <input
                type="range"
                min="1"
                max="120"
                value={timePerTask}
                onChange={(e) => setTimePerTask(Number(e.target.value))}
                className="w-full accent-brand-600"
              />
            </div>

            {/* Times per week */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Times per Week: <span className="text-brand-600">{timesPerWeek}</span>
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={timesPerWeek}
                onChange={(e) => setTimesPerWeek(Number(e.target.value))}
                className="w-full accent-brand-600"
              />
            </div>

            {/* Number of people */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Number of People: <span className="text-brand-600">{numberOfPeople}</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={numberOfPeople}
                onChange={(e) => setNumberOfPeople(Number(e.target.value))}
                className="w-full accent-brand-600"
              />
            </div>

            {/* Hourly cost */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hourly Cost ($): <span className="text-brand-600">{hourlyCost}</span>
              </label>
              <input
                type="range"
                min="15"
                max="200"
                step="5"
                value={hourlyCost}
                onChange={(e) => setHourlyCost(Number(e.target.value))}
                className="w-full accent-brand-600"
              />
            </div>

            {/* Efficiency gain */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Efficiency Gain (%): <span className="text-brand-600">{efficiencyGain}</span>
              </label>
              <input
                type="range"
                min="20"
                max="95"
                step="5"
                value={efficiencyGain}
                onChange={(e) => setEfficiencyGain(Number(e.target.value))}
                className="w-full accent-brand-600"
              />
            </div>
          </div>

          {/* Build cost selector */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              Workflow Complexity
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setBuildCostLevel('low')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  buildCostLevel === 'low'
                    ? 'border-brand-600 bg-brand-50 shadow-lg'
                    : 'border-gray-300 hover:border-gray-400 hover-lift'
                }`}
              >
                <div className="font-semibold text-gray-900">Simple</div>
                <div className="text-sm text-gray-600">{formatCurrency(buildCostPresets.low)}</div>
              </button>
              <button
                onClick={() => setBuildCostLevel('medium')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  buildCostLevel === 'medium'
                    ? 'border-brand-600 bg-brand-50 shadow-lg'
                    : 'border-gray-300 hover:border-gray-400 hover-lift'
                }`}
              >
                <div className="font-semibold text-gray-900">Medium</div>
                <div className="text-sm text-gray-600">{formatCurrency(buildCostPresets.medium)}</div>
              </button>
              <button
                onClick={() => setBuildCostLevel('high')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  buildCostLevel === 'high'
                    ? 'border-brand-600 bg-brand-50 shadow-lg'
                    : 'border-gray-300 hover:border-gray-400 hover-lift'
                }`}
              >
                <div className="font-semibold text-gray-900">Complex</div>
                <div className="text-sm text-gray-600">{formatCurrency(buildCostPresets.high)}</div>
              </button>
            </div>
          </div>

          {/* Results */}
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="border-t-2 border-gray-200 pt-8"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-600" />
                Your Estimated ROI
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover-lift"
                >
                  <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-blue-600">
                    {formatNumber(results.hoursSavedPerMonth)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 font-medium">Hours Saved/Month</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="text-center p-6 bg-gradient-to-br from-success-50 to-success-100 rounded-xl hover-lift"
                >
                  <DollarSign className="w-8 h-8 text-success-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-success-600">
                    {formatCurrency(results.monthlySavings)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 font-medium">Monthly Savings</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover-lift"
                >
                  <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-purple-600">
                    {results.paybackMonths.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 font-medium">Payback (Months)</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl hover-lift"
                >
                  <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-orange-600">
                    {formatCurrency(results.netSavings12Months)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 font-medium">Net Savings (12mo)</div>
                </motion.div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Disclaimer:</strong> Estimates only. Final ROI depends on workflow scope and tool costs.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
