import progress from 'rollup-plugin-progress';
export default {
  input: './src/index.js',
  plugins: [
      progress({
          clearLine: false // default: true
      })
  ],
  output: {
    file: './dist/js/main.js',
    format: 'iife'
  }
};
