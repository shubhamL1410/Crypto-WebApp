import { NavLink, useLocation } from 'react-router-dom';
import './Home.css'

const Home = () => {
  const location = useLocation();

  return (
    <div className="home-wrapper">
      <nav className="navbar">
        <ul>
          <li><NavLink className="navbar-brand" to="/">Navbar</NavLink></li>
          <li><NavLink 
            to="/coins" 
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            Coins
          </NavLink></li>
          <li><NavLink to="/convert">Convert</NavLink></li>
          <li><NavLink to="/trade">Trade</NavLink></li>
          <li className="left"><NavLink to="/profile">Profile</NavLink></li>
        </ul>
      </nav>

      <div className="container">
        <div>
          <h1>Total Active User : 1</h1>
        </div>
        <div>
          <h1>About</h1>
        </div>
      </div>

      <footer>
        Shubham Lathiya
      </footer>
    </div>
  )
}

export default Home
