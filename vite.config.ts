import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

function prerenderPlugin() {
  return {
    name: 'prerender',
    closeBundle: async () => {
      console.log('\nRunning prerender...');
      try {
        const { stdout, stderr } = await execAsync('node prerender.ts', {
          cwd: process.cwd(),
        });
        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);
      } catch (error) {
        console.error('Prerender failed:', error);
        throw error;
      }
    },
  };
}

export default defineConfig({
  plugins: [preact(), prerenderPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Webamp into its own chunk (it's ~500KB)
          webamp: ['webamp'],
          // Split Preact into vendor chunk
          preact: ['preact'],
        },
      },
    },
  },
});
