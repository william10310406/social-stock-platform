import { defineConfig } from 'vite';
import { createViteConfig } from './config/index.js';

export default defineConfig(({ mode }) => createViteConfig(mode));
