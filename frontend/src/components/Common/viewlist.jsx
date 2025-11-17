// ViewList.js
import React from 'react';

function ViewList({ students }) {
  return (
    <div className="view-list-modal">
      <h2>At-Risk Students</h2>
      <ul>
        {students.map((student) => (
          <li key={student.id}>{student.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default ViewList;


