import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './components/Header.js';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header />
      <main className="container mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default App;
