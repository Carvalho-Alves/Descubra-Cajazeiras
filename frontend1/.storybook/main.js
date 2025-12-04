import { defineConfig } from 'vite';

const config = {
  stories: [
    "../src/**/*.mdx", // Para arquivos MDX, se estiver usando
    "../src/**/*.stories.@(js|jsx|mjs)" // Ajustado para .jsx
  ],
  addons: [
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs", // Para documentação, se necessário
  ],
  framework: "@storybook/react-vite",
  viteFinal: (config) => {
    return {
      ...config,
      test: {
        globals: true,
        environment: 'jsdom',
      },
      assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.svg'], // Suporte a imagens
    };
  }
};

export default config;
