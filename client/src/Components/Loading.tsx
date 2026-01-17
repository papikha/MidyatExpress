function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-gray-600 text-sm font-medium">Yükleniyor...</p>
      </div>
    </div>
  );
}

export default Loading