import React from 'react'
import styles from '../style'
import Button from './Button'

const CTA = () => {
  return (
    <section className={`${styles.flexCenter} ${styles.marginY} ${styles.padding} sm:flex-row flex-col bg-black-gradient-2 rounded-[20px] box-shadow`}>
      <div className='flex-1 flex flex-col'>
        <h2 className={styles.heading2}>Start Batching Your Tools Now!</h2>
        <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
          Streamline your development workflow by creating custom tool batches. Save time and boost productivity with Toolbatcher.
        </p>
      </div>
      <div className={`${styles.flexCenter} sm:ml-10 ml-0`}>
        <Button text="Get Started" />
      </div>
    </section>
  )
}

export default CTA
