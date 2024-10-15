import React from 'react'
import styles, { layout } from '../style'
import { image } from '../assets'

const About = () => {
  return (
    <section id="about" className={layout.sectionReverse}>
      <div className={layout.sectionImgReverse}>
        {/* Wrapper for image with blurred border */}
        <div className="relative w-[100%] h-[100%] overflow-hidden">
          {/* Div to handle the blur effect on the border */}
          <div className="absolute inset-0 z-[4]" style={{
            padding: '10px', // Adjust the padding to control the size of the blur effect
            filter: 'blur(10px)', // Applying blur to this wrapper div
            borderRadius: '20px', // Optional: adjust the shape of the blur border
            backgroundColor: 'transparent', // Ensure the area is transparent
            boxShadow: '0 0 15px rgba(0, 0, 0, 0.5)', // Blurred border with shadow
          }}></div>

          {/* Actual Image */}
          <img
            src={image}
            alt="toolbatcher"
            className="w-[100%] h-[100%] relative z-[5] transform -scale-x-100"
            style={{
              borderRadius: '20px', // Same radius as the blur border
            }}
          />
        </div>
        <div className="absolute z-[3] -left-1/2 top-0 w-[50%] h-[50%] rounded-full white__gradient" />
        <div className="absolute z-[0] -left-1/2 bottom-0 w-[50%] h-[50%] rounded-full pink__gradient" />
      </div>

      <div className={layout.sectionInfo}>
        <h2 className={styles.heading2}>
          About Toolbatcher: <br className="sm:block hidden" /> Simplifying Development Setups
        </h2>
        <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
          Toolbatcher was born out of the frustration of spending countless hours setting up development environments. Our mission is to streamline this process, allowing developers to focus on what they do best - coding.
        </p>
        <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
          We understand that every project is unique, requiring different tools and configurations. That's why we've created a platform that allows you to easily select the tools you need, specify their versions, and generate custom installation scripts tailored to your target operating system.
        </p>
        <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
          Whether you're a seasoned developer or just starting out, Toolbatcher is here to make your life easier. Say goodbye to configuration headaches and hello to more productive coding time!
        </p>
      </div>
    </section>
  )
}

export default About
