import { useState } from "react";

const InputBox = ({ name, type = "text", id, value, placeholder, icon, onChange }) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <div className="relative w-[100%] mb-4">
      <input
        name={name}
        type={type === "password" ? (passwordVisible ? "text" : "password") : type}
        placeholder={placeholder}
        value={value} // Use controlled value here
        id={id}
        onChange={onChange} // Allow parent component to handle change
        className="input-box"
      />

      <i className={`fi ${icon} input-icon`}></i>

      {type === "password" && (
        <i
          className={`fi fi-rr-eye${!passwordVisible ? "-crossed" : ""} input-icon left-[auto] right-4`}
          onClick={() => setPasswordVisible((prev) => !prev)}
        ></i>
      )}
    </div>
  );
};

export default InputBox;
