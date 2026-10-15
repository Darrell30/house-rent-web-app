import React, { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

export const ConversationView = ({ conversation, messages, loading, onSend, currentUserId }) => {
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);
  const submit = async (event) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    try {
      setSending(true);
      await onSend(content);
      setDraft('');
    } catch (err) { toast.error(err.message || 'Unable to send reply'); }
    finally { setSending(false); }
  };
  return <section className="flex flex-col min-w-0 h-[540px]" aria-label="Message conversation">
    <header className="p-4 border-b border-slate-200">
      <h2 className="font-bold text-slate-900">{conversation.otherUser?.name || 'Conversation'}</h2>
      <p className="text-xs text-slate-500">Regarding: {conversation.property?.title}</p>
    </header>
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50" aria-live="polite">
      {loading ? <p className="text-sm text-slate-500">Loading messages…</p> :
      messages.length === 0 ? <p className="text-sm text-slate-500">No messages found.</p> : messages.map(msg => {
        const mine = String(msg.sender?._id || msg.sender) === String(currentUserId);
        return <div key={msg._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[85%] rounded-xl px-4 py-2 shadow-sm ${mine ? 'bg-teal-700 text-white' : 'bg-white border border-slate-200 text-slate-900'}`}>
            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
            <time className={`text-[10px] block mt-1 ${mine ? 'text-teal-100' : 'text-slate-400'}`} dateTime={msg.createdAt}>
              {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}
            </time>
          </div>
        </div>;
      })}
      <div ref={bottomRef}/>
    </div>
    <form onSubmit={submit} className="p-3 border-t border-slate-200 flex gap-2 items-end">
      <textarea aria-label="Reply message" value={draft} onChange={e=>setDraft(e.target.value)} rows={2} maxLength={2000} placeholder="Write a reply…" className="flex-1 resize-none border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); submit(e); } }}/>
      <button type="submit" disabled={!draft.trim() || sending} className="inline-flex items-center gap-2 bg-teal-700 text-white px-4 py-3 rounded-lg hover:bg-teal-800 disabled:opacity-50"><Send size={16}/><span className="hidden sm:inline">{sending ? 'Sending…' : 'Send'}</span></button>
    </form>
  </section>;
};
