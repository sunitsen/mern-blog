
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import { Link } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import {storeInSession} from "../common/session";
import { Navigate } from "react-router-dom";
//use context
import { useContext } from "react";
import {UserContext} from "../App"
import { authWithGoogle } from "../common/firebase";

const UserAuthForm = ({ type }) => {

  let {userAuth: {access_token}, setUserAuth } = useContext(UserContext)
  console.log(access_token);

  
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


    console.log("Form submitted");

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
    

    const form = new FormData(formElement);
    const formData = {};
    for (const [key, value] of form.entries()) {
      formData[key] = value;
    }

    const { fullname, email, password } = formData;

    // Form Validation
    if (fullname && fullname.length < 3) {
      return toast.error("Full name must be at least 3 characters long");
    }

    if (!email || !emailRegex.test(email)) {
      return toast.error("Please enter a valid email address");
    }

    if (!passwordRegex.test(password)) {
      return toast.error(
        "Password must be 6-20 characters long with at least one number, one lowercase, and one uppercase letter"
      );
    }

    // Submit data to the server
    userAuthThroughServer(serverRoute, formData);
    console.log("Form Data Submitted:", formData);

  };









const handelGoogleAuth = (e) =>{ 
  e.preventDefault();
  authWithGoogle()
  .then((user) => {
    let serverRoute = '/google-auth'
    let formData = {
      access_token: user.accessToken,
    }
    userAuthThroughServer(serverRoute, formData);
  }).catch(err =>{
     toast.error('trouble login throw google');
     return console.log(err)
  })
}













  return (
    access_token ?
    <Navigate to="/" />
   : 
    <AnimationWrapper keyValue={type}>
      <section className="h-cover flex items-center justify-center">
        <Toaster />
        <form id="formElement"  onSubmit={handleSubmit} className="w-[80%] max-w-[400px]">
          <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
            {type === "sign-in" ? "Welcome Back Sign In" : "Sign Up Today"}
          </h1>

          {type !== "sign-in" && (
            <InputBox
              name="fullname"
              type="text"
              placeholder="Full Name"
              icon="fi-rr-user"
            />
          )}

          <InputBox
            name="email"
            type="email"
            placeholder="Email"
            icon="fi-rr-envelope"
          />
          <InputBox
            name="password"
            type="password"
            placeholder="Password"
            icon="fi-rr-key"
          />

          <button className="btn-dark center mt-14" type="submit">
            {type.replace("-", " ")}
          </button>

          <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-blog font-blog">
            <hr className="w-1/2 border-block" />
            <p>or</p>
            <hr className="w-1/2 border-block" />
          </div>





          <button className="btn-dark flex items-center justify-center gap-4 w-[90%] center"
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
