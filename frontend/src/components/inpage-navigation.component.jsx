import { useEffect, useRef, useState } from "react";
export let activeTabLineRef;
export let activeTabRef;

const InPageNavigation = ({
  routes,
  defaultHidden = [],
  defaultActiveIndex = 0,
  children,
}) => {
   activeTabLineRef = useRef();
   activeTabRef = useRef();
  let [InPageNavIndex, setInPageNavIndex] = useState(defaultActiveIndex);

  const changePageState = (btn, index) => {
    let { offsetWidth, offsetLeft } = btn;

    if (activeTabLineRef.current) {
      activeTabLineRef.current.style.width = offsetWidth + "px";
      activeTabLineRef.current.style.left = offsetLeft + "px";
    }

    setInPageNavIndex(index);
  };

  useEffect(() => {
    changePageState(activeTabRef.current, defaultActiveIndex);
  }, []);

  return (
    <>
      <div className="relative mb-8 bg-white border-b border-gray-300 flex flex-nowrap overflow-x-auto">
        {routes.map((route, index) => {
          return (
            <button
            ref={index === defaultActiveIndex ? activeTabRef : null}
            key={index}
            className={
              "p-4 px-5 capitalize " +
              (InPageNavIndex === index ? "text-black" : "text-gray-custom") + // Adjusted text-gray-500 for better inactive state
              (defaultHidden.includes(route) ? " md:hidden" : "")
            }
            onClick={(e) => {
              changePageState(e.target, index);
            }}
          >
            {route}
          </button>
          
          );
        })}

        <hr
          ref={activeTabLineRef}
          className="absolute bottom-0 h-0 bg-black transition-all duration-300"
        />
      </div>

      {/* Only render the active tab content */}
      {Array.isArray(children) ? children[InPageNavIndex] : children}
    </>
  );
};

export default InPageNavigation;


