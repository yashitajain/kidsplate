'use client'

import type { MenuItemWithFood } from '@/lib/supabase'
import type { AgeGroup } from '@/lib/nutrition'
import {
  RDA, calcAllDaysNutrition, calcWeeklyAverage,
  getPercentRDA, getColorClass,
  DAY_NAMES, NUTRIENT_LABELS,
} from '@/lib/nutrition'

type Props = {
  items: MenuItemWithFood[]
  ageGroup: AgeGroup
}

const NUTRIENTS: Array<{ key: keyof typeof NUTRIENT_LABELS; rdaKey: keyof typeof RDA['1-3'] }> = [
  { key: 'calories', rdaKey: 'calories' },
  { key: 'protein', rdaKey: 'protein' },
  { key: 'iron', rdaKey: 'iron' },
  { key: 'calcium', rdaKey: 'calcium' },
  { key: 'vitaminC', rdaKey: 'vitaminC' },
  { key: 'fiber', rdaKey: 'fiber' },
]

export default function NutritionSummary({ items, ageGroup }: Props) {
  const rda = RDA[ageGroup]
  const days = calcAllDaysNutrition(items)
  const avg = calcWeeklyAverage(days)

  return (
    <div className="space-y-4">
      <div className="flex gap-4 text-xs flex-wrap">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> ≥80% RDA</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" /> 50-80% RDA</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> &lt;50% RDA</span>
        <span className="text-gray-500">Age group: {ageGroup} years</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: 600 }}>
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 pr-4 font-semibold text-gray-600 w-36">Nutrient</th>
              <th className="text-right py-2 pr-4 font-semibold text-gray-600 w-20">RDA</th>
              {DAY_NAMES.map(d => (
                <th key={d} className="text-center py-2 font-semibold text-gray-600">{d}</th>
              ))}
              <th className="text-center py-2 font-semibold text-gray-600">Avg</th>
            </tr>
          </thead>
          <tbody>
            {NUTRIENTS.map(({ key, rdaKey }) => {
              const rdaValue = rda[rdaKey]
              const label = NUTRIENT_LABELS[key]
              return (
                <tr key={key} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium text-gray-700">{label}</td>
                  <td className="py-2 pr-4 text-right text-gray-500">{rdaValue}</td>
                  {days.map((day, i) => {
                    const val = day[key as keyof typeof day] as number
                    const pct = getPercentRDA(val, rdaValue)
                    return (
                      <td key={i} className="py-2 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className={`font-medium text-xs ${getColorClass(pct)}`}>
                            {Math.round(val * 10) / 10}
                          </span>
                          <div className="w-10 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.min(pct, 100)}%`,
                                backgroundColor: pct >= 80 ? '#22c55e' : pct >= 50 ? '#eab308' : '#ef4444',
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-400">{pct}%</span>
                        </div>
                      </td>
                    )
                  })}
                  <td className="py-2 text-center">
                    {(() => {
                      const val = avg[key as keyof typeof avg] as number
                      const pct = getPercentRDA(val, rdaValue)
                      return (
                        <div className="flex flex-col items-center gap-0.5">
                          <span className={`font-semibold text-xs ${getColorClass(pct)}`}>
                            {Math.round(val * 10) / 10}
                          </span>
                          <span className="text-[10px] text-gray-400">{pct}%</span>
                        </div>
                      )
                    })()}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
