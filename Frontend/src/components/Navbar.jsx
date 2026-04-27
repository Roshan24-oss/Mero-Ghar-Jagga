import React from 'react';
import logo from "../assets/Logo.png";
import { CiSearch } from "react-icons/ci";

const Navbar = () => {
  return (
    <nav className='fixed top-0 w-full bg-green-100 shadow-md z-50'>
      <div className='flex justify-between items-center'>

        {/* Logo */}
        <div className='ml-10'>
          <img src={logo} alt='Logo' className='h-19 w-30' />
        </div>

        {/* Search Bar */}
        <div className='mt-6 flex items-center bg-white rounded-md px-2'>
          <input
            type="text"
            placeholder='Search based on city...'
            className='px-4 py-2 outline-none w-80'
          />
          <CiSearch className="text-xl text-gray-600" />
        </div>

        {/* Button */}
        <div className='mr-10'>
          <button className='bg-orange-500 font-bold rounded-2xl px-4 py-2 text-white'>
            Sign In
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;