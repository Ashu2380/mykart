import React from 'react'

function Title({text1 ,text2}) {
  return (
    <div className='title-main'>
        <p className='title-text1'>{text1} <span className='title-text2'>{text2}</span></p>
      
    </div>
  )
}

export default Title
