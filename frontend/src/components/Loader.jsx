const Loader = ({ fullPage = false, text = 'Loading...' }) => {
  if (fullPage) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium">{text}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-3" />
      <p className="text-gray-400 text-sm">{text}</p>
    </div>
  );
};

export default Loader;
