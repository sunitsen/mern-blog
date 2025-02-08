import { useContext } from "react";
import AnimationWrapper from "../common/page-animation";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { removeFromSession } from "../common/session";

const UserNavigation = () => {
  // Accessing user authentication context (username and setUserAuth)
  const { userAuth: { username }, setUserAuth } = useContext(UserContext);

  // Sign out function to remove user from session and update context state
  const SignOutUser = () => {
    removeFromSession("user"); // Remove user data from session storage
    setUserAuth({ access_token: null }); // Clear user authentication state
  };

  return (
    // Animation wrapper for smooth transition
    <AnimationWrapper
      className="absolute right-0 z-50"
      transitionIn={{ transition: { duration: 0.2 } }}
    >
      {/* User navigation menu */}
      <div className="bg-white absolute right-0 border-gray w-60 duration-200">
        {/* Link to write/edit blog post */}
        <Link to="/editor" className="flex gap-2 link md:hidden pl-8 py-4">
          <i className="fi fi-rr-edit"></i>
          <p>Write</p>
        </Link>

        {/* Link to user profile page using username */}
        <Link to={`/user/${username}`} className="link pl-8 py-4">
          Profile
        </Link>

        {/* Link to dashboard */}
        <Link to="dashboard/blogs" className="link pl-8 py-4">
          Dashboard
        </Link>

        {/* Link to settings page */}
        <Link to="settings/edit-profile" className="link pl-8 py-4">
          Settings
        </Link>

        {/* Divider line */}
        <span className="absolute border-t border-gray w-[100%]"></span>

        {/* Button to sign out the user */}
        <button
          className="text-left p-4 hover:border-gray w-full pl-8 py-4"
          onClick={SignOutUser}
        >
          <h1 className="font-bold text-xl mb-1">Sign Out</h1>
          <p className="text-dark-gray">@{username}</p>
        </button>
      </div>
    </AnimationWrapper>
  );
};

export default UserNavigation;
