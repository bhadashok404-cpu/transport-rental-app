import Button from './Button';

const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    {Icon && (
      <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 text-primary-400" />
      </div>
    )}
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
    {description && <p className="text-gray-500 mb-6 max-w-sm">{description}</p>}
    {actionLabel && onAction && (
      <Button onClick={onAction}>{actionLabel}</Button>
    )}
  </div>
);

export default EmptyState;
