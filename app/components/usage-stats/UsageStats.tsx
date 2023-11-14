// UsageStats.tsx

import React, { useState, useEffect } from 'react';
import { getAvailableDateKeys, getSignInCountForPeriod, getDetailsByUser } from './app/utils/cloud/redisRestClient';
import styles from './UsageStats.module.scss'; // Assume you have a separate SCSS module for UsageStats

const UsageStats: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [dateKeys, setDateKeys] = useState<string[]>([]);
  const [selectedDateKey, setSelectedDateKey] = useState<string>('');
  const [signInCount, setSignInCount] = useState<number>(0);
  const [userDetails, setUserDetails] = useState<Record<string, number>>({});
  const [showDrillDown, setShowDrillDown] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      const availableDateKeys = await getAvailableDateKeys();
      setDateKeys(availableDateKeys);
    };
    fetchData();
  }, []);

  const handleDateChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const dateKey = event.target.value;
    setSelectedDateKey(dateKey);
    const count = await getSignInCountForPeriod(dateKey);
    setSignInCount(count);
    setShowDrillDown(false);
  };

  const handleDrillDown = async () => {
    const details = await getDetailsByUser(selectedDateKey);
    setUserDetails(details);
    setShowDrillDown(true);
  };

  return (
    <div className={styles.usageStatsContainer}>
      <div className={styles.usageStatsModal}>
          <h1>Usage Stats</h1>
          <select value={selectedDateKey} onChange={handleDateChange}>
            {dateKeys.map(dateKey => (
              <option key={dateKey} value={dateKey}>
                {dateKey}
              </option>
            ))}
          </select>
          <p>Number of events: {signInCount}</p>
          <button onClick={handleDrillDown}>Drill-down</button>
          {showDrillDown && (
                
                  
                  {/* ... other UI elements ... */}

            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(userDetails).map(([email, count]) => (
                  <tr key={email}>
                    <td>{email}</td>
                    <td>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button className={styles.closeButton} onClick={onClose}>
                    Close
          </button>
      </div>
    </div>
  );
};

export default UsageStats;