import { fireEvent, render, waitFor } from '@testing-library/react-native'

import ComplexForm from '@/app/(navigation)/form'

describe('ComplexForm', () => {
  test('shows email validation error on empty submit', async () => {
    const { getByText } = render(<ComplexForm />)

    fireEvent.press(getByText('Submit'))

    await waitFor(() => {
      expect(getByText('Invalid email')).toBeTruthy()
    })
  })
})
