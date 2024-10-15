import React from 'react'
import styles from '../style'
import { logo } from '../assets'
import { socialMedia } from '../constants'

const footerLinks = [
  {
    title: "Useful Links",
    links: [
      { name: "Content", link: "/" },
      { name: "How it Works", link: "/" },
      { name: "Create", link: "/" },
      { name: "Explore", link: "/" },
      { name: "Terms & Services", link: "/" },
    ],
  },
  {
    title: "Community",
    links: [
      { name: "Help Center", link: "/" },
      { name: "Partners", link: "/" },
      { name: "Suggestions", link: "/" },
      { name: "Blog", link: "/" },
      { name: "Newsletters", link: "/" },
    ],
  },
  {
    title: "Partner",
    links: [
      { name: "Our Partner", link: "/" },
      { name: "Become a Partner", link: "/" },
    ],
  },
]

const Footer = () => {
  return (
    <section className={`${styles.flexCenter} ${styles.paddingY} flex-col p-8`}>
      <div className={`${styles.flexStart} md:flex-row flex-col mb-8 w-full`}>
        <div className='flex-1 flex flex-col justify-start mr-10'>
          <img
            src={logo}
            alt='toolbatcher'
            className='w-[266px] h-[72px] object-contain'
          />
          <p className={`${styles.paragraph} mt-4 max-w-[310px] p-4`}>
            Streamline your development workflow with custom tool batches.
          </p>
        </div>
        <div className='flex-[1.5] w-full flex flex-row justify-between flex-wrap md:mt-0 mt-10 p-4'>
          {footerLinks.map((link) => (
            <div key={link.title} className='flex flex-col ss:my-0 my-4 min-w-[150px]'>
              <h4 className='font-poppins font-medium text-[18px] leading-[27px] text-white'>
                {link.title}
              </h4>
              <ul className='list-none mt-4'>
                {link.links.map((item, index) => (
                  <li 
                    key={item.name} 
                    className={`font-poppins font-normal text-[16px] leading-[24px] text-dimWhite hover:text-secondary cursor-pointer ${index !== link.links.length - 1 ? 'mb-4' : 'mb-0'}`}
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className='w-full flex justify-between items-center md:flex-row flex-col pt-6 border-t-[1px] border-t-[#3F3E45] p-4'>
        <p className='font-poppins font-normal text-center text-[18px] leading-[27px] text-white'>
          2023 Toolbatcher. All Rights Reserved.
        </p>  
        <div className='flex flex-row md:mt-0 mt-6'>
          {socialMedia.map((social, index) => (
            <img
              src={social.icon}
              key={social.id}
              alt={social.id}
              className={`w-[21px] h-[21px] object-contain cursor-pointer ${index !== socialMedia.length - 1 ? 'mr-6' : 'mr-0'}`}
            />
          ))}
        </div>    
      </div>
    </section>
  )
}

export default Footer
