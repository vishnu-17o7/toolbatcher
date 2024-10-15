import React from 'react'
import styles from '../style'

const HowToUse = () => {
  return (
    <section className={`${styles.paddingY} ${styles.flexCenter} flex-col relative`}>
      <div className="w-full flex justify-between items-center md:flex-row flex-col sm:mb-16 mb-6 relative z-[1]">
        <h2 className={styles.heading2}>
          How to Use <br className="sm:block hidden" /> Toolbatcher
        </h2>
        <div className="w-full md:mt-0 mt-6">
          <p className={`${styles.paragraph} text-left max-w-[450px]`}>
            Toolbatcher simplifies the process of setting up your development environment. Follow these steps to get started:
          </p>
        </div>
      </div>

      <div className="flex flex-wrap sm:justify-start justify-center w-full feedback-container relative z-[1]">
        {steps.map((step, index) => (
          <div key={step.id} className={`flex justify-between flex-col px-10 py-12 rounded-[20px] max-w-[370px] md:mr-10 sm:mr-5 mr-0 my-5 feedback-card`}>
            <div className="flex flex-row">
              <div className={`w-[64px] h-[64px] rounded-full ${styles.flexCenter} bg-dimBlue`}>
                <span className="font-poppins font-semibold text-[20px] leading-[32px] text-white">
                  {index + 1}
                </span>
              </div>
              <div className="flex flex-col ml-5">
                <h4 className="font-poppins font-semibold text-[20px] leading-[32px] text-white">
                  {step.title}
                </h4>
                <p className="font-poppins font-normal text-[16px] leading-[24px] text-dimWhite mt-2">
                  {step.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

const steps = [
  {
    id: "step-1",
    title: "Select Your Tools",
    content: "Choose from a variety of development tools and specify their versions.",
  },
  {
    id: "step-2",
    title: "Choose Target OS",
    content: "Select the operating system for which you want to generate the installation script.",
  },
  {
    id: "step-3",
    title: "Generate Script",
    content: "Click 'Generate Script' to create a custom installation script for your selected tools.",
  },
  {
    id: "step-4",
    title: "Download and Run",
    content: "Download the generated script and run it on your target machine to set up your environment.",
  },
];

export default HowToUse