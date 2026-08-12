import { supabase } from './supabaseClient';

const isSupabaseReady = () => {
  if (!supabase) {
    console.warn('SHIELD Agent: Supabase client is not available. Consultation features disabled.');
    return false;
  }
  return true;
};

const getSignedInUser = async () => {
  if (!isSupabaseReady()) return null;
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error && /session/i.test(error.message || '')) return null;
  if (error) throw error;
  return user;
};

const groupByUserId = (messages) => {
  return (messages || []).reduce((acc, msg) => {
    const uid = msg.user_id;
    if (!acc[uid]) acc[uid] = [];
    acc[uid].push(msg);
    return acc;
  }, {});
};

export const consultationService = {
  async getMessages(userId) {
    if (!isSupabaseReady()) return [];
    try {
      const user = await getSignedInUser();
      const targetUserId = user?.id || userId;
      if (!targetUserId || typeof targetUserId !== 'string') return [];

      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('SHIELD Agent: getMessages failed:', e);
      return [];
    }
  },

  async getAllConsultations() {
    if (!isSupabaseReady()) return {};
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return groupByUserId(data);
    } catch (e) {
      console.error('SHIELD Agent: getAllConsultations failed:', e);
      return {};
    }
  },

  async sendMessage(userId, text, type = 'question') {
    if (!isSupabaseReady()) throw new Error('상담 서비스를 사용할 수 없습니다.');

    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('유효하지 않은 사용자 ID입니다.');
    }
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('메시지 내용이 비어 있습니다.');
    }

    const user = await getSignedInUser();
    const targetUserId = type === 'question' ? user?.id : userId.trim();
    if (!targetUserId) {
      throw new Error('로그인 세션을 확인할 수 없습니다.');
    }

    const sanitizedText = text.trim().slice(0, 2000);
    const { data, error } = await supabase
      .from('consultations')
      .insert([{ user_id: targetUserId, text: sanitizedText, type }])
      .select();

    if (error) throw error;
    return data?.[0] || null;
  },

  async deleteMessage(id) {
    if (!isSupabaseReady()) throw new Error('상담 서비스를 사용할 수 없습니다.');
    if (!id) throw new Error('삭제할 메시지 ID가 없습니다.');

    const { error } = await supabase
      .from('consultations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async deleteConsultationRoom(userId) {
    if (!isSupabaseReady()) throw new Error('상담 서비스를 사용할 수 없습니다.');
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('유효하지 않은 사용자 ID입니다.');
    }

    const { error } = await supabase
      .from('consultations')
      .delete()
      .eq('user_id', userId.trim());

    if (error) throw error;
    return true;
  },

  subscribe(userId, callback) {
    if (!isSupabaseReady()) return function() {};
    try {
      const channel = supabase
        .channel('room:' + userId)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'consultations',
          filter: 'user_id=eq.' + userId
        }, function(payload) {
          try { callback(payload); } catch (e) {
            console.error('SHIELD Agent: Realtime callback error:', e);
          }
        })
        .subscribe();

      return function() {
        try { supabase.removeChannel(channel); } catch (e) {
          console.warn('SHIELD Agent: Channel cleanup error:', e);
        }
      };
    } catch (e) {
      console.error('SHIELD Agent: Realtime subscription failed:', e);
      return function() {};
    }
  },

  subscribeAll(callback) {
    if (!isSupabaseReady()) return function() {};
    try {
      const channel = supabase
        .channel('admin-room')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'consultations'
        }, function(payload) {
          try { callback(payload); } catch (e) {
            console.error('SHIELD Agent: Admin realtime callback error:', e);
          }
        })
        .subscribe();

      return function() {
        try { supabase.removeChannel(channel); } catch (e) {
          console.warn('SHIELD Agent: Admin channel cleanup error:', e);
        }
      };
    } catch (e) {
      console.error('SHIELD Agent: Admin realtime subscription failed:', e);
      return function() {};
    }
  },

  async signInAnonymously() {
    if (!isSupabaseReady()) return null;
    try {
      const existingUser = await getSignedInUser();
      if (existingUser) return existingUser;

      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      return data.user;
    } catch (e) {
      console.error('SHIELD Agent: Anonymous Sign-in failed:', e);
      return null;
    }
  },

  async getCurrentUser() {
    if (!isSupabaseReady()) return null;
    return getSignedInUser();
  },

  isAdminUser(user) {
    return user?.app_metadata?.role === 'admin';
  },

  async signInAsAdmin(email, password) {
    if (!isSupabaseReady()) throw new Error('상담 서비스를 사용할 수 없습니다.');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!this.isAdminUser(data.user)) {
      await supabase.auth.signOut();
      throw new Error('관리자 권한이 없는 계정입니다.');
    }
    return data.user;
  },

  async signOut() {
    if (!isSupabaseReady()) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  fetchUserConsultations: function(userId) { return this.getMessages(userId); },
  fetchAllConsultations: function() { return this.getAllConsultations(); },
  subscribeToUser: function(userId, callback) { return this.subscribe(userId, callback); },
  subscribeToAll: function(callback) { return this.subscribeAll(callback); },
  deleteRoom: function(userId) { return this.deleteConsultationRoom(userId); }
};
