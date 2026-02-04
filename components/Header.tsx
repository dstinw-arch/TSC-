
import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  allUsers: User[];
  onSwitchUser: (id: string) => void;
}

const Header: React.FC<HeaderProps> = ({ user, allUsers, onSwitchUser }) => {
  const getRoleName = (role: string) => {
    switch(role) {
      case 'MANAGER': return '主管';
      case 'EMPLOYEE': return '一般員工';
      default: return '管理員';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 p-4 flex flex-col gap-2 sticky top-0 z-10 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border-2 border-[#06C755]" />
            <div className="absolute -bottom-1 -right-1 bg-[#06C755] rounded-full p-0.5 border border-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-gray-900 leading-tight">
                {user.name} 
              </h1>
              <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md font-bold">
                {getRoleName(user.role)}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] text-[#06C755] font-black uppercase tracking-widest">@{user.lineId}</span>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span className="text-[9px] text-gray-400 font-bold">身分已驗證</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* 切換身分模擬器（僅開發測試用） */}
          <select 
            className="text-[10px] bg-gray-50 border border-gray-200 rounded-lg py-1 px-2 focus:ring-1 focus:ring-[#06C755] cursor-pointer font-bold text-gray-600 outline-none appearance-none"
            value={user.id}
            onChange={(e) => onSwitchUser(e.target.value)}
          >
            {allUsers.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};

export default Header;
