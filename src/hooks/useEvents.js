import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useEvents(userId) {
  const [events, setEvents] = useState([]);

  const fetch = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase.from('events').select('*').eq('user_id', userId).order('start_date');
    setEvents(data || []);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function addEvent(ev) {
    const { error } = await supabase.from('events').insert({ ...ev, user_id: userId });
    if (error) throw error;
    await fetch();
  }
  async function updateEvent(id, updates) {
    const { error } = await supabase.from('events').update(updates).eq('id', id).eq('user_id', userId);
    if (error) throw error;
    await fetch();
  }

  async function deleteEvent(id) {
    const { error } = await supabase.from('events').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    await fetch();
  }

  return { events, addEvent, updateEvent, deleteEvent };
}
