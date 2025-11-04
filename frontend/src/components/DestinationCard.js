import React from 'react';
import './DestinationCard.css';

function DestinationCard({ image, name }) {
  return (
    <div className="destination-card">
      <img src={image} alt={name} />
      <div className="destination-name">{name}</div>
    </div>
  );
}

export default DestinationCard;