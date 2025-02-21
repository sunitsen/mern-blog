import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AnimatedWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { getDay } from "../common/date";
import BlogInteraction from '../components/blog-interaction.component'
import BlogPostCard from "../components/blog-post.component";
import BlogContent from "../components/blog-content.component";
export const blogStructure = {
    title: '',
    des: '',
    content: [], 
    author: { personal_info: { fullname: "", username: "", profile_img: "" } },
    banner: '',
    publishedAt: '',
};



export const BlogContext = createContext({});



const BlogPage = () => {
    let { blog_id } = useParams();
    const [blog, setBlog] = useState(blogStructure);
    const [loading, setLoading] = useState(true);
    const [similerBlogs, setSimilerBlogs] = useState(null);

    let { 
        title, 
        content,  
        banner, 
        author: { 
          personal_info: { fullname, username: author_username, profile_img } 
        }, 
        publishedAt, 
    } = blog;
    

    const fetchBlog = () => {
        axios.post(import.meta.env.VITE_SERVER_URL + "/get-blog", { blog_id })
            .then(({ data: { blog } }) => {
                setBlog(blog)

                axios.post(import.meta.env.VITE_SERVER_URL + "/search-blogs",{tag: blog.tags[0], limit: 4, eliminate_blog: blog_id})
                .then(({data}) =>{
                   setSimilerBlogs(data.blogs)
                
              
                })

               ;
            })
            .catch(err => {
                console.error("Error fetching blog:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        resetState();
        fetchBlog();
    },[blog_id]); // ✅ Include `blog_id` in dependencies to refetch when it changes


const resetState = () =>{
    setBlog(blogStructure);
    setSimilerBlogs(null);
    setLoading(true);
}


    return (
        <AnimatedWrapper>
            {loading ? (
                <Loader />
            ) :
            
            <BlogContext.Provider value={{blog, setBlog}}>
                 <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">
                    <img src={banner} alt={title} className="aspect-video" />
                    <div className="m-12">
                        <h2>{title}</h2>
                        <div className="flex max-sm:flex-col justify-between my-8">
                            <div className="flex gap-5 items-start">
                                <img className="w-12 h-12 rounded-full" src={profile_img} alt={fullname} />
                                <p className="capitalize">
                                    {fullname}
                                    <br />
                                    <Link to={`/user/${author_username}`} className="underline">
                                        @{author_username}
                                    </Link>
                                </p>
                            </div>
                            <p className="text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">Published on {getDay(publishedAt)}</p>
                        </div>
                    </div>

                    <BlogInteraction/>
                            {
                            content[0].blocks.map((block, index) =>{
                                return <div key={index} className="my-4 md:my-8">
                                    <BlogContent block={block}/>
                                    </div>
                            })
                            }
                    <BlogInteraction/>


                    {
                       similerBlogs !== null && similerBlogs.length ?   
                       <>
                        <h1 className="text-2xl mt-14 md-10 font-medium">
                            Similer Blogs
                        </h1>

                        {
                            similerBlogs.map((blog, index) =>{
                                let {author: {personal_info}} = blog;
                                return <AnimatedWrapper key={index} duration={1} delay={index * 0.08}>
                                   <BlogPostCard content={blog} author={personal_info}/>
                                </AnimatedWrapper>
                            })
                        }


                       </>
                       :
                       " "
                    }

                </div>
            </BlogContext.Provider>
            
            
            }
        </AnimatedWrapper>
    );
};

export default BlogPage;
