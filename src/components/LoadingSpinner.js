const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
      <div className="ml-4">
        <p className="text-xl font-semibold text-gray-700">Planning your trip...</p>
        <p className="text-gray-500">Calculating routes and generating ELD logs</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
