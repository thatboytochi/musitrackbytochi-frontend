import { useEffect, useState, useRef } from "react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import html2canvas from "html2canvas";
import { api } from "../lib/api.js";

export default function InsightsPanel({ hasHistory, refreshKey }) {
  const [allData, setAllData] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const chartRef = useRef(null);

  // Hook to track if the user is on a mobile-sized screen
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile(); // Check immediately on mount
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!hasHistory) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.timeline()
      .then((res) => {
        const formattedData = res.map(item => {
          const date = new Date(item.month + "-01");
          return {
            ...item,
            year: item.month.substring(0, 4),
            name: date.toLocaleDateString('en-US', { month: 'short' }),
            fullDate: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          };
        });
        setAllData(formattedData);

        // Extract unique years from the data and sort newest to oldest
        const years = [...new Set(formattedData.map(d => d.year))].sort((a, b) => b - a);
        setAvailableYears(years);
        if (years.length > 0) {
          setSelectedYear(years[0]); // Default to the most recent year
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [hasHistory, refreshKey]);

  const handleDownload = async () => {
    if (!chartRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: "#0F0F0F", // Matches bg-night
        scale: 2,
      });
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = image;
      link.download = `MusiTrack-Wrapped-${selectedYear === "All" ? "Lifetime" : selectedYear}.png`;
      link.click();
    } catch (err) {
      console.error("Failed to generate infographic", err);
      alert("Failed to download image. Please try again.");
    }
    setDownloading(false);
  };

  if (!hasHistory) {
    return (
      <div className="rounded-3xl border border-line bg-surface p-8 text-center">
        <p className="text-snow/70">Upload your Spotify Extended Streaming History to unlock Insights.</p>
      </div>
    );
  }

  if (loading) return <p className="p-8 text-center text-snow/70">Loading your stats...</p>;
  if (error) return <p className="p-8 text-center text-red-400">{error}</p>;

  // Filter data based on dropdown selection
  const displayData = selectedYear === "All"
    ? allData
    : allData.filter(d => d.year === selectedYear);

  // Hide labels if showing more than 12 bars (e.g., All Time view)
  const showLabels = displayData.length <= 12;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-line bg-night p-3 shadow-lg">
          <p className="font-semibold text-snow">{payload[0].payload.fullDate}</p>
          <p className="text-sm text-snow/80">{Math.round(payload[0].value).toLocaleString()} minutes</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div
        ref={chartRef}
        // Swapped hardcoded padding for Tailwind responsive padding
        className="rounded-3xl border border-line bg-surface p-4 sm:p-8"
      >
        <div className="mb-6 sm:mb-8 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <h2 className="text-lg sm:text-2xl font-bold text-snow">Minutes by month</h2>
            {availableYears.length > 0 && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="cursor-pointer rounded-xl border border-line bg-night px-3 py-1.5 text-xs sm:text-sm font-medium text-snow outline-none transition hover:border-snow/50"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
                <option value="All">All Time</option>
              </select>
            )}
          </div>
          <img src="/logo-full.png" alt="MusiTrack by Tochi" className="h-6 sm:h-8 opacity-90" />
        </div>

        <div className="h-60 sm:h-72 w-full mt-6 sm:mt-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayData} margin={{ top: 30, right: 0, left: 0, bottom: 0 }} barCategoryGap="20%">
              <XAxis
                dataKey="name"
                stroke="#a3a3a3"
                fontSize={isMobile ? 10 : 13}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
              <Bar dataKey="minutes" fill="#1ed760" radius={[8, 8, 8, 8]}>
                {showLabels && (
                  <LabelList
                    dataKey="minutes"
                    position="top"
                    fill="#ffffff"
                    fontSize={isMobile ? 9 : 13}
                    fontWeight={600}
                    formatter={(value) => {
                      // Dynamically formats to "39.9K" on mobile, but keeps "39,866" on laptop
                      if (isMobile) {
                        return Intl.NumberFormat('en-US', {
                          notation: "compact",
                          maximumFractionDigits: 1
                        }).format(value);
                      }
                      return Math.round(value).toLocaleString();
                    }}
                    offset={isMobile ? 6 : 10}
                  />
                )}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full rounded-xl bg-[#1ed760] py-3 font-bold text-[#121212] transition hover:brightness-110 disabled:opacity-60"
      >
        {downloading ? "Generating..." : "Download as Infographic"}
      </button>
    </div>
  );
}