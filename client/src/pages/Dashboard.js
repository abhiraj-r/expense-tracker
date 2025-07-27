import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import { 
  getExpenses, 
  createExpense, 
  deleteExpense, 
  updateExpense,
  getRecurringExpenses,
  createRecurringExpense,
  deleteRecurringExpense,
  toggleRecurringExpense
} from '../services/api';
import './Dashboard.css';
import { FaUser, FaChartBar, FaDownload, FaSearch, FaSyncAlt, FaEllipsisH, FaSun, FaMoon } from 'react-icons/fa';
import CurrencySelector from '../components/CurrencySelector';
import { formatCurrency, convertCurrency } from '../services/currencyService';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const downloadCSV = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/expenses/export/csv`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to export CSV');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert('Failed to export CSV');
  }
};

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'Food',
    date: '',
    currency: 'INR'
  });
  const [editingExpense, setEditingExpense] = useState({
    description: '',
    amount: '',
    category: 'Food',
    date: '',
    currency: 'INR'
  });
  const [editForm, setEditForm] = useState({ 
    description: '', 
    amount: '', 
    category: 'other', 
    currency: 'INR',
    date: '' 
  });
  const [defaultCurrency, setDefaultCurrency] = useState('INR');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Analytics states
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('month');
  
  // Recurring expenses states
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [showRecurringList, setShowRecurringList] = useState(false);
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [newRecurringExpense, setNewRecurringExpense] = useState({
    description: '',
    amount: '',
    category: 'Food',
    frequency: 'monthly',
    startDate: '',
    endDate: '',
    isActive: true,
    currency: 'INR'
  });
  
  const navigate = useNavigate();
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Define getTotalAmount at the top level
  const getTotalAmount = (expenseList) => {
    return expenseList.reduce((total, expense) => {
      const convertedAmount = convertCurrency(expense.amount, expense.currency || 'INR', defaultCurrency);
      return total + convertedAmount;
    }, 0);
  };

  // Define clearFilters at the top level
  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setDateFilter('all');
    setSortBy('date');
    setSortOrder('desc');
  };

  // Theme toggle function
  const toggleTheme = () => {
    const body = document.body;
    if (body.classList.contains('dark-mode')) {
      body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    } else {
      body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    }
  };

  // Move fetchExpenses above useEffect and wrap in useCallback
  const fetchExpenses = useCallback(async () => {
    try {
      console.log('Making getExpenses API call...');
      const response = await getExpenses();
      console.log('Expenses response:', response.data);
      setExpenses(response.data);
      // Clear editing state if the current editing expense no longer exists
      if (editingExpense) {
        const currentExpense = response.data.find(exp => exp._id === editingExpense._id);
        if (!currentExpense) {
          console.log('Editing expense no longer exists, clearing edit state');
          setEditingExpense(null);
        }
      }
    } catch (err) {
      console.error('Fetch expenses error:', err);
      if (err.response?.status === 401) {
        console.log('401 error - removing token and redirecting');
        localStorage.removeItem('token');
        navigate('/');
      } else {
        setError('Failed to fetch expenses');
      }
    } finally {
      setLoading(false);
    }
  }, [editingExpense, navigate]);

  const fetchRecurringExpenses = useCallback(async () => {
    try {
      const response = await getRecurringExpenses();
      setRecurringExpenses(response.data);
    } catch (err) {
      console.error('Fetch recurring expenses error:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      }
    }
  }, [navigate]);

  const applyFilters = useCallback(() => {
    let filtered = [...expenses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(expense => expense.category === categoryFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= startOfDay;
          });
          break;
        case 'week':
          const weekAgo = new Date(startOfDay.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= weekAgo;
          });
          break;
        case 'month':
          const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
          filtered = filtered.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= monthAgo;
          });
          break;
        default:
          break;
      }
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'description':
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredExpenses(filtered);
  }, [expenses, searchTerm, categoryFilter, dateFilter, sortBy, sortOrder]);

  // Update useEffect dependencies
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Dashboard useEffect - Token:', token ? 'Present' : 'Missing');
    if (token) {
      console.log('Fetching expenses...');
      fetchExpenses();
      fetchRecurringExpenses();
    } else {
      console.log('No token found, redirecting to login');
      setLoading(false);
      navigate('/');
    }
  }, [navigate, fetchExpenses, fetchRecurringExpenses]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Clear editing state when expenses change
  useEffect(() => {
    if (editingExpense) {
      const currentExpense = expenses.find(exp => exp._id === editingExpense._id);
      if (!currentExpense) {
        setEditingExpense(null);
      }
    }
  }, [expenses, editingExpense]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMobileMenu && !event.target.closest('.mobile-menu-toggle') && !event.target.closest('.mobile-menu-dropdown')) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileMenu]);

  // Recurring expenses functions
  const handleAddRecurringExpense = async (e) => {
    e.preventDefault();
    try {
      const response = await createRecurringExpense({
        ...newRecurringExpense,
        amount: parseFloat(newRecurringExpense.amount)
      });
      
      setRecurringExpenses([...recurringExpenses, response.data]);
      
      setNewRecurringExpense({
        description: '',
        amount: '',
        category: 'Food',
        frequency: 'monthly',
        startDate: '',
        endDate: '',
        isActive: true
      });
      setShowRecurringForm(false);
    } catch (err) {
      console.error('Add recurring expense error:', err);
      setError('Failed to add recurring expense');
    }
  };

  const handleDeleteRecurringExpense = async (id) => {
    try {
      await deleteRecurringExpense(id);
      setRecurringExpenses(recurringExpenses.filter(exp => exp._id !== id));
      
      // Also remove any generated expenses from this recurring
      setExpenses(prev => prev.filter(exp => exp.recurringId !== id));
    } catch (err) {
      console.error('Delete recurring expense error:', err);
      setError('Failed to delete recurring expense');
    }
  };

  const handleToggleRecurringExpense = async (id) => {
    try {
      const response = await toggleRecurringExpense(id);
      setRecurringExpenses(recurringExpenses.map(exp => 
        exp._id === id ? response.data : exp
      ));
    } catch (err) {
      console.error('Toggle recurring expense error:', err);
      setError('Failed to toggle recurring expense');
    }
  };

  // Analytics functions
  const getAnalyticsData = () => {
    const today = new Date();
    let startDate;
    
    if (analyticsPeriod === 'week') {
      startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (analyticsPeriod === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    } else {
      startDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate()); // 3 months
    }

    const periodExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate;
    });

    // Category breakdown
    const categoryData = {};
    periodExpenses.forEach(expense => {
      if (categoryData[expense.category]) {
        categoryData[expense.category] += expense.amount;
      } else {
        categoryData[expense.category] = expense.amount;
      }
    });

    // Daily spending for the period
    const dailyData = {};
    periodExpenses.forEach(expense => {
      const date = expense.date.split('T')[0];
      if (dailyData[date]) {
        dailyData[date] += expense.amount;
      } else {
        dailyData[date] = expense.amount;
      }
    });

    // Top expenses
    const topExpenses = [...periodExpenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      totalAmount: getTotalAmount(periodExpenses),
      totalCount: periodExpenses.length,
      categoryData,
      dailyData,
      topExpenses,
      averageAmount: periodExpenses.length > 0 ? getTotalAmount(periodExpenses) / periodExpenses.length : 0
    };
  };

  const renderCategoryChart = (categoryData) => {
    const categories = Object.keys(categoryData);
    const amounts = Object.values(categoryData);
    const colors = categories.map(category => getCategoryColor(category));

    const data = {
      labels: categories,
      datasets: [
        {
          data: amounts,
          backgroundColor: colors,
          borderColor: colors.map(color => color + '80'),
          borderWidth: 2,
          hoverOffset: 4,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: document.body.classList.contains('dark-mode') ? '#f8fafc' : '#1e293b',
            font: {
              family: 'Poppins',
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: document.body.classList.contains('dark-mode') ? '#1e293b' : '#ffffff',
          titleColor: document.body.classList.contains('dark-mode') ? '#f8fafc' : '#1e293b',
          bodyColor: document.body.classList.contains('dark-mode') ? '#f8fafc' : '#1e293b',
          borderColor: document.body.classList.contains('dark-mode') ? '#334155' : '#e2e8f0',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `${context.label}: ${formatCurrency(context.parsed, defaultCurrency)} (${percentage}%)`;
            }
          }
        }
      }
    };

    return (
      <div className="chart-container">
        <h3>Spending by Category</h3>
        <div className="chart">
          <Pie data={data} options={options} />
        </div>
      </div>
    );
  };

  const renderDailyChart = (dailyData) => {
    const dates = Object.keys(dailyData).sort();
    const amounts = dates.map(date => dailyData[date]);

    const data = {
      labels: dates.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [
        {
          label: 'Daily Spending',
          data: amounts,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: document.body.classList.contains('dark-mode') ? '#1e293b' : '#ffffff',
          titleColor: document.body.classList.contains('dark-mode') ? '#f8fafc' : '#1e293b',
          bodyColor: document.body.classList.contains('dark-mode') ? '#f8fafc' : '#1e293b',
          borderColor: document.body.classList.contains('dark-mode') ? '#334155' : '#e2e8f0',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              return `Spending: ${formatCurrency(context.parsed.y, defaultCurrency)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: document.body.classList.contains('dark-mode') ? '#334155' : '#e2e8f0',
          },
          ticks: {
            color: document.body.classList.contains('dark-mode') ? '#94a3b8' : '#64748b',
            font: {
              family: 'Poppins',
              size: 12
            }
          }
        },
        y: {
          grid: {
            color: document.body.classList.contains('dark-mode') ? '#334155' : '#e2e8f0',
          },
          ticks: {
            color: document.body.classList.contains('dark-mode') ? '#94a3b8' : '#64748b',
            font: {
              family: 'Poppins',
              size: 12
            },
            callback: function(value) {
              return formatCurrency(value, defaultCurrency);
            }
          }
        }
      }
    };

    return (
      <div className="chart-container">
        <h3>Daily Spending</h3>
        <div className="chart">
          <Line data={data} options={options} />
        </div>
      </div>
    );
  };

  const getCategoryColor = (category) => {
    const colors = {
      food: '#e74c3c',
      transport: '#3498db',
      entertainment: '#9b59b6',
      shopping: '#f39c12',
      bills: '#2ecc71',
      other: '#95a5a6'
    };
    return colors[category] || '#95a5a6';
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const response = await createExpense({
        ...newExpense,
        amount: parseFloat(newExpense.amount),
      });
      setExpenses([...expenses, response.data]);
      setNewExpense({ description: '', amount: '', category: 'Food', date: '' });
      setShowAddForm(false);
    } catch (err) {
      setError('Failed to add expense');
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await deleteExpense(id);
      setExpenses(expenses.filter(exp => exp._id !== id));
    } catch (err) {
      setError('Failed to delete expense');
    }
  };

  const handleEditClick = (expense) => {
    // Verify the expense still exists in the current list
    const currentExpense = expenses.find(exp => exp._id === expense._id);
    if (!currentExpense) {
      setError('Expense not found. Refreshing list...');
      fetchExpenses();
      return;
    }
    setEditingExpense(currentExpense); // Use currentExpense to avoid stale data
    setEditForm({
      description: currentExpense.description,
      amount: currentExpense.amount,
      category: currentExpense.category,
      date: currentExpense.date.split('T')[0],
    });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // Check if the expense still exists in the current list
    const currentExpense = expenses.find(exp => exp._id === editingExpense._id);
    if (!currentExpense) {
      setError('Expense no longer exists. Closing edit form...');
      setEditingExpense(null);
      return;
    }
    // Double-check that we're editing the correct expense
    console.log('Current editing expense ID:', editingExpense._id);
    console.log('Available expense IDs:', expenses.map(exp => exp._id));

    try {
      console.log('Submitting edit for expense:', editingExpense._id);
      console.log('Edit form data:', editForm);
      const response = await updateExpense(editingExpense._id, {
        ...editForm,
        amount: parseFloat(editForm.amount),
      });
      console.log('Update response:', response);
      setExpenses(expenses.map(exp => exp._id === editingExpense._id ? response.data : exp));
      setEditingExpense(null);
    } catch (err) {
      console.error('Edit expense error:', err);
      if (err.response?.status === 404) {
        setError('Expense not found. It may have been deleted. Refreshing...');
        setEditingExpense(null); // Close modal immediately
        setTimeout(() => {
          fetchExpenses();
        }, 1000); // Faster refresh
      } else {
        setError('Failed to update expense');
      }
    }
  };

  const handleEditCancel = () => {
    setEditingExpense(null);
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  const analyticsData = getAnalyticsData();

  return (
    <>
      <div className="dashboard">
                        <header className="dashboard-header">
                  <div className="header-left">
                    <h1>Expense Tracker</h1>
                    <button className="icon-btn search-modal-btn" title="Search & Filter" onClick={() => setShowSearchModal(true)}><FaSearch /></button>
                  </div>
                  <div className="header-actions">
                    <button onClick={() => navigate('/profile')} className="icon-btn" title="Profile"><FaUser /></button>
                  </div>
                  <button 
                    className="mobile-menu-toggle" 
                    onClick={() => {
                      setShowMobileMenu(!showMobileMenu);
                    }}
                    title="Menu"
                  >
                    <FaEllipsisH />
                  </button>
                  <div className={`mobile-menu-dropdown ${showMobileMenu ? 'show' : ''}`}>
                    <button 
                      className="mobile-menu-item" 
                      onClick={() => {
                        setShowAnalytics(!showAnalytics);
                        setShowMobileMenu(false);
                      }}
                    >
                      <FaChartBar /> Analytics
                    </button>
                    <button 
                      className="mobile-menu-item" 
                      onClick={() => {
                        downloadCSV(localStorage.getItem('token'));
                        setShowMobileMenu(false);
                      }}
                    >
                      <FaDownload /> Export CSV
                    </button>
                    <button 
                      className="mobile-menu-item" 
                      onClick={() => {
                        toggleTheme();
                        setShowMobileMenu(false);
                      }}
                    >
                      {document.body.classList.contains('dark-mode') ? <FaSun /> : <FaMoon />}
                      <span>Toggle Theme</span>
                    </button>
                  </div>
                </header>

        {/* Summary Section - Moved below header */}
        <div className="summary-section">
          <div className="summary-item">
            <span className="summary-label">Total Expenses:</span>
            <span className="summary-value">
              {formatCurrency(getTotalAmount(filteredExpenses), defaultCurrency)}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Filtered:</span>
            <span className="summary-value">{filteredExpenses.length} of {expenses.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Display Currency:</span>
            <CurrencySelector 
              selectedCurrency={defaultCurrency}
              onCurrencyChange={setDefaultCurrency}
              className="summary-currency-selector"
            />
          </div>
        </div>

        {/* Recurring Expenses Section */}
        {showRecurringList && (
          <div className="recurring-section">
            <div className="recurring-header">
              <h2>Recurring Expenses</h2>
              <button 
                onClick={() => setShowRecurringForm(true)} 
                className="add-recurring-btn"
              >
                Add Recurring
              </button>
            </div>

            {recurringExpenses.length === 0 ? (
              <div className="no-recurring">
                <p>No recurring expenses set up yet.</p>
                <p>Add your first recurring expense to automate your regular payments!</p>
              </div>
            ) : (
              <div className="recurring-list">
                {recurringExpenses.map((recurring) => (
                  <div key={recurring.id} className={`recurring-card ${!recurring.isActive ? 'inactive' : ''}`}>
                    <div className="recurring-info">
                      <div className="recurring-main">
                        <h3>{recurring.description}</h3>
                        <p className="recurring-amount">{formatCurrency(recurring.amount, recurring.currency || 'INR')}</p>
                      </div>
                      <div className="recurring-details">
                        <span className="recurring-category">{recurring.category}</span>
                        <span className="recurring-frequency">{recurring.frequency}</span>
                        <span className="recurring-status">
                          {recurring.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="recurring-dates">
                        <span>Start: {new Date(recurring.startDate).toLocaleDateString()}</span>
                        {recurring.endDate && (
                          <span>End: {new Date(recurring.endDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="recurring-actions">
                      <button 
                        onClick={() => handleToggleRecurringExpense(recurring._id)}
                        className={`toggle-btn ${recurring.isActive ? 'active' : 'inactive'}`}
                      >
                        {recurring.isActive ? 'Pause' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => handleDeleteRecurringExpense(recurring._id)}
                        className="delete-recurring-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Section */}
        {showAnalytics && (
          <div className="analytics-section">
            <div className="analytics-header">
              <h2>Spending Analytics</h2>
              <select
                value={analyticsPeriod}
                onChange={(e) => setAnalyticsPeriod(e.target.value)}
                className="period-select"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">Last 3 Months</option>
              </select>
            </div>

            <div className="analytics-summary">
              <div className="summary-card">
                <h3>Total Spent</h3>
                <p className="summary-value">{formatCurrency(analyticsData.totalAmount, defaultCurrency)}</p>
              </div>
              <div className="summary-card">
                <h3>Total Expenses</h3>
                <p className="summary-value">{analyticsData.totalCount}</p>
              </div>
              <div className="summary-card">
                <h3>Average per Expense</h3>
                <p className="summary-value">{formatCurrency(analyticsData.averageAmount, defaultCurrency)}</p>
              </div>
            </div>

            <div className="charts-container">
              {Object.keys(analyticsData.categoryData).length > 0 && renderCategoryChart(analyticsData.categoryData)}
              {Object.keys(analyticsData.dailyData).length > 0 && renderDailyChart(analyticsData.dailyData)}
            </div>

            {analyticsData.topExpenses.length > 0 && (
              <div className="top-expenses">
                <h3>Top 5 Expenses</h3>
                <div className="top-expenses-list">
                  {analyticsData.topExpenses.map((expense, index) => (
                    <div key={expense._id} className="top-expense-item">
                      <span className="rank">#{index + 1}</span>
                      <span className="description">{expense.description}</span>
                      <span className="amount">{formatCurrency(expense.amount, expense.currency || 'INR')}</span>
                      <span className="category">{expense.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filters Section */}
        {showSearchModal && (
          <div className="search-modal-overlay">
            <div className="search-modal">
              <button className="close-modal-btn" onClick={() => setShowSearchModal(false)}>&times;</button>
              <div className="search-modal-content">
                <div className="filter-group">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                
                <div className="filter-group">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Categories</option>
                    <option value="food">Food</option>
                    <option value="transport">Transport</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="shopping">Shopping</option>
                    <option value="bills">Bills</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="filter-group">
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>

                <div className="filter-group">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="filter-select"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="amount">Sort by Amount</option>
                    <option value="description">Sort by Description</option>
                  </select>
                </div>

                <div className="filter-group">
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="sort-btn"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>

                <button onClick={clearFilters} className="clear-filters-btn">
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-content">
        <div className="expenses-header">
          <h2>Expenses</h2>
          <button onClick={() => setShowAddForm(true)} className="add-expense-btn">
            Add Expense
          </button>
          <button onClick={() => setShowRecurringList(!showRecurringList)} className="recurring-below-btn" title="Recurring Expenses"><FaSyncAlt style={{marginRight:8}} />{showRecurringList ? 'Hide Recurring' : 'Recurring'}</button>
        </div>

        {showAddForm && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Add New Expense</h3>
              <form onSubmit={handleAddExpense}>
                <input
                  type="text"
                  placeholder="Description"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  required
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  step="0.01"
                  required
                />
                <CurrencySelector
                  selectedCurrency={newExpense.currency}
                  onCurrencyChange={(currency) => setNewExpense({ ...newExpense, currency })}
                />
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                >
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="shopping">Shopping</option>
                  <option value="bills">Bills</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  required
                />
                <div className="modal-buttons">
                  <button type="submit">Add Expense</button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showRecurringForm && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Add Recurring Expense</h3>
              <form onSubmit={handleAddRecurringExpense}>
                <input
                  type="text"
                  placeholder="Description"
                  value={newRecurringExpense.description}
                  onChange={(e) => setNewRecurringExpense({ ...newRecurringExpense, description: e.target.value })}
                  required
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={newRecurringExpense.amount}
                  onChange={(e) => setNewRecurringExpense({ ...newRecurringExpense, amount: e.target.value })}
                  step="0.01"
                  required
                />
                <CurrencySelector
                  selectedCurrency={newRecurringExpense.currency}
                  onCurrencyChange={(currency) => setNewRecurringExpense({ ...newRecurringExpense, currency })}
                />
                <select
                  value={newRecurringExpense.category}
                  onChange={(e) => setNewRecurringExpense({ ...newRecurringExpense, category: e.target.value })}
                >
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="shopping">Shopping</option>
                  <option value="bills">Bills</option>
                  <option value="other">Other</option>
                </select>
                <select
                  value={newRecurringExpense.frequency}
                  onChange={(e) => setNewRecurringExpense({ ...newRecurringExpense, frequency: e.target.value })}
                  required
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <input
                  type="date"
                  placeholder="Start Date"
                  value={newRecurringExpense.startDate}
                  onChange={(e) => setNewRecurringExpense({ ...newRecurringExpense, startDate: e.target.value })}
                  required
                />
                <input
                  type="date"
                  placeholder="End Date (Optional)"
                  value={newRecurringExpense.endDate}
                  onChange={(e) => setNewRecurringExpense({ ...newRecurringExpense, endDate: e.target.value })}
                />
                <div className="modal-buttons">
                  <button type="submit">Add Recurring</button>
                  <button type="button" onClick={() => setShowRecurringForm(false)} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editingExpense && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Edit Expense</h3>
              <form onSubmit={handleEditSubmit}>
                <input
                  type="text"
                  name="description"
                  placeholder="Description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  required
                />
                <input
                  type="number"
                  name="amount"
                  placeholder="Amount"
                  value={editForm.amount}
                  onChange={handleEditChange}
                  step="0.01"
                  required
                />
                <select
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                >
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="shopping">Shopping</option>
                  <option value="bills">Bills</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="date"
                  name="date"
                  value={editForm.date}
                  onChange={handleEditChange}
                  required
                />
                <div className="modal-buttons">
                  <button type="submit">Update Expense</button>
                  <button type="button" onClick={handleEditCancel} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="expenses-list">
          {filteredExpenses.length === 0 ? (
            <div className="no-expenses">
              {expenses.length === 0 ? 'No expenses yet. Add your first expense!' : 'No expenses match your filters.'}
            </div>
          ) : (
            filteredExpenses.map((expense) => (
              <div key={expense._id} className={`expense-card ${expense.isRecurring ? 'recurring' : ''}`}>
                <div className="expense-info">
                  <h3>
                    {expense.description}
                    {expense.isRecurring && <span className="recurring-badge">🔄</span>}
                  </h3>
                  <p className="expense-amount">
                    {formatCurrency(expense.amount, expense.currency || 'INR')}
                    {expense.currency !== defaultCurrency && (
                      <span className="converted-amount">
                        ({formatCurrency(
                          convertCurrency(expense.amount, expense.currency || 'INR', defaultCurrency),
                          defaultCurrency
                        )})
                      </span>
                    )}
                  </p>
                  <p className="expense-category">{expense.category}</p>
                  <p className="expense-date">{new Date(expense.date).toLocaleDateString()}</p>
                </div>
                <div className="expense-actions">
                  <button onClick={() => handleEditClick(expense)} className="edit-button">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteExpense(expense._id)} className="delete-button">
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
    </div>
    </>
  );
};

export default Dashboard;
