import React from 'react'
import { Calendar } from './components/Calendar';
import { CalendarProvider } from './components/CalendarContext';
import './App.css'

function App() {
  return (
    <div className="App">
      <CalendarProvider>
        <Calendar />
      </CalendarProvider>
    </div>
  )
}

export default App
