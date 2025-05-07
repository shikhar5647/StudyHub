import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaLinkedin, FaGithub, FaGlobe } from 'react-icons/fa';

const Team = () => {
  const teamMembers = [
    {
      name: 'Mahek Vanjani',
      role: 'Project Manager',
      image: '/mv_website.jpg',
      description:
        'A passionate and dedicated project manager, Mahek excels in orchestrating team efforts, ensuring timely delivery, and fostering collaborative innovation. She is known for her strategic thinking and leadership skills.',
      linkedin: 'https://www.linkedin.com/in/mahek-vanjani-93477a253/?originalSubdomain=in',
      github: 'https://github.com/MahekVanjani611',
      portfolio: 'https://mahekvanjani6112024.netlify.app/'
    },
    {
      name: 'Shikhar Dave',
      role: 'Lead Developer',
      image: '/Professional_SD_Profile.jpg',
      description:
        'Shikhar is a creative problem-solver and experienced in full-stack development. With a strong background in AI and product leadership, he brings both technical depth and product vision to the team.',
      linkedin: 'https://www.linkedin.com/in/shikhar-dave-400810258/',
      github: 'https://github.com/shikhar5647',
      portfolio: 'https://shikhardave032.netlify.app/'
    },
  ];

  return (
    <div className="container-fluid bg-light py-5">
      <h1 className="text-center mb-5">Meet Our Team</h1>
      <div className="row justify-content-center">
        {teamMembers.map((member, index) => (
          <div className="col-md-4 col-sm-6 mb-4 d-flex justify-content-center" key={index}>
            <div className="card w-100" style={{ maxWidth: '400px' }}>
              <div style={{ height: '600px', overflow: 'hidden' }}>
                <img 
                  src={member.image} 
                  className="card-img-top" 
                  alt={member.name} 
                  style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                />
              </div>
              <div className="card-body">
                <h5 className="card-title">{member.name}</h5>
                <h6 className="card-subtitle mb-2 text-muted">{member.role}</h6>
                <p className="card-text">{member.description}</p>
                <div className="mt-3 d-flex gap-3">
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary" title="LinkedIn Profile">
                    <FaLinkedin size={24} />
                  </a>
                  <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-dark" title="GitHub Profile">
                    <FaGithub size={24} />
                  </a>
                  <a href={member.portfolio} target="_blank" rel="noopener noreferrer" className="text-info" title="Portfolio">
                    <FaGlobe size={24} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Team;