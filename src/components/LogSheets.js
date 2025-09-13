import DailyLogSheet from './DailyLogSheet';

const LogSheets = ({ dailyLogs }) => {
  console.log(dailyLogs)
  if (!dailyLogs || dailyLogs.length === 0) return null;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">ELD Daily Log Sheets</h2>
        <p className="text-gray-600">DOT compliant daily logs for your trip</p>
      </div>
      
      {dailyLogs.map((dayLog, index) => (
        <DailyLogSheet key={index} dayLog={dayLog} />
      ))}
    </div>
  );
};

export default LogSheets;
