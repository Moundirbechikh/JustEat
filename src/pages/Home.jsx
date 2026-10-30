import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import MiniMenu from '../components/MiniMenu'
import Concept from '../components/Concept'
import Reviews from '../components/Reviews'
import Location from '../components/Location'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <MiniMenu/>
      <Concept/>
      <Reviews/>
      <Location/>
      <Footer/>
    </>
  )
}