const variantMap = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error:   'bg-red-100 text-red-800',
  info:    'bg-blue-100 text-blue-800',
  purple:  'bg-purple-100 text-purple-800',
  gray:    'bg-gray-100 text-gray-700',
};

const statusColorMap = {
  Pending:    'warning',
  Confirmed:  'info',
  InProgress: 'info',
  Completed:  'success',
  Cancelled:  'error',
  Available:  'success',
  Busy:       'warning',
  Offline:    'gray',
  Paid:       'success',
  Failed:     'error',
  Refunded:   'purple',
};

const Badge = ({ text, variant, status, className = '' }) => {
  const resolvedVariant = variant || statusColorMap[status] || 'gray';
  const colors = variantMap[resolvedVariant] || variantMap.gray;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors} ${className}`}>
      {text || status}
    </span>
  );
};

export default Badge;
