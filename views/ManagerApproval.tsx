
import React, { useState, useMemo } from 'react';
import { LeaveRequest, LeaveStatus, LeaveType } from '../types';
import { StatusBadge } from './Dashboard';

interface ManagerApprovalProps {
  managerId: string;
  allRequests: LeaveRequest[];
  onUpdateStatus: (requestId: string, status: LeaveStatus, comment?: string) => void;
  onDeleteRequest: (requestId: string) => void;
}

const ManagerApproval: React.FC<ManagerApprovalProps> = ({ allRequests, onUpdateStatus, onDeleteRequest }) => {
  const [subTab, setSubTab] = useState<'pending' | 'history' | 'stats'>('pending');
  const [comments, setComments] = useState<{ [key: string]: string }>({});

  const pendingRequests = allRequests.filter(r => r.status === LeaveStatus.PENDING);
  const historyRequests = allRequests.filter(r => r.status !== LeaveStatus.PENDING);

  const teamStats = useMemo(() => {
    const statsMap: Record<string, { name: string, leaves: Record<string, number> }> = {};
    
    allRequests.forEach(req => {
      if (req.status !== LeaveStatus.APPROVED) return;
      
      if (!statsMap[req.userId]) {
        statsMap[req.userId] = { 
          name: req.userName, 
          leaves: {
            [LeaveType.ANNUAL]: 0,
            [LeaveType.SICK]: 0,
            [LeaveType.PERSONAL]: 0,
            [LeaveType.COMPASSIONATE]: 0
          }
        };
      }
      statsMap[req.userId].leaves[req.type] = (statsMap[req.userId].leaves[req.type] || 0) + req.days;
    });
    
    return Object.values(statsMap);
  }, [allRequests]);

  const handleCommentChange = (id: string, value: string) => {
    setComments(prev => ({ ...prev, [id]: value }));
  };

  const sessionLabels: Record<string, string> = { 'FULL': '全天', 'AM': '上午', 'PM': '下午' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-6 bg-[#06C755] rounded-full"></div>
          <h2 className="text-xl font-black text-gray-900">主管專區</h2>
        </div>
      </div>

      <div className="bg-gray-200 p-1 rounded-2xl flex overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setSubTab('pending')}
          className={`flex-1 py-2 px-3 text-xs font-black rounded-xl transition-all whitespace-nowrap ${
            subTab === 'pending' ? 'bg-white text-[#06C755] shadow-sm' : 'text-gray-500'
          }`}
        >
          待簽核 ({pendingRequests.length})
        </button>
        <button 
          onClick={() => setSubTab('history')}
          className={`flex-1 py-2 px-3 text-xs font-black rounded-xl transition-all whitespace-nowrap ${
            subTab === 'history' ? 'bg-white text-[#06C755] shadow-sm' : 'text-gray-500'
          }`}
        >
          紀錄 ({historyRequests.length})
        </button>
        <button 
          onClick={() => setSubTab('stats')}
          className={`flex-1 py-2 px-3 text-xs font-black rounded-xl transition-all whitespace-nowrap ${
            subTab === 'stats' ? 'bg-white text-[#06C755] shadow-sm' : 'text-gray-500'
          }`}
        >
          團隊統計
        </button>
      </div>

      {subTab === 'pending' && (
        <div className="space-y-6">
          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-bold">目前沒有待處理的請假申請。</p>
            </div>
          ) : (
            pendingRequests.map(req => (
              <div key={req.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-4 relative">
                {/* 刪除按鈕 */}
                <button 
                  onClick={() => onDeleteRequest(req.id)}
                  className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-colors"
                  title="刪除/作廢假單"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>

                <div className="flex justify-between items-start pr-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-xl font-black text-[#06C755]">
                      {req.userName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-gray-900">{req.userName}</h3>
                      <p className="text-xs text-gray-500 font-bold uppercase">{req.type}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-bold">請假期間</span>
                    <span className="text-gray-900 font-black">{req.startDate} {req.startDate !== req.endDate && `~ ${req.endDate}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-bold">時段 / 天數</span>
                    <span className="text-[#06C755] font-black">{sessionLabels[req.session]} ({req.days}天)</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-400 font-black uppercase mb-1">事由</p>
                    <p className="text-sm text-gray-700">{req.reason}</p>
                  </div>
                </div>

                <textarea
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-3 text-sm outline-none focus:border-[#06C755] transition-all min-h-[80px]"
                  placeholder="輸入簽核評語 (選填)..."
                  value={comments[req.id] || ''}
                  onChange={(e) => handleCommentChange(req.id, e.target.value)}
                />

                <div className="flex gap-3">
                  <button onClick={() => onUpdateStatus(req.id, LeaveStatus.REJECTED, comments[req.id])} className="flex-1 py-3 px-4 rounded-2xl border-2 border-red-100 text-red-600 font-black text-sm hover:bg-red-50 transition-colors">駁回</button>
                  <button onClick={() => onUpdateStatus(req.id, LeaveStatus.APPROVED, comments[req.id])} className="flex-[2] py-3 px-4 rounded-2xl bg-[#06C755] text-white font-black text-sm shadow-lg shadow-[#06C755]/20 hover:bg-[#05b14c] transition-colors">核准</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {subTab === 'history' && (
        <div className="space-y-4">
          {historyRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-bold">尚無任何簽核紀錄。</p>
            </div>
          ) : (
            historyRequests.map(req => (
              <div key={req.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200 space-y-3 relative">
                <button 
                  onClick={() => onDeleteRequest(req.id)}
                  className="absolute top-4 right-4 p-1 text-gray-200 hover:text-red-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>

                <div className="flex justify-between items-center pr-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-400">{req.userName.charAt(0)}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-gray-900">{req.userName}</span>
                        <StatusBadge status={req.status} />
                      </div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">{req.type} ({req.days}天)</p>
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-gray-400 font-bold">
                    <p>{req.startDate}</p>
                    <p>{sessionLabels[req.session]}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {subTab === 'stats' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 font-bold mb-4 px-2 tracking-widest uppercase">員工累積已休天數 (僅計算已核准)</p>
            
            {teamStats.length === 0 ? (
              <p className="text-center py-8 text-gray-400 font-bold">尚無核准資料可供統計。</p>
            ) : (
              <div className="space-y-6">
                {teamStats.map(member => (
                  <div key={member.name} className="border-b border-gray-50 last:border-0 pb-6 last:pb-0">
                    <div className="flex items-center gap-2 mb-3 px-2">
                      <div className="w-2 h-2 rounded-full bg-[#06C755]"></div>
                      <span className="font-black text-gray-900">{member.name}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <StatItem label="年假" days={member.leaves[LeaveType.ANNUAL]} color="text-blue-600" bg="bg-blue-50" />
                      <StatItem label="病假" days={member.leaves[LeaveType.SICK]} color="text-red-600" bg="bg-red-50" />
                      <StatItem label="事假" days={member.leaves[LeaveType.PERSONAL]} color="text-orange-600" bg="bg-orange-50" />
                      <StatItem label="喪假" days={member.leaves[LeaveType.COMPASSIONATE]} color="text-gray-600" bg="bg-gray-50" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const StatItem: React.FC<{ label: string, days: number, color: string, bg: string }> = ({ label, days, color, bg }) => (
  <div className={`${bg} rounded-2xl p-3 border border-gray-100 flex justify-between items-center`}>
    <span className={`text-xs font-black ${color}`}>{label}</span>
    <span className="text-sm font-black text-gray-900">{days.toFixed(1)} <span className="text-[10px] opacity-40">天</span></span>
  </div>
);

export default ManagerApproval;
