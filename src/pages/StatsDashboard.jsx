import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import "./StatsDashboard.css";

const COLORS = ["#82ca9d", "#8884d8", "#ffc658", "#ff8042", "#0088FE"];

function StatsDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/dashboard/stats/")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error(err));
  }, []);

  if (!data) return <div className="loading">Loading...</div>;

  // Helper to truncate long skill names so they don't break the layout
  const formatLabel = (value) => (value.length > 12 ? `${value.substring(0, 10)}...` : value);

  return (
    <div className="dashboard-container">
      {/* Top Cards Row */}
      <div className="stats-grid">
        <div className="stat-box"><h3>Users</h3><div className="stat-number">{data.total_users}</div></div>
        <div className="stat-box"><h3>Mentors</h3><div className="stat-number">{data.total_mentors}</div></div>
        <div className="stat-box"><h3>Mentees</h3><div className="stat-number">{data.total_mentees}</div></div>
        <div className="stat-box"><h3>Research Posts</h3><div className="stat-number">{data.total_research_posts}</div></div>
        <div className="stat-box"><h3>Departments</h3><div className="stat-number">{data.total_departments}</div></div>
        <div className="stat-box"><h3>Skills</h3><div className="stat-number">{data.total_skills}</div></div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Top Skills Chart */}
        <div className="chart-card">
          <h2>Top Skills</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart 
              data={data.popular_skills} 
              margin={{ top: 10, right: 10, left: 0, bottom: 70 }} // Added bottom margin for rotated labels
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="skillName" 
                axisLine={false} 
                tickLine={false} 
                interval={0}           // Ensures all labels show
                angle={-45}            // Rotates labels
                textAnchor="end"       // Aligns rotated text correctly
                tickFormatter={formatLabel} // Optional: truncates very long names
                height={80}            // Gives the axis area more height
              />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "transparent" }} />
              <Legend verticalAlign="top" align="right" iconType="rect" wrapperStyle={{ paddingBottom: "20px" }} />
              <Bar name="Students per Skill" dataKey="num_users" fill="#81c7f5" barSize={60} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Posts by Department Chart */}
        <div className="chart-card">
          <h2>Posts by Department</h2>
          {data.posts_by_department.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={data.posts_by_department}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="dept_name"
                  type="category"
                  width={100}
                  axisLine={false}
                  tickLine={false}
                  style={{ fontSize: '0.85rem' }}
                />
                <Tooltip cursor={{ fill: "transparent" }} />
                <Bar dataKey="count" fill="#8884d8" barSize={25} radius={[0, 5, 5, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">• No data available</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatsDashboard;