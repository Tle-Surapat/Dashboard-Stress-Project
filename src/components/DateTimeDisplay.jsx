import React, { useState, useEffect } from 'react';

const DateTimeDisplay = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(new Date());
    }, 1000); // อัปเดตทุก 1 วินาที

    return () => clearInterval(interval); // ล้าง interval ตอน component ถูก unmount
  }, []);

  const formatDateTime = (date) => {
    return date.toLocaleString('en-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Bangkok',
    });
  };

  return (
    <p>Time: {formatDateTime(dateTime)}</p>
  );
};

export default DateTimeDisplay;
