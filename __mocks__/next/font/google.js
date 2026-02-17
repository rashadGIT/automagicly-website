// Mock for next/font/google in Jest
module.exports = {
  Inter: () => ({
    className: 'inter',
    style: { fontFamily: 'Inter' },
  }),
  Roboto: () => ({
    className: 'roboto',
    style: { fontFamily: 'Roboto' },
  }),
};
