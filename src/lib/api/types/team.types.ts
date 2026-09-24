export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  last_active_at?: string;
}

export interface InviteMemberDto {
  email: string;
  role: string;
}

export interface SetupAccountDto {
  token: string;
  name: string;
  password: string;
  password_confirmation?: string;
}
