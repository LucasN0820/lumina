import { fireEvent, render } from '@testing-library/react-native';

import { ChipsSelector } from './chips-selector';

describe('ChipsSelector', () => {
  it('selects and deselects a finite chip option', () => {
    const onChange = jest.fn();
    const screen = render(<ChipsSelector onChange={onChange} values={{}} />);

    fireEvent.press(screen.getByTestId('chip-theme-自然'));
    expect(onChange).toHaveBeenLastCalledWith('theme', '自然');

    screen.rerender(<ChipsSelector onChange={onChange} values={{ theme: '自然' }} />);
    fireEvent.press(screen.getByTestId('chip-theme-自然'));
    expect(onChange.mock.calls[1]).toEqual(['theme', undefined]);
  });
});
