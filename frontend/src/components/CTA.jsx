import React from 'react'
import styles from '../style'
import { Link } from 'react-router-dom'

const CTA = () => {
  return (
    <section className={`${styles.flexCenter} ${styles.marginY} ${styles.padding} sm:flex-row flex-col tb-surface rounded-[20px] box-shadow tb-reveal`}>
      <div className='flex-1 flex flex-col'>
        <p className='tb-kicker'>next step</p>
        <h2 className={styles.heading2}>Generate your first trusted install command.</h2>
        <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
          Ship onboarding docs with confidence: one click for script output, one click for signed one-liner deployment.
        </p>
      </div>
      <div className={`${styles.flexCenter} sm:ml-10 ml-0 flex-wrap gap-3`}>
        <a href='#toolSelector' className='focus-ring tb-button-main px-5 py-3 rounded-lg'>Open Tool Selector</a>
        <Link to='/documentation' className='focus-ring tb-button-subtle px-5 py-3 rounded-lg'>Read Documentation</Link>
      </div>
    </section>
  )
}

export default CTA
