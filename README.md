# vite-plugin-cdn-externals

Use to external cdn resources eg.React, Vue

## Usage

```typescript

import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import cdnExternals from 'vite-plugin-cdn-externals';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactRefresh(),
    cdnExternals({
      react: 'React',
      'react-dom': 'ReactDOM',
      '@alifd/next': 'Next',
      moment: 'moment',
    }),
  ],
});
```
