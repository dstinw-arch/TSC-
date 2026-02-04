
import React from 'react';

interface NavigationProps {
  activeTab: 'home' | 'apply' | 'notifications' | 'approval';
  setActiveTab: (tab: 'home' | 'apply' | 'notifications' | 'approval') => void;
  unreadCount: number;
  isManager: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, unreadCount, isManager }) => {
  return (
    <nav className="bg-white border-t border-gray-200 px-6 py-2 flex justify-between items-center z-50 shadow-[0_-1px_10px_rgba(0,0,0,0.05)] h-20">
      <NavItem 
        label="首頁" 
        active={activeTab === 'home'} 
        onClick={() => setActiveTab('home')}
        icon={<path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />}
      />
      
      <NavItem 
        label="申請請假" 
        active={activeTab === 'apply'} 
        onClick={() => setActiveTab('apply')}
        icon={<path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />}
      />

      {isManager && (
        <NavItem 
          label="簽核" 
          active={activeTab === 'approval'} 
          onClick={() => setActiveTab('approval')}
          icon={<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />}
        />
      )}

      <NavItem 
        label="通知" 
        active={activeTab === 'notifications'} 
        onClick={() => setActiveTab('notifications')}
        badge={unreadCount > 0 ? unreadCount : undefined}
        icon={<path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />}
      />
    </nav>
  );
};

interface NavItemProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  badge?: number;
}

const NavItem: React.FC<NavItemProps> = ({ label, active, onClick, icon, badge }) => (
  <button 
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }} 
    className="flex flex-col items-center gap-1 relative group flex-1 py-1 active:scale-90 transition-transform"
  >
    <div className={`p-1 rounded-xl transition-colors ${active ? 'text-[#06C755]' : 'text-gray-400'}`}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
        {icon}
      </svg>
      {badge && (
        <span className="absolute top-0 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
          {badge}
        </span>
      )}
    </div>
    <span className={`text-[10px] font-bold transition-colors ${active ? 'text-[#06C755]' : 'text-gray-400'}`}>
      {label}
    </span>
  </button>
);

export default Navigation;
