import React, { useContext, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import logo from '../imgs/logo.png';
import { UserContext } from '../App';
import UserNavigation from './user-navigation.component';

const Navbar = () => {
  // State to toggle the visibility of the search box
  const [searchBoxVisible, setSearchBoxVisible] = useState(false);

  // State to toggle the visibility of the user navigation panel
  const [userNavPanel, setUserNavPanel] = useState(false);

  // Toggle visibility of user navigation panel
  const handelUserNavPanel = () => {
    setUserNavPanel(currentValue => !currentValue);
  };

  // Handle blur event to close the user nav panel when clicking outside
  const handelBlur = () => {
    setTimeout(() => {
      setUserNavPanel(false);
    }, 200);
  };

  // Accessing user authentication details (user data, access_token, and profile image)
  const { userAuth, userAuth: { access_token, profile_img } } = useContext(UserContext);

  return (
    <>
      <nav className='navbar'>
        {/* Logo Section */}
        <Link to='/' className='flex-none w-10'>
          <img src={logo} alt="Logo" className='w-full' />
        </Link>

        {/* Search Bar - Visibility controlled by searchBoxVisible */}
        <div
          className={
            "absolute bg-white w-full left-0 top-full mt-0.5 border-b border-gray py-4 px-[5vw] " +
            "md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto " +
            (searchBoxVisible ? "show" : "hide")
          }
        >
          <input
            type="text"
            placeholder='Search'
            className='w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark-grey md:pl-12'
          />
          <i className='fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey'></i>
        </div>

        {/* Navbar Links and Button */}
        <div className='flex items-center gap-3 md:gap-6 ml-auto'>
          {/* Mobile Search Button */}
          <button
            className='md:hidden bg-grey w-12 h-12 rounded-full flex items-center justify-center'
            onClick={() => setSearchBoxVisible(currentValue => !currentValue)} // Toggle search box visibility
          >
            <i className='fi fi-rr-search text-xl'></i>
          </button>

          {/* Write Link - Visible on desktop */}
          <Link to="/" className='hidden md:flex gap-2 link'>
            <i className='fi fi-rr-file-edit'></i>
            <p>Write</p>
          </Link>

          {
            // Conditional rendering based on access_token
            access_token ?
              <>
                {/* Notification Button - Visible when user is logged in */}
                <Link to="/dashboard/notification">
                  <button className='w-12 h-12 rounded-full bg-gray relative hover:bg-black/10'>
                    <i className='fi fi-rr-bell text-2xl black mt-1'></i>
                  </button>
                </Link>

                {/* User Profile Image - Clicking shows user navigation */}
                <div className='relative' onClick={handelUserNavPanel} onBlur={handelBlur}>
                  <button className='w-12 h-12 mt-1'>
                    <img
                      src={profile_img}
                      alt="Profile"
                      className='w-full h-full object-cover rounded-full'
                    />
                  </button>

                  {/* User Navigation Panel - Conditional rendering */}
                  {userNavPanel ? <UserNavigation /> : ""}
                </div>
              </>
              :
              <>
                {/* Sign In Link - Visible when user is not logged in */}
                <Link className='btn-dark py-2' to='/signin'>
                  Sign In
                </Link>

                {/* Sign Up Link - Visible on desktop only */}
                <Link className='btn-light py-2 hidden md:block' to='/Signup'>
                  Sign Up
                </Link>
              </>
          }
        </div>
      </nav>

      {/* Outlet for nested routing */}
      <Outlet />
    </>
  );
};

export default Navbar;
