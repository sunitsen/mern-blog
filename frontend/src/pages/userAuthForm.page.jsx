import { useContext, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import { Link, Navigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/session";
import { UserContext } from "../App";
import { authWithGoogle } from "../common/firebase";

// Form validation helper function
const validateForm = (formData, type) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
  
  const { fullname, email, password } = formData;
  
  if (type === "signup" && fullname && fullname.length < 3) {
    return "Full name must be at least 3 characters long";
  }

  if (!email || !emailRegex.test(email)) {
    return "Please enter a valid email address";
  }

  if (!passwordRegex.test(password)) {
    return "Password must be 6-20 characters long with at least one number, one lowercase, and one uppercase letter";
  }

  return null;
};

const UserAuthForm = ({ type }) => {
  const { userAuth: { access_token }, setUserAuth } = useContext(UserContext);
  const [formData, setFormData] = useState({ fullname: "", email: "", password: "" });

  if (access_token) {
    return <Navigate to="/" />;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const userAuthThroughServer = (serverRoute, formData) => {
    axios
      .post(import.meta.env.VITE_SERVER_URL + serverRoute, formData)
      .then(({ data }) => {
        storeInSession("user", JSON.stringify(data));
        setUserAuth(data);
        toast.success("Authentication successful");
      })
      .catch(({ response }) => {
        toast.error(response?.data?.error || "Something went wrong");
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const serverRoute = type === "sign-in" ? "/signin" : "/signup";

    const validationError = validateForm(formData, type);
    if (validationError) {
      return toast.error(validationError);
    }

    userAuthThroughServer(serverRoute, formData);
  };

  const handelGoogleAuth = (e) => {
    e.preventDefault();
    authWithGoogle()
      .then((user) => {
        const serverRoute = '/google-auth';
        const formData = { access_token: user.accessToken };
        userAuthThroughServer(serverRoute, formData);
      })
      .catch(err => {
        toast.error('Trouble logging in with Google');
        console.log(err);
      });
  };

  return (
    <AnimationWrapper keyValue={type}>
      <section className="h-cover flex items-center justify-center">
        <Toaster />
        <form id="formElement" onSubmit={handleSubmit} className="w-[80%] max-w-[400px]">
          <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
            {type === "sign-in" ? "Welcome Back Sign In" : "Sign Up Today"}
          </h1>

          {type !== "sign-in" && (
            <InputBox
              name="fullname"
              type="text"
              placeholder="Full Name"
              icon="fi-rr-user"
              value={formData.fullname}
              onChange={handleInputChange}
            />
          )}

          <InputBox
            name="email"
            type="email"
            placeholder="Email"
            icon="fi-rr-envelope"
            value={formData.email}
            onChange={handleInputChange}
          />
          <InputBox
            name="password"
            type="password"
            placeholder="Password"
            icon="fi-rr-key"
            value={formData.password}
            onChange={handleInputChange}
          />

          <button className="btn-dark center mt-14" type="submit">
            {type.replace("-", " ")}
          </button>

          <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-blog font-blog">
            <hr className="w-1/2 border-block" />
            <p>or</p>
            <hr className="w-1/2 border-block" />
          </div>

          <button
            className="btn-dark flex items-center justify-center gap-4 w-[90%] center"
            onClick={handelGoogleAuth}
          >
            <img src={googleIcon} alt="Google" className="w-5" />
            Continue with Google
          </button>

          {type === "sign-in" ? (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Don't Have an Account?
              <Link to="/signup" className="underline text-black text-xl ml-1">
                Join Us Today
              </Link>
            </p>
          ) : (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Already Have an Account?
              <Link to="/signin" className="underline text-black text-xl ml-1">
                Sign In Here
              </Link>
            </p>
          )}
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default UserAuthForm;
