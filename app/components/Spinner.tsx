function Spinner() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg className="animate-spin h-16 w-16" viewBox="0 0 100 100">
        <circle
          className="circle-spinner stroke-blue-500"
          cx="50"
          cy="50"
          r="40"
          strokeDasharray="200"
          strokeLinecap="round"
          strokeWidth="10"
        ></circle>
      </svg>
    </div>
  );
}

export default Spinner;
