"use client";

import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;600;800&display=swap');

  :root {
    color: #e2e8f0;
    background-color: #1b1917;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: 'Nunito', sans-serif;
    background-color: #1b1917;
    color: #e7e5e4;
    touch-action: none;
  }

  ::selection {
    background: #10b981;
    color: #ffffff;
  }
`;

export default GlobalStyles;
