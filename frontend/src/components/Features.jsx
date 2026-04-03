import React from 'react'
import { features } from '../constants'
import styles, { layout } from '../style'

const FeatureCard = ({ icon, title, content, index }) => (
  <article className='tb-feature-row'>
    <div className='flex items-start gap-4'>
      <span className='tb-feature-index'>{`0${index + 1}`}</span>
      <div className='flex-1'>
        <div className='flex items-center gap-3'>
          <img src={icon} alt="" aria-hidden="true" loading="lazy" decoding="async" className="w-5 h-5 object-contain opacity-80" />
          <h4 className='font-poppins font-semibold text-white text-[1.1rem] tracking-[0.02em]'>
            {title}
          </h4>
        </div>
        <p className='font-poppins text-dimWhite text-[0.98rem] leading-[1.65] mt-2'>
          {content}
        </p>
      </div>
    </div>
  </article>
);

const Features = () =>  (
  <section id="features" className={`${layout.section} tb-reveal gap-12 md:gap-14`}>
    <div className={layout.sectionInfo}>
      <p className='tb-kicker'>why teams choose it</p>
      <h2 className={styles.heading2}>
        Workflow velocity without losing operational trust.
      </h2>
      <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
        ToolBatcher is built for teams that care about reproducibility and speed. The platform reduces setup drag while keeping every installation path visible and auditable.
      </p>
    </div>

    <div className={`${layout.sectionImg} flex-col tb-surface rounded-[1.1rem] px-6 py-6 sm:px-8 sm:py-8`}>
      {features.map((feature, index) => (
        <FeatureCard key={feature.id} {...feature} index={index} />
      ))}
    </div>
  </section>
);

export default Features