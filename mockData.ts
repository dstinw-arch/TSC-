
import { User, LeaveRequest, LeaveStatus, LeaveType } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: '陳小明',
    role: 'EMPLOYEE',
    annualLeaveBalance: 14,
    avatar: 'https://picsum.photos/seed/alice/100/100',
    lineId: 'line_alice_001',
    managerId: 'u3'
  },
  {
    id: 'u2',
    name: '王大同',
    role: 'EMPLOYEE',
    annualLeaveBalance: 12,
    avatar: 'https://picsum.photos/seed/bob/100/100',
    lineId: 'line_bob_002',
    managerId: 'u3'
  },
  {
    id: 'u3',
    name: '林主管',
    role: 'MANAGER',
    annualLeaveBalance: 20,
    avatar: 'https://picsum.photos/seed/charlie/100/100',
    lineId: 'line_charlie_003'
  }
];

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'r1',
    userId: 'u1',
    userName: '陳小明',
    type: LeaveType.ANNUAL,
    startDate: '2025-05-20',
    endDate: '2025-05-22',
    session: 'FULL',
    days: 3,
    reason: '日本家族旅遊',
    deputyId: 'u2',
    deputyName: '王大同',
    managerId: 'u3',
    status: LeaveStatus.APPROVED,
    createdAt: '2025-05-01T10:00:00Z'
  },
  {
    id: 'r2',
    userId: 'u1',
    userName: '陳小明',
    type: LeaveType.SICK,
    startDate: '2025-06-02',
    endDate: '2025-06-02',
    session: 'FULL',
    days: 1,
    reason: '感冒發燒',
    deputyId: 'u2',
    deputyName: '王大同',
    managerId: 'u3',
    status: LeaveStatus.PENDING,
    createdAt: '2025-06-01T08:30:00Z'
  },
  {
    id: 'r3',
    userId: 'u2',
    userName: '王大同',
    type: LeaveType.PERSONAL,
    startDate: '2025-05-23',
    endDate: '2025-05-23',
    session: 'FULL',
    days: 1,
    reason: '家中有事處理',
    deputyId: 'u1',
    deputyName: '陳小明',
    managerId: 'u3',
    status: LeaveStatus.APPROVED,
    createdAt: '2025-05-21T14:00:00Z'
  }
];
