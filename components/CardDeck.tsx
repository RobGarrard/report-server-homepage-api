// ----------------------------------------------------------------------------
// Card Deck Component
//  
// This component ingests a list of objects containing card title, description,
// and its hyperlink info.
// 
// Returns a div containing clickable cards for each object.
// ----------------------------------------------------------------------------

// Fresh boilerplate
/** @jsx h */
import { h } from "preact";

// Islands
import Card from "../islands/Card.tsx";

// ----------------------------------------------------------------------------
// Main Component

export function CardDeck(props){
    return (
        <div class='card-deck'>
            {props.cardList.map(data => <Card cardData={data}/>)}
        </div>
    );
}