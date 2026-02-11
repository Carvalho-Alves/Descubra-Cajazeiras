import Footer from './Footer';

export default {
  title: 'Components/Footer',
  component: Footer,
};

export const Default = {
  args: {
    texto: 'Texto do rodapé',
  },
  decorators: [
    (Story) => (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        background: '#f9fafb'
      }}>
        <Story />
      </div>
    ),
  ],
};
