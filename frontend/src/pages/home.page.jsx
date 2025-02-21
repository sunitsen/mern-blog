import { useEffect, useState } from 'react';
import axios from 'axios';
import AnimatedWrapper from '../common/page-animation';
import InPageNavigation from '../components/inpage-navigation.component';
import Loader from '../components/loader.component';
import BlogPostCard from '../components/blog-post.component';
import MinimalBlogPost from '../components/nobanner-blog-post.component';
import NoDataMessage from '../components/nodata.component';
import { activeTabRef } from '../components/inpage-navigation.component';
import { filterPaginationData } from '../common/filter-pagination-data';
import LoadmoreDataBtn from '../components/load-more.component';

const HomePage = () => {

  const [blogs, setBlog] = useState(null);
  const [trendingBlogs, setTrendingBlogs] = useState(null);
  let [pageState, setPageState] = useState("home");
  let categories = ["Full Stack", "React", "Express", "MongoDB", "Node", "MERN", "Next", "No-Blogs"];
 
  console.log(blogs)
  const fetchTrendingBlogs = async () => {
    axios
      .get(import.meta.env.VITE_SERVER_URL + '/trending-blogs')
      .then(({ data }) => {
        setTrendingBlogs(data.blogs);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchLatestBlogs = async ({ page = 1 }) => {
    try {
      const { data } = await axios.post(import.meta.env.VITE_SERVER_URL + "/latest-blog", { page });

      let formattedData = await filterPaginationData({
        state: blogs, // Ensure `blogs` is defined
        data: data.blogs,
        page,
        countRoute: "/all-latest-blogs-count",
      });

      setBlog(formattedData);
    } catch (err) {
      console.log(err);
    }
  };

  const loadByCategory = (e) => {
    let category = e.target.innerText;
    setBlog(null);

    if (pageState === category) {
      setPageState("home");
      return;
    }

    setPageState(category);
  };

  const fetchBlogsByCategory = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_URL + '/search-blogs', { tag: pageState, page })
      .then(async ({ data }) => {
        let formattedData = await filterPaginationData({
          state: blogs, // Ensure `blogs` is defined
          data: data.blogs,
          page,
          data_to_send: { tag: pageState },
          countRoute: "/search-blogs-count",
        });

        setBlog(formattedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    activeTabRef.current.click();

    if (pageState === "home") {
      fetchLatestBlogs({ page: 1 });
    } else {
      fetchBlogsByCategory({ page: 1 });
    }

    if (!trendingBlogs) {
      fetchTrendingBlogs();
    }
  }, [pageState]);

  return (
    <AnimatedWrapper>
      <section className="h-cover justify-center gap-10 flex">
        {/* Latest Blogs */}
        <div className="w-full">
          <InPageNavigation routes={[pageState, "Trending blog"]} defaultHidden={["Trending blog"]}>
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
                <LoadmoreDataBtn state={blogs} fetchDataFun={(pageState === "home" ? fetchLatestBlogs : fetchBlogsByCategory)} />
            </>

            {
              trendingBlogs === null ? (
                <Loader />
              ) : (
                trendingBlogs.length ?
                  trendingBlogs.map((blog, index) => {
                    return (
                      <AnimatedWrapper key={blog._id || `trending-${index}`} transition={{ duration: 1, delay: index * 0.1 }}>
                        <MinimalBlogPost blog={blog} index={index} />
                      </AnimatedWrapper>
                    );
                  })
                  : <NoDataMessage message="No trending blogs" />
              )
            }
          </InPageNavigation>
        </div>

        {/* Filters and Trending Blogs */}
        <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-1 border-gray pl-8 pt-3 max-md:hidden">
          <div className="flex flex-col gap-10">
            <div>
              <h1 className="font-medium text-xl mb-8">Stories from all interests</h1>
              <div className='flex gap-3 flex-wrap'>
                {
                  categories.map((category, index) => {
                    return (
                      <button
                        onClick={loadByCategory}
                        key={index}  // Using category name as the key
                        className={"tag " + (pageState === category ? "bg-black text-white" : "")}>
                        {category}
                      </button>
                    );
                  })
                }
              </div>
            </div>

            <div>
              <h1 className='font-medium text-xl mb-8'>
                Trending
                <i className='fi fi-rr-arrow-trend-up'></i>
              </h1>
              {
                trendingBlogs === null ? (
                  <Loader />
                ) : (
                  trendingBlogs.length ?
                    trendingBlogs.map((blog, index) => {
                      return (
                        <AnimatedWrapper key={blog._id || `trending-${index}`} transition={{ duration: 1, delay: index * 0.1 }}>
                          <MinimalBlogPost blog={blog} index={index} />
                        </AnimatedWrapper>
                      );
                    })
                    : <NoDataMessage message="No trending blogs" />
                )
              }
            </div>
          </div>
        </div>
      </section>
    </AnimatedWrapper>
  );
};

export default HomePage;
