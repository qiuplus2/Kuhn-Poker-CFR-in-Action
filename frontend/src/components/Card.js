// components/Card.js
import React from 'react';
import './Card.css';

const cardMap = {
  1: 'J',
  2: 'Q',
  3: 'K'
};

const Card = ({ value, faceUp, className }) => {
  const cardFace = cardMap[value];
  
  return (
    <div className={`card ${faceUp ? 'face-up' : 'face-down'} ${className || ''}`}>
      {faceUp && (
        <>
          <div className="corner top-left">{cardFace}</div>
          <div className="corner bottom-right">{cardFace}</div>
          <div className="center">{cardFace}</div>
        </>
      )}
    </div>
  );
};

export default Card;