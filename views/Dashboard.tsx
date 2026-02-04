
import React from 'react';
import { User, LeaveRequest, LeaveStatus, LeaveType } from '../types';

export const StatusBadge: React.FC<{ status: LeaveStatus }> = ({ status }) => {
  const configs = {
    [LeaveStatus.PENDING]: { text: '待簽核', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    [LeaveStatus.APPROVED]: { text: '已核准', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    [LeaveStatus.REJECTED]: { text: '已駁回', color: 'bg-red-100 text-red-700 border-red-200' },
    [LeaveStatus.CANCELLED]: { text: '已取消', color: 'bg-gray-100 text-gray-500 border-gray-200' },
  };

  const config = configs[status];

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.color}`}>
      {config.text}
    </span>
  );
};

interface DashboardProps {
  user: User;
  requests: LeaveRequest[];
  teamPendingCount?: number;
  onGoToApproval?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, requests, teamPendingCount = 0, onGoToApproval }) => {
  const getUsedDays = (type: LeaveType) => {
    return requests
      .filter(r => r.status === LeaveStatus.APPROVED && r.type === type)
      .reduce((sum, r) => sum + (r.days || 0), 0);
  };

  const usedAnnual = getUsedDays(LeaveType.ANNUAL);
  const usedSick = getUsedDays(LeaveType.SICK);
  const usedPersonal = getUsedDays(LeaveType.PERSONAL);

  return (
    <div className="space-y-6">
      {/* 個人假別概覽卡片 */}
      <section className="bg-gradient-to-br from-[#06C755] to-[#05b14c] rounded-[2.5rem] p-6 text-white shadow-xl shadow-[#06C755]/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-[11px] font-black opacity-80 uppercase tracking-widest mb-1">年假剩餘天數</h2>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black">{user.annualLeaveBalance}</span>
              <span className="text-sm font-bold opacity-80">天</span>
            </div>
          </div>
          {user.role === 'MANAGER' && teamPendingCount > 0 && (
            <button 
              onClick={onGoToApproval}
              className="bg-white/20 hover:bg-white/30 active:scale-95 backdrop-blur-md px-3 py-2 rounded-2xl flex items-center gap-2 transition-all border border-white/20"
            >
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse shadow-sm"></div>
              <span className="text-[10px] font-black">{teamPendingCount} 件待簽核</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 pt-6 border-t border-white/10">
          <div className="bg-white/10 rounded-2xl py-3 px-2 text-center backdrop-blur-sm border border-white/5">
            <p className="text-[9px] font-bold opacity-60 mb-1 tracking-tighter uppercase">已休年假</p>
            <p className="text-lg font-black">{usedAnnual}</p>
          </div>
          <div className="bg-white/10 rounded-2xl py-3 px-2 text-center backdrop-blur-sm border border-white/5">
            <p className="text-[9px] font-bold opacity-60 mb-1 tracking-tighter uppercase">已休病假</p>
            <p className="text-lg font-black">{usedSick}</p>
          </div>
          <div className="bg-white/10 rounded-2xl py-3 px-2 text-center backdrop-blur-sm border border-white/5">
            <p className="text-[9px] font-bold opacity-60 mb-1 tracking-tighter uppercase">已休事假</p>
            <p className="text-lg font-black">{usedPersonal}</p>
          </div>
        </div>
      </section>

      {/* 我的申請紀錄列表 */}
      <section>
        <div className="flex justify-between items-center mb-5 px-1">
          <h2 className="text-lg font-black text-gray-900">我的請假紀錄</h2>
          <span className="text-[10px] font-black bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full uppercase">紀錄總數: {requests.length}</span>
        </div>

        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
              <p className="text-gray-400 text-sm font-bold">目前沒有任何紀錄</p>
            </div>
          ) : (
            requests.map(req => {
              const sessionLabels: Record<string, string> = { 'FULL': '全天', 'AM': '上午', 'PM': '下午' };
              
              return (
                <div key={req.id} className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-1 h-10 rounded-full ${req.type === LeaveType.ANNUAL ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-gray-900">{req.type}</span>
                          <StatusBadge status={req.status} />
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider">代理人: {req.deputyName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className="text-lg font-black text-[#06C755]">{req.days}</span>
                       <span className="text-[10px] font-bold text-gray-400 ml-1">天 ({sessionLabels[req.session]})</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                    </svg>
                    {req.startDate} {req.startDate !== req.endDate && `~ ${req.endDate}`}
                  </div>
                  
                  {req.comment && (
                    <div className="mt-3 pt-3 border-t border-gray-50">
                      <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">主管評語</p>
                      <p className="text-xs text-gray-600 italic">「{req.comment}」</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
