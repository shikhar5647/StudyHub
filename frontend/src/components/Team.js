import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Team = () => {
  const teamMembers = [
    {
      name: 'Mahek Vanjani',
      role: 'Project Manager',
      image: '/mv_website.jpg',
      description:
        'A passionate and dedicated project manager, Mahek excels in orchestrating team efforts, ensuring timely delivery, and fostering collaborative innovation. She is known for her strategic thinking and leadership skills.',
    },
    {
      name: 'Shikhar Dave',
      role: 'Lead Developer',
      image: '/Professional_SD_Profile.jpg',
      description:
        'Shikhar is a creative problem-solver and experienced in full-stack development. With a strong background in AI and product leadership, he brings both technical depth and product vision to the team.',
    },
  ];

  return (
    <div className="container-fluid bg-light py-5">
      <h1 className="text-center mb-5">Meet Our Team</h1>
      <div className="row justify-content-center">
        {teamMembers.map((member, index) => (
          <div className="col-md-4 col-sm-6 mb-4 d-flex justify-content-center" key={index}>
            <div className="card w-100" style={{ width: '60rem' }}>
              <img src={member.image} className="card-img-top" alt={member.name} />
              <div className="card-body">
                <h5 className="card-title">{member.name}</h5>
                <h6 className="card-subtitle mb-2 text-muted">{member.role}</h6>
                <p className="card-text">{member.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Team;