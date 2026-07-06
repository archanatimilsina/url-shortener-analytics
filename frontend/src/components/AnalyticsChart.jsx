import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import useApi from "../hooks/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

function AnalyticsChart({ alias }) {
  const [stats, setStats] = useState([]);
  const { get, loading, error } = useApi();

  const fetchStats = useCallback(async () => {
    const { success, data } = await get(`/api/urls/${alias}/stats/`);
    if (success) {
      setStats(data);
    }
  }, [get, alias]);

  useEffect(() => {
    fetchStats();

    const intervalId = setInterval(() => {
      fetchStats();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [fetchStats]);

  const chartData = {
    labels: stats.map((s) => s.date),
    datasets: [
      {
        label: `Clicks — ${alias}`,
        data: stats.map((s) => s.clicks),
        borderColor: "rgb(90, 86, 74)",
        backgroundColor: "rgba(90, 86, 74, 0.08)",
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: "rgb(90, 86, 74)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgb(58, 54, 46)",
        titleColor: "rgb(246, 245, 240)",
        bodyColor: "rgb(246, 245, 240)",
        padding: 10,
        cornerRadius: 4,
        displayColors: false,
        callbacks: {
          label: (context) =>
            `${context.parsed.y} click${context.parsed.y === 1 ? "" : "s"}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "rgb(150, 145, 130)", font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: "rgb(150, 145, 130)", font: { size: 11 } },
        grid: { color: "rgb(230, 227, 218)" },
      },
    },
  };

  return (
    <Container>
      <Header>
        <Title>Clicks over the last 7 days</Title>
        <RefreshButton onClick={fetchStats} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </RefreshButton>
      </Header>

      {error && <ErrorText>{error}</ErrorText>}

      {loading && stats.length === 0 ? (
        <LoadingText>Loading chart...</LoadingText>
      ) : (
        <ChartWrapper>
          <Line data={chartData} options={chartOptions} />
        </ChartWrapper>
      )}
    </Container>
  );
}

const Container = styled.div`
  padding: 1.5rem;
  border: 1.5px solid rgb(220, 215, 200);
  border-radius: 6px;
  background: rgb(250, 249, 245);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
`;

const Title = styled.h3`
  font-family: Georgia, "Iowan Old Style", ui-serif, serif;
  font-size: 1.05rem;
  font-weight: 500;
  color: rgb(58, 54, 46);
  margin: 0;
`;

const RefreshButton = styled.button`
  padding: 0.4rem 0.9rem;
  border: 1.5px solid rgb(122, 117, 103);
  border-radius: 4px;
  background: transparent;
  color: rgb(90, 86, 74);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    border-color: rgb(210, 205, 190);
    color: rgb(180, 175, 160);
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: rgb(238, 236, 228);
  }
`;

const ChartWrapper = styled.div`
  height: 280px;
`;

const LoadingText = styled.p`
  color: rgb(150, 145, 130);
  font-style: italic;
`;

const ErrorText = styled.p`
  color: rgb(178, 74, 58);
  font-size: 0.9rem;
`;

export default AnalyticsChart;
