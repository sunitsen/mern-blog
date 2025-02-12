import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar.component.jsx";
import UserAuthForm from "./pages/userAuthForm.page.jsx";
import Editor from "./pages/editor.pages.jsx";
import HomePage from "./pages/home.page.jsx";
// Import context-related hooks and functions
import { createContext, useState, useEffect } from "react";

// Import the function to look in session storage
import { lookInSession } from "./common/session";

// Create and export a UserContext to manage global user authentication state
export const UserContext = createContext();

const App = () => {
  // Create state to manage user authentication data
  const [userAuth, setUserAuth] = useState({});

  useEffect(() => {
    // Look for the user data in session storage when the app loads
    let userInSession = lookInSession("user");

    // If user data exists in session, set the userAuth state with the parsed data
    // If not, set the userAuth state to an object with null access_token
    userInSession
      ? setUserAuth(JSON.parse(userInSession))
      : setUserAuth({ access_token: null });
  }, []); 

  return (

    <UserContext.Provider value={{ userAuth, setUserAuth }}>
      <Routes>
        <Route path="/editor" element={<Editor />} />
   
        <Route path="/" element={<Navbar />}>
          <Route index element={<HomePage />} />
          <Route path="signin" element={<UserAuthForm type="sign-in" />} />
          <Route path="signup" element={<UserAuthForm type="sign-up" />} />

        </Route>
      </Routes>
    </UserContext.Provider>
  );
};

export default App;
