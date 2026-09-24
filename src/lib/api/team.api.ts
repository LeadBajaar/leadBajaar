import api from './client';
import { TeamMember, InviteMemberDto, SetupAccountDto } from './types/team.types';

export const teamApi = {
  getMembers: async (): Promise<any[]> => {
    const response = await api.get<{ members: any[] }>('/team');
    return response.data.members;
  },

  inviteMember: async (data: InviteMemberDto): Promise<any> => {
    const response = await api.post('/team/invite', data);
    return response.data;
  },

  resendInvite: async (id: string): Promise<any> => {
    const response = await api.post(`/team/${id}/resend-invite`);
    return response.data;
  },

  updateRole: async (id: string, role: string): Promise<any> => {
    const response = await api.patch(`/team/${id}/role`, { role });
    return response.data;
  },

  removeMember: async (id: string): Promise<any> => {
    const response = await api.delete(`/team/${id}`);
    return response.data;
  },

  setupAccount: async (data: SetupAccountDto): Promise<any> => {
    try {
      const response = await api.post('/setup-account', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to setup account');
    }
  }
};

// Super Admin API Methods