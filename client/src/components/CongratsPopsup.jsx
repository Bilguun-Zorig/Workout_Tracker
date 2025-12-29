import React from 'react'

const CongratsPopsup = ({open, title, onClose}) => {

    if(!open) return null;
  return (
    <div>
        <h3>Congratulations!</h3>
        <p>You completed: <strong>{title}</strong></p>
        <button onClick={onClose}>Awesome</button>
    </div>
  )
}

export default CongratsPopsup