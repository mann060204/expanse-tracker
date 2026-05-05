import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserButton, OrganizationSwitcher } from '@clerk/clerk-react';
import { LayoutDashboard, ReceiptText } from 'lucide-react';

const BottomNav = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 sm:hidden z-50 px-4 pb-safe transition-colors">
      <div className="flex justify-between items-center h-16">
        <NavLink
          to="/"
          className={({ isActive }) => 
            `flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive 
                ? 'text-purple-600 dark:text-purple-400' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Dashboard</span>
        </NavLink>

        <NavLink
          to="/transactions"
          className={({ isActive }) => 
            `flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive 
                ? 'text-purple-600 dark:text-purple-400' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`
          }
        >
          <ReceiptText className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">History</span>
        </NavLink>

        <div className="flex flex-col items-center justify-center w-full h-full">
          <OrganizationSwitcher 
            hidePersonal={false}
            afterCreateOrganizationUrl="/"
            afterLeaveOrganizationUrl="/"
            afterSelectOrganizationUrl="/"
            appearance={{
              elements: {
                organizationSwitcherTrigger: "focus:ring-2 focus:ring-purple-500 outline-none rounded-lg text-slate-900 dark:text-white p-1",
                organizationSwitcherTriggerIcon: "w-4 h-4 text-slate-500 dark:text-slate-400",
                organizationPreviewMainIdentifier: "text-xs font-medium",
                organizationPreviewAvatarContainer: "w-6 h-6",
              }
            }}
          />
        </div>

        <div className="flex flex-col items-center justify-center w-full h-full pt-1">
          <UserButton afterSignOutUrl="/sign-in" appearance={{
            elements: {
              userButtonAvatarBox: "w-7 h-7"
            }
          }} />
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
