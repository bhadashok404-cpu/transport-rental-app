import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = false,
  padding = 'default',
  ...props 
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hover ? 'card-hover' : '';

  return (
    <div
      className={`bg-white rounded-xl shadow-md ${paddingStyles[padding]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
