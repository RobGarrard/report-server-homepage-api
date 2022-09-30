/** @jsx h */
import { h } from "preact";


export function Header() {
    const logo_path = (
        'https://static.uq.net.au/v5/logos/corporate/uq-logo-white.svg'
    );

    return (
        <div className='header-container'>
          <div className='pre-header-container'>
            <div className='pre-header'>
              <a href='https://www.uq.edu.au/'>UQ home</a>
              <a href='https://www.uq.edu.au/news/'>News</a>
              <a href='https://www.uq.edu.au/uq-events/'>Events</a>
              <a href='https://alumni.uq.edu.au/giving/'>Give</a>
              <a href='https://contacts.uq.edu.au/contacts'>Contact</a> 
            </div>
          </div>
          <div className='main-header-container'>
            <div className='header'>
              <div className='logo'>
                <img 
                src={logo_path}
                alt="www.uq.edu.au"
                >
                </img>
              </div>
              <div>
                <h1>
                  Learning Analytics Reports
                </h1>
              </div>
            </div>
        </div>
      </div>
      );
    }
  