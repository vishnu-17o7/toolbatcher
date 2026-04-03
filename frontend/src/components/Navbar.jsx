import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { close, menu } from '../assets'
import { navLinks } from '../constants'

const Navbar = () => {
  const [toggle, setToggle] = useState(false)

  const toggleMenu = () => {
    setToggle((previous) => !previous)
  }

  return (
    <nav className='w-full flex justify-between items-center navbar'>
      <Link to='/' className='focus-ring flex items-center gap-3'>
        <span className='tb-mark' aria-hidden='true'>TB</span>
        <span className='tb-brand'>
          <strong>ToolBatcher</strong>
          <span>trusted install plans</span>
        </span>
      </Link>

      <ul className='list-none sm:flex hidden justify-end items-center flex-1'>
        {navLinks.map((nav, i) => (
          <li 
            key={nav.id}
            className={`font-poppins font-normal cursor-pointer text-[14px] ${i === navLinks.length - 1 ? 'mr-0' : 'mr-10'} text-white uppercase tracking-[0.1em]`}
          >
            <Link className='focus-ring tb-nav-link' to={nav.id === 'home' ? '/' : `/${nav.id}`}>
              {nav.title}
            </Link>
          </li>        
        ))}
      </ul>

      <div className='sm:hidden flex flex-1 justify-end items-center'>
        <button
          type='button'
          className='focus-ring w-11 h-11 flex items-center justify-center rounded-md tb-button-subtle'
          onClick={toggleMenu}
          aria-label={toggle ? 'Close navigation menu' : 'Open navigation menu'}
          aria-controls='mobile-navigation-menu'
          aria-expanded={toggle}
        >
          <img
            src={toggle ? close : menu}
            alt=''
            aria-hidden='true'
            className='w-7 h-7 object-contain'
            decoding='async'
          />
        </button>

        <div id='mobile-navigation-menu' className={`${toggle ? 'flex' : 'hidden'} p-6 tb-surface absolute top-20 right-0 mx-4 my-2 min-w-[210px] rounded-xl sidebar`}>
          <ul className='list-none flex flex-col justify-end items-center flex-1'>
            {navLinks.map((nav, i) => (
              <li 
                key={nav.id}
                className={`font-poppins font-normal cursor-pointer text-[14px] ${i === navLinks.length - 1 ? 'mr-0' : 'mb-4'} text-white uppercase tracking-[0.1em]`}
              >
                <Link className='focus-ring tb-nav-link' to={nav.id === 'home' ? '/' : `/${nav.id}`} onClick={() => setToggle(false)}>
                  {nav.title}
                </Link>
              </li>        
            ))}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
