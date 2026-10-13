/** MusiTrackByTochi brand theme: strictly monochrome, taken from the logo
 *  (white on #080808). White is the only accent. */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        night: "#080808",   // page background, same black as the logo file
        surface: "#141414", // cards
        line: "#2B2B2B",    // borders, dividers, empty bars
        snow: "#FFFFFF",    // text, buttons, active states
      },
      fontFamily: {
        // The logo is set in a geometric sans; Montserrat is the closest web match.
        display: ['"Montserrat"', "system-ui", "sans-serif"],
        sans: ['"Montserrat"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
