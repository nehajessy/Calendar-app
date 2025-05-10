import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import './Calendar.css';

dayjs.extend(isoWeek); // Extend dayjs to use ISO weeks (start on Monday)

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [events, setEvents] = useState([]);

  // Calculate calendar date range
  const startOfMonth = currentDate.startOf('month');
  const startDate = startOfMonth.startOf('isoWeek'); // start on Monday
  const endDate = startOfMonth.endOf('month').endOf('isoWeek');

  const dates = [];
  let date = startDate;

  while (date.isBefore(endDate, 'day') || date.isSame(endDate, 'day')) {
    dates.push(date);
    date = date.add(1, 'day');
  }

  useEffect(() => {
    fetch('/events.json')
      .then(res => res.json())
      .then(data => {
        console.log('Fetched Events:', data);
        setEvents(data);
      });
  }, []);

  const getEventsForDate = d => {
    const result = events.filter(ev => dayjs(ev.date).isSame(d, 'day'));
    return result;
  };

  const importantEvents = events.filter(ev => ev.important);
  const todayEvents = getEventsForDate(dayjs());

  const nextMonth = () => setCurrentDate(currentDate.add(1, 'month'));
  const prevMonth = () => setCurrentDate(currentDate.subtract(1, 'month'));

  return (
    <div className="calendar-wrapper">
      {/* Sidebar */}
      <div className="sidebar">
        <h3>Important Events</h3>
        {importantEvents.length === 0 ? (
          <p>No important events</p>
        ) : (
          <ul>
            {importantEvents.map((ev, idx) => (
              <li key={idx}>
                <strong>{ev.title}</strong><br />
                {dayjs(ev.date).format('MMM D')}
              </li>
            ))}
          </ul>
        )}

        <h3>Notifications</h3>
        {todayEvents.length === 0 ? (
          <p>No events today</p>
        ) : (
          todayEvents.map((ev, i) => (
            <div key={i} className="notification">
              <strong>{ev.title}</strong> at {ev.time}
            </div>
          ))
        )}
      </div>

      {/* Calendar Main */}
      <div className="calendar-container">
        <div className="calendar-header">
          <h1>{currentDate.format("MMMM YYYY")}</h1>
          <div>
            <button onClick={prevMonth}>◀</button>
            <button onClick={nextMonth}>▶</button>
          </div>
        </div>

        <div className="day-labels">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="calendar-grid">
          {dates.map((d, idx) => {
            const isToday = d.isSame(dayjs(), 'day');
            const dailyEvents = getEventsForDate(d);

            return (
              <div
                key={idx}
                className={`calendar-cell ${isToday ? 'today' : ''}`}
              >
                <div className="cell-date">{d.date()}</div>
                {dailyEvents.map((ev, i) => (
                  <div
                    key={i}
                    className={`event ${ev.important ? 'important' : ''}`}
                  >
                    {ev.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
