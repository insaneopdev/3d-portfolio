import { createRoot } from 'react-dom/client';
import PhysicsCursor from './PhysicsCursor.jsx';

const mount = document.getElementById('physics-cursor-root');

if (mount) {
 createRoot(mount).render(<PhysicsCursor />);
}
