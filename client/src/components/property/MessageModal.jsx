import React, { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../ui/Button';
import { messageService } from '../../services/messageService';
import toast from 'react-hot-toast';

export const MessageModal = ({ isOpen, onClose, property }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setLoading(true);
      await messageService.sendMessage({
        propertyId: property._id,
        recipientId: property.owner._id || property.owner,
        content: content.trim(),
      });
      toast.success('Message sent to property owner!');
      setContent('');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  if (!property) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Contact Owner regarding ${property.title}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Your Inquiry Message
          </label>
          <textarea
            rows="4"
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ask about availability, unit viewing, deposit terms..."
            className="w-full rounded-lg border border-slate-300 text-xs p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center justify-end space-x-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={loading} icon={Send}>
            Send Inquiry
          </Button>
        </div>
      </form>
    </Modal>
  );
};
