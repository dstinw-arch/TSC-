
import React, { useState, useRef, useMemo } from 'react';
import { User, LeaveType, LeaveRequest, LeaveSession, LeaveStatus } from '../types';
import { calculateWorkDays } from '../utils/dateUtils';

interface LeaveFormProps {
  user: User;
  deputies: User[];
  allRequests: LeaveRequest[];
  onSubmit: (request: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>) => void;
}

const LeaveForm: React.FC<LeaveFormProps> = ({ user, deputies, allRequests, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: LeaveType.ANNUAL,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    session: 'FULL' as LeaveSession,
    reason: '',
    deputyId: '',
  });

  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  const estimatedDays = useMemo(() => {
    return calculateWorkDays(formData.startDate, formData.endDate, formData.session);
  }, [formData.startDate, formData.endDate, formData.session]);

  const conflicts = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return [];
    
    return allRequests.filter(req => {
      if (req.userId === user.id) return false;
      if (req.status !== LeaveStatus.APPROVED && req.status !== LeaveStatus.PENDING) return false;

      const isSameTeam = 
        (req.managerId === user.managerId) || 
        (req.userId === user.managerId) || 
        (req.managerId === user.id);
        
      if (!isSameTeam) return false;

      return formData.startDate <= req.endDate && formData.endDate >= req.startDate;
    });
  }, [formData.startDate, formData.endDate, allRequests, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.deputyId) {
      alert("請填寫所有必填欄位。");
      return;
    }
    
    if (estimatedDays === 0) {
      alert("所選日期範圍內無工作日，無需請假。");
      return;
    }

    if (conflicts.length > 0) {
      const names = conflicts.map(c => c.userName).join('、');
      const confirmSubmit = window.confirm(
        `【！人力衝突警示！】\n\n同仁 [${names}] 已經在該時段請假了。\n\n確定仍要提交申請嗎？`
      );
      if (!confirmSubmit) return;
    }

    const deputy = deputies.find(d => d.id === formData.deputyId);
    
    onSubmit({
      userId: user.id,
      userName: user.name,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      session: formData.session,
      days: estimatedDays,
      reason: formData.reason,
      deputyId: formData.deputyId,
      deputyName: deputy?.name || '未知',
      managerId: user.managerId || 'u3',
    });
  };

  const sessions: { label: string, value: LeaveSession }[] = [
    { label: '全天', value: 'FULL' },
    { label: '上午', value: 'AM' },
    { label: '下午', value: 'PM' }
  ];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
        <div className="w-2 h-6 bg-[#06C755] rounded-full"></div>
        <h2 className="text-xl font-black text-gray-900">填寫請假單</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 假別 */}
        <div>
          <label className="block text-xs font-black text-gray-500 uppercase mb-3 tracking-widest">假別選取</label>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(LeaveType).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type }))}
                className={`py-3 px-4 rounded-2xl text-sm font-bold transition-all border-2 ${
                  formData.type === type 
                  ? 'border-[#06C755] bg-[#06C755]/10 text-[#06C755] shadow-sm' 
                  : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* 日期選擇 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest">開始日期</label>
            <input
              ref={startDateRef}
              type="date"
              className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 text-sm text-gray-900 font-bold focus:border-[#06C755] outline-none"
              value={formData.startDate}
              onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              required
            />
          </div>
          <div className="relative">
            <label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest">結束日期</label>
            <input
              ref={endDateRef}
              type="date"
              className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 text-sm text-gray-900 font-bold focus:border-[#06C755] outline-none"
              value={formData.endDate}
              onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              required
            />
          </div>
        </div>

        {/* 時段選擇 */}
        <div>
          <label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest">請假時段</label>
          <div className="flex bg-gray-100 p-1 rounded-2xl">
            {sessions.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, session: s.value }))}
                className={`flex-1 py-3 px-2 rounded-xl text-xs font-black transition-all ${
                  formData.session === s.value 
                  ? 'bg-white text-[#06C755] shadow-md' 
                  : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-2 ml-1">註：跨日請假僅能選擇「全天」</p>
        </div>

        {/* 衝突警示提示 */}
        {conflicts.length > 0 && (
          <div className="bg-red-600 rounded-2xl p-4 space-y-2 animate-bounce-short shadow-lg shadow-red-200 border-2 border-red-700">
            <div className="flex items-center gap-2 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              <span className="text-base font-black">偵測到同仁請假衝突！</span>
            </div>
            <p className="text-sm text-red-50 font-bold">
              同仁 {conflicts.map(c => c.userName).join('、')} 已在此期間請假。
            </p>
          </div>
        )}

        {/* 預計扣除天數 */}
        <div className="bg-[#06C755]/5 border-2 border-[#06C755]/20 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <p className="text-xs font-black text-[#06C755] uppercase tracking-widest">預計扣除天數</p>
            <p className="text-[10px] text-gray-400 font-bold">已考慮週末與補班日</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-[#06C755]">{estimatedDays}</span>
            <span className="text-xs font-bold text-[#06C755] ml-1">天</span>
          </div>
        </div>

        {/* 代理人 */}
        <div>
          <label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest">職務代理人</label>
          <select
            className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 text-sm text-gray-900 font-bold focus:border-[#06C755] outline-none"
            value={formData.deputyId}
            onChange={e => setFormData(prev => ({ ...prev, deputyId: e.target.value }))}
            required
          >
            <option value="">請選擇代理人</option>
            {deputies.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* 事由 */}
        <div>
          <label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest">請假事由</label>
          <textarea
            className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 text-sm text-gray-900 font-medium focus:border-[#06C755] outline-none min-h-[100px]"
            placeholder="請輸入原因..."
            value={formData.reason}
            onChange={e => setFormData(prev => ({ ...prev, reason: e.target.value }))}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#06C755] text-white font-black py-4 rounded-2xl text-lg shadow-lg hover:bg-[#05b14c] transition-all"
        >
          提交申請
        </button>
      </form>
    </div>
  );
};

export default LeaveForm;
