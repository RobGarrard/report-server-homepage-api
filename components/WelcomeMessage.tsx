// components/WelcomeMessage.tsx

// Little welcome message introducing the site.

// ----------------------------------------------------------------------------
// Libraries

/** @jsx h */
import { h } from "preact";

// ----------------------------------------------------------------------------
// Main Component

export function WelcomeMessage(){
    return (
        <div className='welcome-message-container'>

            <h2>
              Institute for Teaching and Learning Innovation
            </h2>
            
            <div>
            Choose below from one of the custom reporting dashboards made by the Learning Analytics team.   
            </div>        
            
            <div>
            For any questions, please contact <a href="mailto:learning.analytics@uq.edu.au">learning.analytics@uq.edu.au</a>.
            </div>
                 
        </div>
    )
}