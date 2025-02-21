import { useContext, useEffect, useState, } from "react";
import { useParams, Link } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import axios from "axios";
import {UserContext} from "../App";
import AboutUser from "../components/about.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import InPageNavigation from "../components/inpage-navigation.component";
import AnimatedWrapper from "../common/page-animation";
import BlogPostCard from "../components/blog-post.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";


export const profileDataStructure = {
  personal_info: {
    fullname: "",
    username: "",
    profile_img: "",
    bio: "",
  },
  account_info: {
    total_posts: 0,
    total_reads: 0,
  },
  social_links: {},
  joinedAt: "",
};

const ProfilePage = () =>{
  let {id: profileId} = useParams();

  let [profile, setProfile] = useState(profileDataStructure);
  let [loading, setLoading] = useState(true);
  let [blogs, setBlogs] = useState(null);

  let [profileLoadded, setProfileLoadded] = useState("");




  let {personal_info: {fullname, username: profile_username, profile_img, bio}, 
  account_info: {total_posts, total_reads}, social_links, joinedAt} = profile

let {userAuth: {username}} = useContext(UserContext);


const fetchUserProfile = () => {
  axios.post(import.meta.env.VITE_SERVER_URL + "/get-profile", { username: profileId })
    .then(({ data: user }) => {
    setProfileLoadded(profileId);
      setProfile(user);
      getBlogs({ user_id: user._id });
      setLoading(false);

    })
    .catch(err => {
      console.log(err);
      setLoading(false);
    });
};

const getBlogs = ({page = 1, user_id}) =>{
  user_id = user_id == undefined ? blogs.user_id : user_id;
   
  axios
  .post(import.meta.env.VITE_SERVER_URL + "/search-blogs", {author: user_id, page})
  .then(async ({data}) =>{  
    let formattedData = await filterPaginationData({
      state: blogs,
      data: data.blogs,
      page,
      countRoute: "/search-blogs-count",
      data_to_send: {author: user_id},
    });
    formattedData.user_id = user_id;
    console.log("formate", formattedData)
    setBlogs(formattedData);
  })





}


useEffect(() =>{

if(profileId !== profileLoadded){
  setBlogs(null);
}
if(blogs == null){
  resetStates();
  fetchUserProfile()
}


},[profileId, blogs])


const resetStates = () =>{
  setProfile(profileDataStructure);
  setLoading(true);
  setProfileLoadded("");
}

  return(
    <AnimationWrapper>
      {
        loading ? <Loader/> :
        <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12"> 
          <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[50%] md:pl-8
          md:border-1 border-gray md:top-[100px] md:py-10
          ">
          <img
              src={profile_img}
              alt="Profile"
              className="w-48 h-48 bg-grey rounded-full md:w-31 md:h-32"
            />
            <h1 className="text-xl capitalize h-6">{fullname}</h1>
            <p>
              {total_posts.toLocaleString()} Blogs - {total_reads.toLocaleString()} Reads
            </p>

            <div className="flex gap-4 mt-2">
                {
                    profileId == username ?
                    <Link to="/setting/edit-profile" className="btn-light rounded-md">
                    Edit Profile
                    </Link> : ""

                }
       
            </div>


            <AboutUser bio={bio} social_links={social_links} joinedAt={joinedAt}/>

          </div>


          <div className="max-md:mt-12 w-full">
          <InPageNavigation routes={["Blogs Published", "About"]} defaultHidden={["About"]}>
            <>
              {
                blogs === null ? (
                  <Loader />
                ) : (
                  blogs.results.length ?
                    blogs.results.map((blog, index) => {
                      return (
                        <AnimatedWrapper key={blog._id || `blog-${index}`} transition={{ duration: 1, delay: index * 0.1 }}>
                          <BlogPostCard content={blog} author={blog.author.personal_info} />
                        </AnimatedWrapper>
                      );
                    })
                    : <NoDataMessage message="No blogs published" />
                )}
                <LoadMoreDataBtn state={blogs} fetchDataFun={getBlogs} />
            </>


           <AboutUser bio={bio} social_links={social_links} joinedAt={joinedAt}/>
           
          </InPageNavigation>
          </div>
        </section>
      }
    </AnimationWrapper>

  )
}

export default ProfilePage