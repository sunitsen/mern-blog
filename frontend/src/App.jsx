import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar.component.jsx";
import UserAuthForm from "./pages/userAuthForm.page.jsx";
import Editor from "./pages/editor.pages.jsx";
import HomePage from "./pages/home.page.jsx";
import { createContext, useState, useEffect } from "react";
import { lookInSession } from "./common/session";
import SearchPage from "./pages/search.page.jsx";
import PageNotFound from "./pages/404.page.jsx";
import ProfilePage from "./pages/profile.page.jsx";
import BlogPage from "./pages/blog.page.jsx";
// Create and export a UserContext to manage global user authentication state
export const UserContext = createContext();

const App = () => {
  const [userAuth, setUserAuth] = useState({});

  useEffect(() => {
    let userInSession = lookInSession("user");

    userInSession
      ? setUserAuth(JSON.parse(userInSession))
      : setUserAuth({ access_token: null });
  }, []);

  return (
    <UserContext.Provider value={{ userAuth, setUserAuth }}>
      <Routes>
        <Route path="/editor" element={<Editor />} />
        
        <Route path="/editor/:blog_id" element={<Editor />} />


        {/* Routes wrapped in Navbar */}
        <Route path="/" element={<Navbar />}>
          <Route index element={<HomePage />} />
          <Route path="signin" element={<UserAuthForm type="sign-in" />} />
          <Route path="signup" element={<UserAuthForm type="sign-up" />} />
          <Route path="search/:query" element={<SearchPage/>} />
          <Route path="user/:id" element={<ProfilePage/>} />
          <Route path="blog/:blog_id" element={<BlogPage/>} />
          <Route path="*" element={<PageNotFound/>} />
        </Route>


       

      </Routes>
    </UserContext.Provider>
  );
};

export default App;
