import { supabase } from './supabaseClient';

// Helper: supabase 사용 가능 여부 확인
const isSupabaseReady = () => {
  if (!supabase) {
    console.warn('SHIELD Agent: Supabase client is not available. Consultation features disabled.');
    return false;
  }
  return true;
};

export const consultationService = {
  // Fetch messages for a specific user
  async getMessages(userId) {
    if (!isSupabaseReady()) return [];
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('SHIELD Agent: getMessages failed:', e);
      return [];
    }
  },

  // Fetch all messages (Admin Mode)
  async getAllConsultations() {
    if (!isSupabaseReady()) return {};
    try {
      // Fetch all messages ordered by time ASC so groups have them in chronological order
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('SHIELD Agent: getAllConsultations fetch error:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('SHIELD Agent: No consultation data found.');
        return {};
      }

      const grouped = data.reduce((acc, msg) => {
        const uid = msg.user_id;
        if (!acc[uid]) acc[uid] = [];
        acc[uid].push(msg);
        return acc;
      }, {});
      
      return grouped;
    } catch (e) {
      console.error('SHIELD Agent: getAllConsultations failed:', e);
      return {};
    }
  },

  // Send a new message (with input validation)
  async sendMessage(userId, text, type = 'question') {
    if (!isSupabaseReady()) throw new Error('상담 서비스를 사용할 수 없습니다.');

    // ── 방어 코드: 빈 값 차단 ──
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('유효하지 않은 사용자 ID입니다.');
    }
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('메시지 내용이 비어있습니다.');
    }
    // 메시지 길이 제한 (2000자)
    var MAX_MSG_LENGTH = 2000;
    var sanitizedText = text.trim().slice(0, MAX_MSG_LENGTH);

    var result = await supabase
      .from('consultations')
      .insert([
        { user_id: userId.trim(), text: sanitizedText, type: type }
      ])
      .select();

    if (result.error) throw result.error;
    return result.data[0];
  },

  // Delete a message (with id validation)
  async deleteMessage(id) {
    if (!isSupabaseReady()) throw new Error('상담 서비스를 사용할 수 없습니다.');
    if (!id) {
      throw new Error('삭제할 메시지 ID가 없습니다.');
    }

    var result = await supabase
      .from('consultations')
      .delete()
      .eq('id', id);

    if (result.error) throw result.error;
    return true;
  },

  // Delete all messages for a user (Clear Room) (with userId validation)
  async deleteConsultationRoom(userId) {
    if (!isSupabaseReady()) throw new Error('상담 서비스를 사용할 수 없습니다.');
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('유효하지 않은 사용자 ID입니다.');
    }

    var result = await supabase
      .from('consultations')
      .delete()
      .eq('user_id', userId.trim());

    if (result.error) throw result.error;
    return true;
  },

  // Subscribe to changes (Real-time)
  subscribe(userId, callback) {
    if (!isSupabaseReady()) {
      // Return a no-op cleanup function
      return function() {};
    }
    try {
      var channel = supabase
        .channel('room:' + userId)
        .on('postgres_changes', { 
          event: '*',  // Listen to ALL events (INSERT, DELETE, UPDATE)
          schema: 'public', 
          table: 'consultations',
          filter: 'user_id=eq.' + userId
        }, function(payload) {
          try { callback(payload); } catch (e) {
            console.error('SHIELD Agent: Realtime callback error:', e);
          }
        })
        .subscribe();
        
      // Return a cleanup function
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

  // Admin Subscribe (All changes)
  subscribeAll(callback) {
    if (!isSupabaseReady()) {
      return function() {};
    }
    try {
      var channel = supabase
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

      // Return a cleanup function
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

  // --- Auth Methods ---
  async signInAnonymously() {
    if (!isSupabaseReady()) return null;
    try {
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
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Aliases for compatibility with App.jsx
  fetchUserConsultations: function(userId) { return this.getMessages(userId); },
  fetchAllConsultations: function() { return this.getAllConsultations(); },
  subscribeToUser: function(userId, callback) { return this.subscribe(userId, callback); },
  subscribeToAll: function(callback) { return this.subscribeAll(callback); },
  deleteRoom: function(userId) { return this.deleteConsultationRoom(userId); }
};
