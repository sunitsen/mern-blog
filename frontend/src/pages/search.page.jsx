import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import InPageNavigation from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import AnimatedWrapper from "../common/page-animation";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import UserCard from "../components/usercard.component";

import axios from "axios";


const SearchPage = () => {
    let { query } = useParams();
    let [blogs, setBlog] = useState(null);

    
    let [users, setUsers] = useState(null);



    // Search blogs function
    const searchBlogs = ({ page = 1, create_new_arr = false }) => {
        axios.post(import.meta.env.VITE_SERVER_URL + "/search-blogs", { query, page })
            .then(async ({ data }) => {
                let formattedData = await filterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    countRoute: "/search-blogs-count",
                    data_to_send: { query },
                    create_new_arr
                });

                setBlog(formattedData);
            })
            .catch((err) => {
                console.log(err);
            });
    };


    // Fetch users function


//issue
    const fetchUsers = () => {
        console.log(query)
        axios.post(import.meta.env.VITE_SERVER_URL + "/search-users", { query })
      
        .then(({ data: { users } }) => {
            console.log('API Response:', users); // Log the entire response here
            setUsers(users);
        })
        .catch((err) => {
            console.log(err);
        });
    }
    
    
    useEffect(() => {
        resetState();
        searchBlogs({ page: 1, create_new_arr: true });
        fetchUsers();
    }, [query]);

    const resetState = () => {
        setBlog(null);
        setUsers(null);
    };



    //issue

    // UserCardWrapper component to display users
const UserCardWrapper = () => {
    return(
        <>
        {
            users === null ? <Loader/> :
            users.length ?
            users.map((user, index) =>{
                console.log("this is", user)
                return <AnimatedWrapper key={index} 
                 transition={{ duration: 1, delay: index * 0.08 }}>
                     <UserCard user={user} />
                </AnimatedWrapper>
            })
            : 
            <NoDataMessage message="No users found" />
        }
        </>
    )
}



















    return (
        <section className="h-cover flex justify-center gap-10">
            <div className="w-full">
                <InPageNavigation
                    routes={[`Search Results from "${query}"`, "Account Matched"]}
                    defaultHidden={["Account Matched"]}
                >
                    <>
                        {blogs === null ? (
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
                        <LoadMoreDataBtn state={blogs} fetchDataFun={searchBlogs} />
                    </>
                    <UserCardWrapper />

                </InPageNavigation>
            </div>

 <div className="min-w-[40%] lg:min-w-[330px] max-w-min border-1 border-grey pl-8 pt-3 max-md:hidden">
   <h1 className="font-medium text-xl mb-8">User Related to search <i className="fi fi-rr-user"></i> </h1>
   
   <UserCardWrapper />
 
 
 </div>




        </section>
    );
};

export default SearchPage;
