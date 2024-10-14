import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ProgressChart = ({ habits }) => {
  const data = {
    labels: habits.map(habit => habit.name),
    datasets: [
      {
        label: 'Habit Streaks',
        data: habits.map(habit => habit.streak),
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  return <Line data={data} />;
};

export default ProgressChart;
