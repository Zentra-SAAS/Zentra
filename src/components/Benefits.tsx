import React from 'react'
import { Store, BarChart3, Shield } from 'lucide-react'

export default function Benefits() {
  const benefits = [
    {
      icon: Store,
      title: "Manage Shops Easily",
      description: "Setup branches, products, employees in one place."
    },
    {
      icon: BarChart3,
      title: "Smart Insights",
      description: "Visualize sales, inventory & employee performance."
    },
    {
      icon: Shield,
      title: "Fraud Alerts",
      description: "Detect suspicious billing patterns & keep control."
    }
  ]

  return (
    <section className="py-20 bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon
            return (
              <div 
                key={index}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 text-center"
              >
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-4">
                  {benefit.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}