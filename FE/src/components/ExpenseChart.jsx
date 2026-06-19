import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { coinsService } from '../services/coinsService';
import './ExpenseChart.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpenseChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    fetchExpenseData();
  }, []);

  const fetchExpenseData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get transaction history
      const transactions = await coinsService.getTransactionHistory();
      
      // Filter only buy transactions (expenses)
      const buyTransactions = transactions.filter(t => t.type === 'buy');
      
      if (buyTransactions.length === 0) {
        setChartData(null);
        setTotalExpenses(0);
        setLoading(false);
        return;
      }

      // Calculate total expenses by coin
      const expensesByCoin = {};
      let total = 0;

      buyTransactions.forEach(transaction => {
        const coinId = transaction.coinId;
        if (!expensesByCoin[coinId]) {
          expensesByCoin[coinId] = 0;
        }
        expensesByCoin[coinId] += transaction.totalValue;
        total += transaction.totalValue;
      });

      // Get coin names for better display
      const allCoins = await coinsService.getAllCoins();
      const coinIdToName = {};
      allCoins.forEach(coin => {
        coinIdToName[coin.c_id] = coin.c_name;
      });

      // Prepare chart data
      const labels = [];
      const data = [];
      const backgroundColors = [];
      const borderColors = [];

      // Generate colors for each coin
      const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384',
        '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
      ];

      Object.entries(expensesByCoin).forEach(([coinId, amount], index) => {
        const coinName = coinIdToName[coinId] || coinId;
        labels.push(`${coinName} ($${amount.toFixed(2)})`);
        data.push(amount);
        backgroundColors.push(colors[index % colors.length]);
        borderColors.push(colors[index % colors.length]);
      });

      const chartDataConfig = {
        labels: labels,
        datasets: [
          {
            label: 'Expenses by Coin',
            data: data,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1,
          },
        ],
      };

      setChartData(chartDataConfig);
      setTotalExpenses(total);
    } catch (err) {
      console.error('Failed to fetch expense data:', err);
      setError('Failed to load expense data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed;
            const percentage = ((value / totalExpenses) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="expense-chart-container">
        <div className="loading">Loading expense data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="expense-chart-container">
        <div className="error">
          <h3>Error Loading Chart</h3>
          <p>{error}</p>
          <button onClick={fetchExpenseData} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="expense-chart-container">
        <div className="no-data">
          <h3>No Expense Data</h3>
          <p>You haven't made any purchases yet. Start trading to see your expense breakdown!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="expense-chart-container">
      <div className="chart-header">
        <h3>Total Expenses by Coin</h3>
        <div className="total-expenses">
          <span className="label">Total Spent:</span>
          <span className="value">{formatCurrency(totalExpenses)}</span>
        </div>
      </div>
      
      <div className="chart-wrapper">
        <Pie data={chartData} options={options} />
      </div>
      
      <div className="chart-summary">
        <p>This chart shows how much you've spent on each cryptocurrency.</p>
      </div>
    </div>
  );
};

export default ExpenseChart;
