import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function PublicLayout() {
  return (
    <>
      <Navbar />
      {/* The Outlet acts as a placeholder where Home or Help will be injected */}
      <Outlet /> 
    </>
  );
}