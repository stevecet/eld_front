const DailyLogSheet = ({ dayLog }) => {
  const statusColors = {
    off_duty: "bg-gray-200 text-gray-800",
    sleeper_berth: "bg-purple-200 text-purple-800",
    driving: "bg-blue-200 text-blue-800",
    on_duty_not_driving: "bg-orange-200 text-orange-800",
  };

  const statusLabels = {
    off_duty: "Off Duty",
    sleeper_berth: "Sleeper Berth",
    driving: "Driving",
    on_duty_not_driving: "On Duty (Not Driving)",
  };

    const generateTimeGrid = () => {
      const hours = Array.from({ length: 24 }, (_, i) => i);
      const entries = (dayLog.segments || []).map((s) => ({
        
        start_time: s.start_time,
        end_time: s.end_time,
        duty_status: s.status,
        remarks: s.note || "",
      }));
      

      return hours.map((hour) => {
        const hourString = hour.toString().padStart(2, "0") + ":00";

        const entry = entries.find((e) => {
          const startHour = parseInt(e.start_time.split(":")[0], 10);
          const endHour = parseInt(e.end_time.split(":")[0], 10);
          return hour >= startHour && hour < endHour;
        });

        return {
          hour: hourString,
          status: entry?.duty_status || "off_duty",
          location: entry?.location || "",
          remarks: entry?.remarks || "",
        };
      });
    };

  const timeGrid = generateTimeGrid();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            Daily Log Sheet - {new Date(dayLog.date_start).toLocaleDateString()}
          </h3>
          <div className="text-sm text-gray-500">DOT Compliant ELD Record</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(dayLog.totals).map(([status, hours]) => (
            <div
              key={status}
              className={`p-3 rounded-lg ${statusColors[status]}`}
            >
              <div className="text-xs font-medium">{statusLabels[status]}</div>
              <div className="text-lg font-bold">{hours.toFixed(1)}h</div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Grid Visualization */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-3">24-Hour Grid</h4>
        <div className="grid grid-cols-12 gap-1">
          {timeGrid.map((slot, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-500 mb-1">
                {index % 2 === 0 ? slot.hour : ""}
              </div>
              <div
                className={`h-8 rounded ${
                  statusColors[slot.status]
                } border border-gray-300 flex items-center justify-center`}
                title={`${slot.hour}: ${statusLabels[slot.status]} - ${
                  slot.location
                }`}
              >
                <div className="text-xs font-medium">
                  {statusLabels[slot.status].split(" ")[0].charAt(0)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          {Object.entries(statusLabels).map(([key, label]) => (
            <div key={key} className="flex items-center">
              <div
                className={`w-4 h-4 rounded ${statusColors[key]} mr-2`}
              ></div>
              <span className="text-sm text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Log Entries */}
      <div>
        <h4 className="text-lg font-semibold mb-3">Detailed Log Entries</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left">Time Period</th>
                <th className="px-3 py-2 text-left">Duty Status</th>
                <th className="px-3 py-2 text-left">Duration</th>
                <th className="px-3 py-2 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {(dayLog.segments || []).map((entry, index) => (
                <tr key={index} className="border-t border-gray-200">
                  <td className="px-3 py-2 font-mono">
                    {entry.start_time} - {entry.end_time}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        statusColors[entry.status]
                      }`}
                    >
                      {statusLabels[entry.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono">
                    {entry.duration_hours.toFixed(2)}h
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {entry.note || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DailyLogSheet;
