import React from 'react';
import '../App.css'; // Ensure Tailwind CSS is imported in App.css

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
    <div className="bg-gradient-to-b from-indigo-900 to-indigo-600 py-12 px-6 min-h-screen text-white">
      <h1 className="text-4xl font-bold text-center mb-10">Meet Our Team</h1>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-center gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-black text-black-900 rounded-xl shadow-lg overflow-hidden w-80 flex flex-col transform hover:scale-105 transition duration-300"
            >
              <div className="h-80 w-full overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  style={{ maxWidth: '400px', maxHeight: '400px' }}
                />
              </div>
              <div className="p-6 flex-grow">
                <h2 className="text-2xl font-bold mb-1">{member.name}</h2>
                <p className="text-indigo-600 font-medium mb-3">{member.role}</p>
                <p className="text-sm leading-relaxed">{member.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Team;