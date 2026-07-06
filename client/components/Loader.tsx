// components/Loader.tsx
"use client";

import "./loader.css"; // Import the CSS file for the spinner

interface LoaderProps {
  fadingOut?: boolean;
}

const Loader = ({ fadingOut = false }: LoaderProps) => {
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

      <h1>Redirecting</h1>
    </div>
  );
};

export default Loader;
