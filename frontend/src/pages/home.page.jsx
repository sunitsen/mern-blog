import { useEffect, useState } from 'react';
import axios from 'axios';
import AnimatedWrapper from '../common/page-animation';
import InPageNavigation from '../components/inpage-navigation.component';
import Loader from '../components/loader.component';
import BlogPostCard from '../components/blog-post.component';
import MinimalBlogPost from '../components/nobanner-blog-post.component';
import NoDataMessage from '../components/nodata.component';
import { activeTabRef } from '../components/inpage-navigation.component';

const HomePage = () => {

  const [blogs, setBlog] = useState(null);
  const [trendingBlogs, setTrendingBlogs] = useState(null);
  let [pageState, setPageState] = useState("home");
  let categories = ["programming", "hollywood", "sports", "cooking", "tech", "finances", "travel"];

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

  const fetchLatestBlogs = async () => {
    axios
      .get(import.meta.env.VITE_SERVER_URL + '/latest-blog')
      .then(({ data }) => {
        setBlog(data.blogs);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const loadByCategory = (e) => {
    let category = e.target.innerText.toLowerCase();
    setBlog(null);

    if (pageState === category) {
      setPageState("home");
      return;
    }

    setPageState(category);
  };

  const fetchBlogsByCategory = () => {
    axios
      .post(import.meta.env.VITE_SERVER_URL + '/search-blogs', { tag: pageState })
      .then(({ data }) => {
        setBlog(data.blogs);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    activeTabRef.current.click();

    if (pageState === "home") {
      fetchLatestBlogs();
    } else {
      fetchBlogsByCategory();
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
                  blogs.length ?
                    blogs.map((blog, index) => {
                      return (
                        <AnimatedWrapper key={index} transition={{ duration: 1, delay: index * 0.1 }}>
                          <BlogPostCard content={blog} author={blog.author.personal_info} />
                        </AnimatedWrapper>
                      );
                    })
                    : <NoDataMessage message="No blogs published" />
                )
              }
            </>

            {
              trendingBlogs === null ? (
                <Loader />
              ) : (
                trendingBlogs.length ?
                  trendingBlogs.map((blog, index) => {
                    return (
                      <AnimatedWrapper key={index} transition={{ duration: 1, delay: index * 0.1 }}>
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
                        key={index}
                        className={"tag " +
                          (pageState === category ? "bg-black text-white" : "")}>
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
                      <AnimatedWrapper ke y={index} transition={{ duration: 1, delay: index * 0.1 }}>
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
