import { RouterProvider } from 'react-router';
import { router } from './routes';
import { DiarioProvider } from './context/DiarioContext';

export default function App() {
  return (
    <DiarioProvider>
      <RouterProvider router={router} />
    </DiarioProvider>
  );
}
