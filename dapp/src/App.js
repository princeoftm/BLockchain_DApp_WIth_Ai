import React from 'react';
import { Toaster } from 'react-hot-toast';
import Home from './Components/Home';
 
const App = () => {
  return (
    <main className="main">
      <Home />
      <Toaster />
    </main>
  );
};
 
export default App;