import { render } from '@testing-library/react-native';

import Index from '../app/index';

describe('Index', () => {
  it('renders the starter screen', () => {
    const { getByText } = render(<Index />);

    expect(getByText('Edit src/app/index.tsx to edit this screen.')).toBeTruthy();
  });
});
