"use client";

import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;600;800&display=swap');

  :root {
    color: #e2e8f0;
    background-color: #1b1917;
  }

  html, body {
    background-color: #1b1917;
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    /* overflow-x: hidden; */
  }

  body > div {
    /* min-height: 100%; */
    /* width: 100%; */
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: 'Nunito', sans-serif;
    background-color: #1b1917;
    color: #e7e5e4;
  }

  ::selection {
    background: #10b981;
    color: #ffffff;
  }
`;

export default GlobalStyles;
