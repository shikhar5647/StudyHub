import React, { useState } from 'react';
import '../App.css';

const Team = () => {
    const [teamMembers, setTeamMembers] = useState([
        {
            name: ' Mahek Vanjani',
            role: 'Project Manager',
            image: 'https://via.placeholder.com/150',
            description: 'John is the project manager who ensures everything runs smoothly.',
        },
        {
            name: 'Shikhar Dave',
            role: 'Lead Developer',
            image: 'https://via.placeholder.com/150',
            description: 'Jane is the lead developer responsible for the core functionality.',
        },

    ]);

    return (
        <div className="team-container">
            {teamMembers.map((member, index) => (
                <div className="team-member" key={index}>
                    <img src={member.image} alt={member.name} />
                    <h3>{member.name}</h3>
                    <p><strong>{member.role}</strong></p>
                    <p>{member.description}</p>
                </div>
            ))}
        </div>
    );
};

export default Team;