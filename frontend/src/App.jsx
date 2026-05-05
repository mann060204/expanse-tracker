import { Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn, SignIn, SignUp } from '@clerk/clerk-react';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Navbar from './components/Navbar';

import BottomNav from './components/BottomNav';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col">
      <SignedIn>
        <Navbar />
      </SignedIn>
      
      <div className="container mx-auto p-4 md:p-6 flex-grow pb-24 sm:pb-6">
        <Routes>
          {/* Clerk Hosted Pages */}
          <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
          <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
          
          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <>
                <SignedIn>
                  <Dashboard />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            } 
          />
          <Route 
            path="/transactions" 
            element={
              <>
                <SignedIn>
                  <Transactions />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            } 
          />
          
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      <footer className="w-full py-6 mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} TrackMySpend. All copyrights reserved by Mann Monpara.
          </p>
        </div>
      </footer>

      <SignedIn>
        <BottomNav />
      </SignedIn>
    </div>
  );
}

export default App;
