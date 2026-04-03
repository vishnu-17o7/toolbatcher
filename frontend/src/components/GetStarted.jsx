import React from 'react'
import styles from '../style'
import { arrowUp } from '../assets'

const GetStarted = () => {
  const scrollToToolSelector = () => {
    const toolSelector = document.getElementById('toolSelector');
    if (toolSelector) {
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      toolSelector.scrollIntoView({ behavior: reducedMotionQuery.matches ? 'auto' : 'smooth' });
    }
  };

  return (
    <button
      type='button'
      className='focus-ring tb-button-main inline-flex items-center gap-3 px-5 py-3 rounded-lg cursor-pointer'
      onClick={scrollToToolSelector}
      aria-label='Jump to tool selector'
    >
      <span className='font-semibold tracking-[0.04em] uppercase text-sm'>Open Tool Selector</span>
      <div className={`${styles.flexCenter} bg-black/15 rounded-md w-9 h-9`}>
        <img
          src={arrowUp}
          alt=''
          aria-hidden='true'
          className='w-[20px] h-[20px] object-contain rotate-90'
          decoding='async'
        />
      </div>
    </button>
  )
}

export default GetStarted
