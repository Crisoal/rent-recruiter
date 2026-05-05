interface BadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Approved', className: 'bg-green-50 text-green-700 border-green-200' },
  rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200' },
  closed: { label: 'Closed', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  submitted: { label: 'Submitted', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  reviewed: { label: 'Reviewed', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  selected: { label: 'Selected', className: 'bg-green-50 text-green-700 border-green-200' },
  not_selected: { label: 'Not Selected', className: 'bg-red-50 text-red-700 border-red-200' },
  accepted: { label: 'Accepted', className: 'bg-green-50 text-green-700 border-green-200' },
  declined: { label: 'Declined', className: 'bg-red-50 text-red-700 border-red-200' },
  available: { label: 'Available', className: 'bg-green-50 text-green-700 border-green-200' },
  busy: { label: 'Busy', className: 'bg-red-50 text-red-700 border-red-200' },
  open_to_offers: { label: 'Open to Offers', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  hire: { label: 'Hire', className: 'bg-[#0D1B4B]/10 text-[#0D1B4B] border-[#0D1B4B]/20' },
  rent: { label: 'Rent', className: 'bg-[#00897B]/10 text-[#00897B] border-[#00897B]/20' },
};

export function Badge({ status, className = '' }: BadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-gray-100 text-gray-600 border-gray-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className} ${className}`}>
      {config.label}
    </span>
  );
}
