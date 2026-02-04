
export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export enum LeaveType {
  ANNUAL = '年假',
  SICK = '病假',
  PERSONAL = '事假',
  COMPASSIONATE = '喪假'
}

export type LeaveSession = 'FULL' | 'AM' | 'PM';

export interface User {
  id: string;
  name: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
  annualLeaveBalance: number;
  avatar: string;
  lineId: string;
  managerId?: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  session: LeaveSession; // 新增：全天、上午、下午
  days: number; // 新增：存儲計算後的天數
  reason: string;
  deputyId: string;
  deputyName: string;
  managerId: string;
  status: LeaveStatus;
  createdAt: string;
  comment?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedRequestId?: string;
}
