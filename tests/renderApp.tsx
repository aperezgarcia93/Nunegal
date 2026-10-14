import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../src/app/App';

export function renderApp(path = '/') {
  const user = userEvent.setup();
  const view = render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);
  return { user, ...view };
}
