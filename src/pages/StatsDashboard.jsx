import React, { useEffect, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";
import "./StatsDashboard.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ff7300"];

function StatsDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/dashboard/stats/")
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error(err));
  }, []);

  if (!data) return <div className="loading">Loading...</div>;

  // Define the cards in an array to keep the JSX clean
  const statCards = [
    { label: "Users", value: data.total_users },
    { label: "Mentors", value: data.total_mentors },
    { label: "Mentees", value: data.total_mentees },
    { label: "Research Posts", value: data.total_research_posts },
    { label: "Departments", value: data.total_departments },
    { label: "Skills", value: data.total_skills },
  ];

  return (
    <div className="dashboard-container">
      {/* Top Cards Row - Now wrapped in a specific class for 6 columns */}
      <div className="stats-row">
        {statCards.map((card, index) => (
          <div key={index} className="stat-box">
            <h3>{card.label}</h3>
            <div className="stat-number">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        <div className="chart-card">
          <h2>Top Skills</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data.popular_skills} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
              <XAxis type="number" hide /> 
              <YAxis dataKey="skillName" type="category" width={110} axisLine={false} tickLine={false} style={{ fontSize: '12px', fontWeight: '500' }} />
              <Tooltip cursor={{fill: '#f5f5f5'}} />
              <Bar name="Students" dataKey="num_users" fill="#81c7f5" barSize={20} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Posts by Department</h2>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={data.posts_by_department}
                dataKey="count"
                nameKey="dept_name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                labelLine={true}
                label={({ dept_name, percent }) => `${dept_name} (${(percent * 100).toFixed(0)}%)`}
              >
                {data.posts_by_department.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" align="center" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default StatsDashboard;