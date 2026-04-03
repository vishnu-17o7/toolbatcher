import React from 'react'
import styles, { layout } from '../style'
import { bill } from '../assets'

const About = () => {
  return (
    <section id="about" className={`${layout.sectionReverse} tb-reveal gap-12 md:gap-14`}>
      <div className={layout.sectionImgReverse}>
        <div className="relative w-[100%] h-[100%] overflow-hidden">
          <div className="absolute inset-0 z-[4] rounded-[20px] border border-[color:var(--color-stroke)] shadow-[0_0_22px_oklch(0.58_0.04_72_/0.24)]"></div>

          <img
            src={bill}
            alt="toolbatcher"
            className="w-[100%] h-[100%] relative z-[5] transform -scale-x-100 rounded-[20px]"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="absolute z-[3] -left-1/2 top-0 w-[50%] h-[50%] rounded-full white__gradient" />
        <div className="absolute z-[0] -left-1/2 bottom-0 w-[50%] h-[50%] rounded-full pink__gradient" />
      </div>

      <div className={layout.sectionInfo}>
        <p className='tb-kicker'>about the platform</p>
        <h2 className={styles.heading2}>
          Engineering onboarding should feel deliberate, not chaotic.
        </h2>

        <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
          ToolBatcher was created for teams tired of brittle setup docs and inconsistent local machines. We turn install steps into reproducible plans that engineers can review, trust, and run quickly.
        </p>

        <ul className='mt-6 space-y-3 text-dimWhite'>
          <li className='flex gap-3'><span className='text-secondary'>01</span><span>Version-aware installs for npm, PyPI, GitHub releases, Homebrew, and Winget sources.</span></li>
          <li className='flex gap-3'><span className='text-secondary'>02</span><span>Signed manifests and one-time runner delivery to protect execution integrity.</span></li>
          <li className='flex gap-3'><span className='text-secondary'>03</span><span>Cross-platform generation for Linux, macOS, and Windows with clear review flow.</span></li>
        </ul>
      </div>
    </section>
  )
}

export default About
