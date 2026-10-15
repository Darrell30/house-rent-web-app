import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

describe('ConfirmDialog component', () => {
  it('does not render when closed', () => {
    render(
      <ConfirmDialog
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Archive Listing"
      />
    );
    expect(screen.queryByText('Archive Listing')).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Archive Property"
        message="Are you sure you want to archive this property?"
      />
    );
    expect(screen.getByText('Archive Property')).toBeInTheDocument();
    expect(
      screen.getByText('Are you sure you want to archive this property?')
    ).toBeInTheDocument();
  });

  it('supports open prop fallback', () => {
    render(
      <ConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Fallback Open Check"
      />
    );
    expect(screen.getByText('Fallback Open Check')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const handleConfirm = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={handleConfirm}
        title="Confirm Me"
        confirmText="Yes, Proceed"
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /yes, proceed/i }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });
});
