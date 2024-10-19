import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import filterReplace from 'vite-plugin-filter-replace';
import { fileURLToPath } from 'url';
import * as sass from 'sass'

const lottieScopeVariables = [
  'value',
  'content',
  'loopOut',
  'numKeys',
  '$bm_mul',
  '$bm_sum',
  '$bm_sub',
  '$bm_div',
  '$bm_mod',
  '$bm_isInstanceOfArray',
  '$bm_transform',
  'anchorPoint',
  'time',
  'velocity',
  'inPoint',
  'outPoint',
  'width',
  'height',
  'name',
  'loop_in',
  'loop_out',
  'smooth',
  'toComp',
  'fromCompToSurface',
  'toWorld',
  'fromWorld',
  'mask',
  'position',
  'rotation',
  'scale',
  'thisComp',
  'active',
  'wiggle',
  'loopInDuration',
  'loopOutDuration',
  'comp',
  'lookAt',
  'easeOut',
  'easeIn',
  'ease',
  'nearestKey',
  'key',
  'text',
  'textIndex',
  'textTotal',
  'selectorValue',
  'framesToTime',
  'timeToFrames',
  'sourceRectAtTime',
  'substring',
  'substr',
  'posterizeTime',
  'index',
  'globalData',
  'frames',
  '$bm_neg',
  'add',
  'clamp',
  'radians_to_degrees',
  'degreesToRadians',
  'degrees_to_radians',
  'normalize',
  'rgbToHsl',
  'hslToRgb',
  'linear',
  'random',
  'createPath',
  '_lottieGlobal',
  'transform',
  'effect',
  'thisProperty',
  'loopIn',
  'fromComp',
  'thisLayer',
  'valueAtTime',
  'velocityAtTime',
];

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // workaround for a warning with lottie https://github.com/airbnb/lottie-web/issues/2927
    filterReplace([
      {
        filter: ['node_modules/lottie-web/build/player/lottie.js'],
        replace: {
          from: 'eval(\'[function _expression_function(){\' + val + \';scoped_bm_rt=$bm_rt}]\')[0]',
          to: `
          function _expression_function() {
            var valToEval = val;
            scoped_bm_rt = (new Function(
              'valToEval', ${lottieScopeVariables.map((v) => `'${v}'`).join(',')},
              'try {'
                + val + \`;
                return $bm_rt;
              } catch (e) {
                console.error("Error in lottie-web workaround. Fix the issue in vite.config.ts:", e, "Failed expression:", valToEval);
                throw e;
              }\`
            ))(valToEval, ${lottieScopeVariables.join(',')});
          }`,
        },
      },
    ]),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        implementation: sass,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
