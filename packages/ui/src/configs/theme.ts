import { createTheme, virtualColor } from '@mantine/core'
import { FONTS } from './font.js'

export const theme = createTheme({
  fontFamily: FONTS.GEIST,
  fontFamilyMonospace: FONTS.GEIST_MONO,

  headings: {
    fontFamily: FONTS.GEIST,
  },

  autoContrast: true,
  cursorType: 'pointer',

  defaultRadius: '0.5rem',
  white: '#faf9f5',
  black: '#3d3929',
  primaryColor: 'primary',
  primaryShade: 5,
  defaultGradient: {
    from: '#e9e6dc',
    to: '#1a1915',
    deg: 113,
  },
  colors: {
    primary: virtualColor({
      name: 'primary',
      dark: 'primarydark',
      light: 'primarylight',
    }),
    //dark -mode
    dark: [
      '#c3c0b6',
      '#f5f4ee',
      'rgba(205, 203, 195, 1)',
      '#b7b5a9',
      '#3e3e38',
      '#faf9f5',
      '#1b1b19',
      '#262624',
      'rgba(30, 30, 29, 1)',
      'blue',
    ],

    //light -mode
    gray: [
      '#e9e6dc',
      'rgba(240, 238, 231, 1)',
      '#ede9de',
      '#b4b2a7',
      '#dad9d4',
      '#83827d',
      'rgba(168, 168, 164, 1)',
      '#28261b',
      'red',
      '#3d3929',
    ],
    primarylight: [
      'green',
      'green',
      'green',
      'green',
      'green',
      '#c96442',
      'rgba(209, 123, 94, 1)',
      'green',
      'green',
      'green',
    ],
    primarydark: [
      '#c3c0b6',
      '#d97757',
      'yellow',
      '#d97757',
      '#d97757',
      '#d97757',
      'rgba(184, 101, 74, 1)',
      'yellow',
      'yellow',
      'yellow',
    ],
  },
})
