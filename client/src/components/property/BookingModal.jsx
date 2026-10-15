import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Users, MessageSquare } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatIDR } from '../../utils/formatters';
import { bookingService } from '../../services/bookingService';
import toast from 'react-hot-toast';

const bookingFormSchema = z.object({
  moveInDate: z.string().min(1, 'Please select your preferred move-in date'),
  moveOutDate: z.string().optional(),
  occupants: z.coerce.number().int().min(1, 'At least 1 occupant is required'),
  message: z.string().max(500, 'Message cannot exceed 500 characters').optional(),
});

export const BookingModal = ({ isOpen, onClose, property, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      moveInDate: '',
      moveOutDate: '',
      occupants: 1,
      message: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await bookingService.createBooking({
        propertyId: property._id,
        moveInDate: data.moveInDate,
        moveOutDate: data.moveOutDate || undefined,
        occupants: data.occupants,
        message: data.message || '',
      });

      if (res.success) {
        toast.success('Rental request submitted to owner!');
        reset();
        onClose();
        if (onSuccess) onSuccess(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit booking request');
    } finally {
      setLoading(false);
    }
  };

  if (!property) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request to Rent Property"
      maxWidth="max-w-md"
    >
      <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{property.title}</h4>
          <p className="text-[11px] text-slate-500">{property.city}</p>
        </div>
        <div className="text-right">
          <span className="text-sm font-extrabold text-teal-600">
            {formatIDR(property.monthlyRent)}
          </span>
          <p className="text-[10px] text-slate-400">/ month</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Preferred Move-in Date *"
          type="date"
          icon={Calendar}
          error={errors.moveInDate?.message}
          {...register('moveInDate')}
        />

        <Input
          label="Estimated Move-out Date (Optional)"
          type="date"
          icon={Calendar}
          error={errors.moveOutDate?.message}
          {...register('moveOutDate')}
        />

        <Input
          label="Number of Occupants *"
          type="number"
          min="1"
          max="20"
          icon={Users}
          error={errors.occupants?.message}
          {...register('occupants')}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Message to Owner
          </label>
          <div className="relative rounded-lg shadow-sm">
            <textarea
              rows="3"
              placeholder="Introduce yourself, your lease expectations, or ask questions..."
              className="block w-full rounded-lg border border-slate-300 text-xs p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
              {...register('message')}
            />
          </div>
          {errors.message && (
            <p className="mt-1 text-xs text-rose-600">{errors.message.message}</p>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={loading}>
            Submit Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};
