import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import DownloaderPage from './pages/DownloaderPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/download" element={<DownloaderPage />} />
      </Routes>
    </BrowserRouter>
  )
}
