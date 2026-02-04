
import React, { useState, useEffect, useMemo } from 'react';
import { User, LeaveRequest, Notification, LeaveStatus, LeaveType } from './types';
import { MOCK_USERS, INITIAL_LEAVE_REQUESTS } from './mockData';
import Dashboard from './views/Dashboard';
import LeaveForm from './views/LeaveForm';
import NotificationCenter from './views/NotificationCenter';
import ManagerApproval from './views/ManagerApproval';
import Navigation from './components/Navigation';
import Header from './components/Header';

const STORAGE_KEYS = {
  USERS: 'line_leave_users',
  REQUESTS: 'line_leave_requests',
  NOTIFICATIONS: 'line_leave_notifications',
  CURRENT_USER_ID: 'line_leave_current_id'
};

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });
  
  const [requests, setRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return saved ? JSON.parse(saved) : INITIAL_LEAVE_REQUESTS;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || MOCK_USERS[0].id;
  });

  const [activeTab, setActiveTab] = useState<'home' | 'apply' | 'notifications' | 'approval'>('home');

  const currentUser = useMemo(() => 
    users.find(u => u.id === currentUserId) || users[0], 
    [users, currentUserId]
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    if (currentUser.role !== 'MANAGER' && activeTab === 'approval') {
      setActiveTab('home');
    }
  }, [currentUser.id, activeTab]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = useMemo(() => 
    notifications.filter(n => n.userId === currentUser.id && !n.isRead).length, 
    [notifications, currentUser.id]
  );

  const teamPendingCount = useMemo(() => 
    requests.filter(r => r.managerId === currentUser.id && r.status === LeaveStatus.PENDING).length,
    [requests, currentUser.id]
  );

  const handleCreateRequest = (newRequest: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>) => {
    const request: LeaveRequest = {
      ...newRequest,
      id: `r-${Date.now()}`,
      status: LeaveStatus.PENDING,
      createdAt: new Date().toISOString()
    };

    setRequests(prev => [request, ...prev]);

    const deputyNotification: Notification = {
      id: `notif-deputy-${Date.now()}`,
      userId: request.deputyId,
      title: '職務代理請求',
      message: `${currentUser.name} 已指定您為 ${request.startDate} 到 ${request.endDate} 期間的職務代理人。`,
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedRequestId: request.id
    };

    const managerNotification: Notification = {
      id: `notif-mgr-${Date.now()}`,
      userId: request.managerId,
      title: '新的請假待簽核',
      message: `${currentUser.name} 已提交一份 ${request.type} 申請。`,
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedRequestId: request.id
    };

    setNotifications(prev => [deputyNotification, managerNotification, ...prev]);
    setActiveTab('home');
  };

  // 專供主管使用的刪除功能
  const handleManagerDeleteRequest = (requestId: string) => {
    const target = requests.find(r => r.id === requestId);
    if (!target) return;

    if (!window.confirm(`【主管權限操作】\n確定要刪除 ${target.userName} 的這筆假單嗎？\n如果是已核准的年假，系統將自動退還額度。`)) return;

    // 1. 如果是已核准的年假，退還額度
    if (target.status === LeaveStatus.APPROVED && target.type === LeaveType.ANNUAL) {
      setUsers(prev => prev.map(u => 
        u.id === target.userId 
          ? { ...u, annualLeaveBalance: u.annualLeaveBalance + target.days }
          : u
      ));
    }

    // 2. 從列表移除該假單
    setRequests(prev => prev.filter(req => req.id !== requestId));

    // 3. 通知員工
    const deleteNotification: Notification = {
      id: `notif-del-${Date.now()}`,
      userId: target.userId,
      title: '假單已被主管移除',
      message: `主管 ${currentUser.name} 已將您於 ${target.startDate} 的請假申請移除。`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    
    setNotifications(prev => [deleteNotification, ...prev]);
  };

  const handleUpdateStatus = (requestId: string, status: LeaveStatus, comment?: string) => {
    setRequests(prevRequests => {
      return prevRequests.map(req => {
        if (req.id === requestId) {
          if (status === LeaveStatus.APPROVED && req.status !== LeaveStatus.APPROVED && req.type === LeaveType.ANNUAL) {
            setUsers(prevUsers => prevUsers.map(u => 
              u.id === req.userId 
                ? { ...u, annualLeaveBalance: Math.max(0, u.annualLeaveBalance - req.days) } 
                : u
            ));
          }

          const statusText = status === LeaveStatus.APPROVED ? '核准' : '駁回';
          const employeeNotification: Notification = {
            id: `notif-status-${Date.now()}`,
            userId: req.userId,
            title: `請假申請已${statusText}`,
            message: `您於 ${req.startDate} 的 ${req.type} 申請已被主管${statusText}。${comment ? '主管評議：' + comment : ''}`,
            isRead: false,
            createdAt: new Date().toISOString(),
            relatedRequestId: req.id
          };
          setNotifications(n => [employeeNotification, ...n]);
          
          return { ...req, status, comment };
        }
        return req;
      });
    });
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-2xl overflow-hidden relative border-x border-gray-200">
      <Header 
        user={currentUser} 
        onSwitchUser={setCurrentUserId}
        allUsers={users}
      />
      
      <main className="flex-1 overflow-y-auto pb-32 p-4 bg-gray-50">
        {activeTab === 'home' && (
          <Dashboard 
            user={currentUser} 
            requests={requests.filter(r => r.userId === currentUser.id)} 
            teamPendingCount={teamPendingCount}
            onGoToApproval={() => setActiveTab('approval')}
          />
        )}
        {activeTab === 'apply' && (
          <LeaveForm 
            key={currentUser.id}
            user={currentUser} 
            deputies={users.filter(u => u.id !== currentUser.id)} 
            onSubmit={handleCreateRequest}
            allRequests={requests}
          />
        )}
        {activeTab === 'notifications' && (
          <NotificationCenter 
            notifications={notifications.filter(n => n.userId === currentUser.id)}
            onRead={markNotificationAsRead}
          />
        )}
        {activeTab === 'approval' && currentUser.role === 'MANAGER' && (
          <ManagerApproval 
            managerId={currentUser.id}
            allRequests={requests.filter(r => r.managerId === currentUser.id)}
            onUpdateStatus={handleUpdateStatus}
            onDeleteRequest={handleManagerDeleteRequest}
          />
        )}
      </main>

      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        unreadCount={unreadCount}
        isManager={currentUser.role === 'MANAGER'}
      />
    </div>
  );
};

export default App;
