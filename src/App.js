import React, { useState, useEffect } from 'react';
import './App.css';
import ProgressChart from './components/ProgressChart';  // Import the ProgressChart component

function App() {
  const [habits, setHabits] = useState([]);
  const [habitName, setHabitName] = useState('');
  const [notificationTime, setNotificationTime] = useState('08:00');
  const [darkMode, setDarkMode] = useState(false);

  // Load habits from localStorage on initial render
  useEffect(() => {
    const storedHabits = JSON.parse(localStorage.getItem('habits')) || [];
    setHabits(storedHabits);

    // Load dark mode preference from localStorage
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedMode);
  }, []);

  // Save habits to localStorage whenever the habits state changes
  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Apply dark mode based on state
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Request permission for notifications on load
  useEffect(() => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        } else if (permission === 'denied') {
          alert('You have denied notifications. Please enable them in your browser settings.');
        }
      });
    } else if (Notification.permission === 'denied') {
      alert('You have denied notifications. Please enable them in your browser settings.');
    }
  }, []);

  // Set up a recurring check to send reminders
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      console.log(`Current time: ${currentTime}, Notification time: ${notificationTime}`);

      if (currentTime === notificationTime) {
        habits.forEach((habit) => {
          sendNotification(habit.name);
        });
      }
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [habits, notificationTime]);

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Handle adding a new habit
  const addHabit = (e) => {
    e.preventDefault();
    if (habitName === '') return;

    const newHabit = {
      id: Date.now(),
      name: habitName,
      completed: false,
      streak: 0,
      lastCompleted: null,
    };

    setHabits([...habits, newHabit]);
    setHabitName('');
  };

  // Mark habit as completed and update streak
  const toggleComplete = (id) => {
    const updatedHabits = habits.map((habit) => {
      const today = new Date().toDateString();
      if (habit.id === id && habit.lastCompleted !== today) {
        return {
          ...habit,
          completed: true,
          streak: habit.completed ? habit.streak : habit.streak + 1,
          lastCompleted: today,
        };
      }
      return habit;
    });
    setHabits(updatedHabits);
  };

  // Function to edit habit name
  const editHabit = (id) => {
    const newName = prompt('Enter new habit name:');
    if (!newName) return;
    const updatedHabits = habits.map(habit =>
      habit.id === id ? { ...habit, name: newName } : habit
    );
    setHabits(updatedHabits);
  };

  // Function to delete habit
  const deleteHabit = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this habit?');
    if (!confirmDelete) return;
    const updatedHabits = habits.filter(habit => habit.id !== id);
    setHabits(updatedHabits);
  };

  // Function to send notifications
  const sendNotification = (habitName) => {
    if (Notification.permission === 'granted') {
      new Notification(`Reminder: Time to complete your habit "${habitName}"!`);
    }
  };

  // Function to get badge based on streak
  const getBadge = (streak) => {
    if (streak >= 7 && streak < 30) return '🏅 Bronze Streak';
    if (streak >= 30 && streak < 60) return '🥈 Silver Streak';
    if (streak >= 60) return '🥇 Gold Streak';
    return null;
  };

  return (
    <div className="App">
      <h1>Habit Tracker</h1>
      <button onClick={toggleDarkMode}>
        {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      </button>
      <form onSubmit={addHabit}>
        <input 
          type="text" 
          value={habitName} 
          onChange={(e) => setHabitName(e.target.value)} 
          placeholder="Enter habit name" 
        />
        <input 
          type="time" 
          value={notificationTime} 
          onChange={(e) => setNotificationTime(e.target.value)} 
        />
        <button type="submit">Add Habit</button>
      </form>
      <h2>Your Habits</h2>
      <ul>
        {habits.map((habit) => (
          <li key={habit.id}>
            <div className="card">
              <div className="card-front">
                <span className={`habit-name ${habit.completed ? 'completed' : ''}`}>
                  {habit.name}
                </span>
                <button onClick={() => toggleComplete(habit.id)}>
                  {habit.completed ? 'Completed' : 'Complete'}
                </button>
                <span className="streak">Streak: {habit.streak}</span>
                {getBadge(habit.streak) && (
                  <span className="badge">{getBadge(habit.streak)}</span>
                )}
                <button onClick={() => editHabit(habit.id)}>Edit</button>
              </div>
              <div className="card-back">
                <p>Details about the habit.</p>
                <button onClick={() => deleteHabit(habit.id)}>Delete</button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Floating Action Button */}
      <button className="fab" onClick={addHabit}>
        +
      </button>
      <ProgressChart habits={habits} />
    </div>
  );
}

export default App;
