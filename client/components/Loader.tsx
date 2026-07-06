"use client";

import "./loader.css";

interface LoaderProps {
  fadingOut?: boolean;
  message?: string;        // ← Added for flexibility
}

const Loader = ({ 
  fadingOut = false, 
  message = "Redirecting" 
}: LoaderProps) => {
  return (
    <div className={`loader-wrapper ${fadingOut ? "fade-out" : ""}`}>
      <div className="body">
        <span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </span>

        <div className="base">
          <span></span>
          <div className="face"></div>
        </div>
      </div>

      <div className="longfazers">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <h1>{message}</h1>
    </div>
  );
};

export default Loader;