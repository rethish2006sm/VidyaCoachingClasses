import React from 'react'
import Navbar from './components/home/Navbar'
import Footer from './components/home/Footer'
import Home from './pages/Home'
import { Route, Routes } from 'react-router-dom'
import About from './pages/About';
import Admin from './pages/Admin';
import AdminGuard from './components/AdminGuard';
import AdminLogin from './pages/Admin_login';
import Admission from './pages/Admission';
import Contact from './pages/Contact';
import Courses from './pages/Courses';
import Gallery from './pages/Gallery';
import Leaderboard from './pages/Leaderboard';
import Results from './pages/Results'
import CourseDetails from './pages/CourseDetails';
import Certificate from './pages/Certificate';
import NotFound from './pages/NotFound';
import ScrollToTop from './components/ScrollToTop';
import { AdminSessionProvider } from './contexts/AdminSession';


const App = () => {
  return (
    <AdminSessionProvider>
      <div className='min-h-screen flex flex-col'>
        <Navbar />
        <ScrollToTop />

        <main className='flex-1'>
          <Routes>
            <Route path='/' element={<Home/>}></Route>
            <Route path='/about' element={<About/>}/>
            <Route path='/admin/login' element={<AdminLogin/>}/>
            <Route
              path='/admin'
              element={
                <AdminGuard>
                  <Admin />
                </AdminGuard>
              }
            />
            <Route path='/admission' element={<Admission/>}/>
            <Route path='/contact' element={<Contact/>}/>
            <Route path='/courses' element={<Courses/>}/>
            <Route path='/courses/:id' element={<CourseDetails/>}/>
            <Route path='/gallery' element={<Gallery/>}/>
            <Route path='/leaderboard' element={<Leaderboard/>}/>
            <Route path='/certificate' element={<Certificate/>}/>
            <Route path='/results' element={<Results/>}/>
            <Route path='*' element={<NotFound />} />
          </Routes>
        </main>

        <Footer />  
      </div>
    </AdminSessionProvider>
  )
}

export default App
