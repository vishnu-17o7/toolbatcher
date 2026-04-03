import React from 'react'
import { stats } from '../constants'

const Stats = () => {
  return (
    <section className='tb-reveal sm:mb-20 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-5'>
      {stats.map((stat) => (
        <article key={stat.id} className='tb-stat'>
          <strong>{stat.value}</strong>
          <span>{stat.title}</span>
        </article>
      ))}
    </section>
  )
}

export default Stats
