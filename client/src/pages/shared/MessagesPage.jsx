import React, { useCallback, useEffect, useState } from 'react';
import { MessageCircle, RefreshCcw, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { messageService } from '../../services/messageService';
import { useAuth } from '../../hooks/useAuth';
import { ConversationView } from '../../components/messages/ConversationView';

export const MessagesPage = () => {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [search, setSearch] = useState('');
  const selectedKey = params.get('property') && params.get('user')
    ? `${params.get('property')}:${params.get('user')}` : null;
  const selected = conversations.find(c => `${c.property?._id}:${c.otherUser?._id}` === selectedKey);

  const loadList = useCallback(async (silent = false) => {
    try {
      const res = await messageService.getConversationsList();
      setConversations(res.data || []);
    } catch (err) {
      if (!silent) toast.error(err.message || 'Could not load inbox');
    } finally { setLoadingList(false); }
  }, []);

  const loadChat = useCallback(async (propertyId, otherUserId, silent = false) => {
    if (!propertyId || !otherUserId) return;
    try {
      if (!silent) setLoadingChat(true);
      const res = await messageService.getConversation(propertyId, otherUserId);
      setMessages(res.data || []);
    } catch (err) {
      if (!silent) toast.error(err.message || 'Could not load messages');
    } finally { setLoadingChat(false); }
  }, []);

  useEffect(() => { loadList(); }, [loadList]);
  useEffect(() => {
    setMessages([]);
    if (!selectedKey) return;
    const [propertyId, otherUserId] = selectedKey.split(':');
    loadChat(propertyId, otherUserId);
  }, [selectedKey, loadChat]);
  useEffect(() => {
    const id = setInterval(() => {
      loadList(true);
      if (selectedKey) {
        const [propertyId, otherUserId] = selectedKey.split(':');
        loadChat(propertyId, otherUserId, true);
      }
    }, 10000);
    return () => clearInterval(id);
  }, [loadList, loadChat, selectedKey]);

  const openConversation = (conv) => {
    setParams({ property: conv.property._id, user: conv.otherUser._id });
  };
  const handleSend = async (content) => {
    if (!selected) return;
    await messageService.sendMessage({
      propertyId: selected.property._id,
      recipientId: selected.otherUser._id,
      content,
    });
    await Promise.all([
      loadChat(selected.property._id, selected.otherUser._id, true),
      loadList(true),
    ]);
  };
  const visible = conversations.filter(c =>
    `${c.otherUser?.name || ''} ${c.property?.title || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-slate-900">Messages</h1>
          <p className="text-sm text-slate-500">Conversations about your rental properties</p></div>
        <button onClick={() => loadList()} className="inline-flex gap-2 items-center px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm hover:bg-slate-50"><RefreshCcw size={16}/> Refresh</button>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-[290px_minmax(0,1fr)] min-h-[540px]">
        <aside className="border-b md:border-b-0 md:border-r border-slate-200">
          <div className="p-3 border-b border-slate-100 relative">
            <Search size={17} className="absolute top-6 left-6 text-slate-400"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search conversations" aria-label="Search conversations" className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
          </div>
          <div className="max-h-[300px] md:max-h-[540px] overflow-auto">
            {loadingList ? <p className="p-5 text-sm text-slate-500">Loading conversations…</p> :
            visible.length === 0 ? <p className="p-5 text-sm text-slate-500">No conversations yet. Tenants can start one using Contact Owner on a property page.</p> :
            visible.map(c => {
              const key = `${c.property?._id}:${c.otherUser?._id}`;
              return <button key={key} onClick={()=>openConversation(c)} className={`w-full text-left p-4 border-b border-slate-100 hover:bg-teal-50 ${key === selectedKey ? 'bg-teal-50 border-l-4 border-l-teal-600' : ''}`}>
                <div className="flex items-center justify-between gap-2"><strong className="text-sm text-slate-900 truncate">{c.otherUser?.name || 'User'}</strong>{c.unreadCount > 0 && <span className="bg-teal-600 text-white text-xs rounded-full px-2 py-0.5">{c.unreadCount}</span>}</div>
                <p className="text-xs text-teal-700 truncate mt-1">{c.property?.title || 'Property'}</p>
                <p className="text-xs text-slate-500 truncate mt-1">{c.lastMessage?.content || ''}</p>
              </button>;
            })}
          </div>
        </aside>
        {selected ? <ConversationView key={selectedKey} conversation={selected} messages={messages} loading={loadingChat} onSend={handleSend} currentUserId={user?._id}/>
          : <div className="flex flex-col justify-center items-center text-slate-500 p-8 text-center gap-3"><MessageCircle className="text-teal-500" size={42}/><p className="font-medium">Choose a conversation</p><p className="text-sm">Select a tenant or owner on the left to view and reply.</p></div>}
      </div>
    </div>
  );
};
