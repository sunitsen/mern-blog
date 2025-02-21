import { Link } from "react-router-dom";
import { getFullDay } from "../common/date";

const AboutUser = ({ bio, social_links, joinedAt, className }) => {

 
  return (
    <div className={`md:w-[90%] md:mt-7 ${className} mx-auto`}>
      <p className="text-xl leading-7 text-center md:text-left">
        {bio.length ? bio : "Nothing to read here"}
      </p>
      <div className="flex gap-x-7 gap-y-2 flex-wrap my-7 items-center justify-center md:justify-start text-dark-grey">
        {Object.keys(social_links).map((key) => {
          let link = social_links[key];
          return (
            link ? (
              <Link target="_blank" to={link} key={key}>
                <i
                  className={`fi ${
                    key !== "website" ? `fi-brands-${key}` : "fi-rr-globe"
                  } text-2xl hover:text-black`}
                ></i>
              </Link>
            ) : null
          );
        })}
      </div>
      <p className="text-xl leading-7 text-dark-grey text-center md:text-left">
        {getFullDay(joinedAt)}
      </p>
    </div>
  );
};

export default AboutUser;
