require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../db');
const User = require('../models/User');
const Course = require('../models/Course');

const INSTRUCTOR_EMAIL = 'instructor@studyhub.dev';

const sampleCourses = [
  {
    title: 'Artificial Intelligence',
    description:
      'Learn machine learning fundamentals, neural networks, and practical AI applications with hands-on projects.',
    category: 'Artificial Intelligence',
    level: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    tags: ['ai', 'ml', 'python'],
    modules: [
      {
        title: 'Introduction to AI',
        description: 'Core concepts and history of artificial intelligence.',
        order: 1,
        lessons: [
          {
            title: 'What is Artificial Intelligence?',
            type: 'video',
            order: 1,
            isPreviewable: true,
            content: {
              provider: 'youtube',
              url: 'https://www.youtube.com/watch?v=ad79nYk2keg',
              durationSec: 600,
            },
          },
          {
            title: 'AI vs Machine Learning vs Deep Learning',
            type: 'note',
            order: 2,
            isPreviewable: true,
            content: {
              provider: 'inline',
              markdown:
                '**AI** is the broad field of building intelligent systems.\n\n**Machine Learning** learns patterns from data without explicit programming.\n\n**Deep Learning** uses neural networks with many layers to learn complex representations.\n\n**Key Differences:**\n- AI is the umbrella term\n- ML is a subset of AI that uses statistical methods\n- DL is a subset of ML that uses deep neural networks\n\n**Examples:**\n- AI: Chess engines, virtual assistants\n- ML: Spam filters, recommendation systems\n- DL: Image recognition, language translation',
            },
          },
          {
            title: 'AI Full Course for Beginners',
            type: 'video',
            order: 3,
            isPreviewable: false,
            content: {
              provider: 'youtube',
              url: 'https://www.youtube.com/watch?v=LGCZ-Fhm48c',
              durationSec: 3600,
            },
          },
        ],
      },
      {
        title: 'Machine Learning Basics',
        description: 'Supervised and unsupervised learning fundamentals.',
        order: 2,
        lessons: [
          {
            title: 'How to Learn AI Effectively',
            type: 'video',
            order: 1,
            isPreviewable: false,
            content: {
              provider: 'youtube',
              url: 'https://www.youtube.com/watch?v=eiKkZNmaJYk',
              durationSec: 900,
            },
          },
          {
            title: 'Types of Machine Learning',
            type: 'note',
            order: 2,
            content: {
              provider: 'inline',
              markdown:
                '**Supervised Learning:** Model learns from labeled data\n- Classification: predict a category (spam/not spam)\n- Regression: predict a number (house price)\n\n**Unsupervised Learning:** Model finds patterns in unlabeled data\n- Clustering: group similar items (customer segments)\n- Dimensionality Reduction: simplify complex data (PCA)\n\n**Reinforcement Learning:** Agent learns by trial and error\n- Reward-based training\n- Used in robotics, game AI, autonomous vehicles',
            },
          },
          {
            title: 'AI Fundamentals Quiz',
            type: 'quiz',
            order: 3,
            content: {
              provider: 'inline',
              markdown: JSON.stringify({
                format: 'flashcard',
                cards: [
                  { front: 'What is the difference between AI and Machine Learning?', back: 'AI is the broad field of creating intelligent systems. Machine Learning is a subset of AI where systems learn patterns from data without being explicitly programmed.' },
                  { type: 'mcq', question: 'Which of these is a subset of Machine Learning?', options: ['Artificial Intelligence', 'Deep Learning', 'Cloud Computing', 'Cybersecurity'], answer: 1, explanation: 'Deep Learning is a subset of ML that uses neural networks with many layers.' },
                  { front: 'Name the three types of Machine Learning', back: 'Supervised Learning (learns from labeled data), Unsupervised Learning (finds patterns in unlabeled data), and Reinforcement Learning (learns through trial, error, and rewards).' },
                  { type: 'mcq', question: 'Email spam detection is an example of which type of learning?', options: ['Unsupervised Learning', 'Reinforcement Learning', 'Supervised Learning', 'Transfer Learning'], answer: 2, explanation: 'The model is trained on emails labeled "spam" or "not spam", making it supervised learning.' },
                  { front: 'What is overfitting in machine learning?', back: 'Overfitting occurs when a model learns the training data too well, including noise and outliers, and performs poorly on new, unseen data.' },
                  { type: 'mcq', question: 'What does an activation function do in a neural network?', options: ['Stores training data', 'Introduces non-linearity', 'Reduces the dataset size', 'Connects to the internet'], answer: 1, explanation: 'Activation functions like ReLU, Sigmoid, and Tanh introduce non-linearity, allowing the network to learn complex patterns.' },
                  { front: 'What is Deep Learning?', back: 'Deep Learning is a subset of Machine Learning that uses artificial neural networks with multiple layers (deep networks) to learn complex patterns and representations from data.' },
                  { type: 'mcq', question: 'Which technique helps prevent overfitting?', options: ['Using more features', 'Training longer', 'Regularization (e.g., dropout)', 'Removing the test set'], answer: 2, explanation: 'Regularization techniques like dropout, L1/L2 penalties, and early stopping help prevent overfitting by constraining the model.' },
                ],
              }),
            },
          },
        ],
      },
    ],
  },
  {
    title: 'Web Development',
    description:
      'Master HTML, CSS, JavaScript, and modern frameworks to build responsive web applications.',
    category: 'Web Development',
    level: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800',
    tags: ['html', 'css', 'javascript', 'react'],
    modules: [
      {
        title: 'Web Foundations',
        description: 'Learn HTML and CSS from scratch.',
        order: 1,
        lessons: [
          {
            title: 'HTML & CSS Full Course - Beginner to Pro',
            type: 'video',
            order: 1,
            isPreviewable: true,
            content: {
              provider: 'youtube',
              url: 'https://www.youtube.com/watch?v=G3e-cpL7ofc',
              durationSec: 4800,
            },
          },
          {
            title: 'HTML Essentials',
            type: 'note',
            order: 2,
            isPreviewable: true,
            content: {
              provider: 'inline',
              markdown:
                '**HTML** (HyperText Markup Language) structures web content.\n\n**Key Concepts:**\n- Elements: `<tag>content</tag>`\n- Attributes: `<img src="photo.jpg" alt="A photo">`\n- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`\n- Forms: `<form>`, `<input>`, `<button>`, `<select>`\n\n**CSS** (Cascading Style Sheets) styles the content.\n\n**Key Concepts:**\n- Selectors: element, class (`.name`), id (`#name`)\n- Box Model: margin → border → padding → content\n- Flexbox: one-dimensional layouts\n- Grid: two-dimensional layouts\n- Media Queries: responsive design',
            },
          },
        ],
      },
      {
        title: 'JavaScript & Beyond',
        description: 'Learn JavaScript and build interactive websites.',
        order: 2,
        lessons: [
          {
            title: 'HTML, CSS & JavaScript Full Course with Projects',
            type: 'video',
            order: 1,
            isPreviewable: false,
            content: {
              provider: 'youtube',
              url: 'https://www.youtube.com/watch?v=1Q8J6Pt3mBA',
              durationSec: 5400,
            },
          },
          {
            title: 'Full Stack Web Development Course',
            type: 'video',
            order: 2,
            content: {
              provider: 'youtube',
              url: 'https://www.youtube.com/watch?v=nu_pCVPKzTk',
              durationSec: 7200,
            },
          },
          {
            title: 'Web Development Quiz',
            type: 'quiz',
            order: 3,
            content: {
              provider: 'inline',
              markdown: JSON.stringify({
                format: 'flashcard',
                cards: [
                  { front: 'What does HTML stand for?', back: 'HyperText Markup Language. It defines the structure and content of web pages using elements (tags).' },
                  { type: 'mcq', question: 'Which CSS property is used to change the background color?', options: ['color', 'bg-color', 'background-color', 'font-color'], answer: 2, explanation: 'background-color sets the background color of an element. "color" changes the text color.' },
                  { front: 'What is the CSS Box Model?', back: 'Every HTML element is a box with four layers: Content (innermost) → Padding → Border → Margin (outermost). This determines the element\'s total size and spacing.' },
                  { type: 'mcq', question: 'What is the correct order of the CSS Box Model from inside to outside?', options: ['Margin → Border → Padding → Content', 'Content → Padding → Border → Margin', 'Content → Border → Padding → Margin', 'Padding → Content → Border → Margin'], answer: 1, explanation: 'The box model layers from inside out: Content → Padding → Border → Margin.' },
                  { front: 'What is the DOM?', back: 'The Document Object Model (DOM) is a programming interface that represents the HTML document as a tree of nodes. JavaScript uses it to read, change, add, or delete HTML elements.' },
                  { type: 'mcq', question: 'Which JavaScript keyword declares a variable that cannot be reassigned?', options: ['var', 'let', 'const', 'static'], answer: 2, explanation: 'const declares a block-scoped variable that cannot be reassigned after initialization. var is function-scoped, let is block-scoped but reassignable.' },
                  { front: 'What is responsive design?', back: 'Responsive design makes websites adapt to different screen sizes using flexible grids, images, and CSS media queries (e.g., @media (max-width: 768px)).' },
                  { type: 'mcq', question: 'Which HTML tag is used to create a hyperlink?', options: ['<link>', '<href>', '<a>', '<url>'], answer: 2, explanation: 'The <a> (anchor) tag creates hyperlinks. Usage: <a href="https://example.com">Click here</a>. The <link> tag is used for external stylesheets.' },
                ],
              }),
            },
          },
        ],
      },
    ],
  },
  {
    title: 'Cyber Security',
    description:
      'Understand network security, common vulnerabilities, and ethical hacking fundamentals.',
    category: 'Cyber Security',
    level: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800',
    tags: ['security', 'networking', 'ethical-hacking'],
    modules: [
      {
        title: 'Security Basics',
        description: 'Fundamentals of cybersecurity and threat landscape.',
        order: 1,
        lessons: [
          {
            title: 'Cybersecurity for Beginners (Full Course)',
            type: 'video',
            order: 1,
            isPreviewable: true,
            content: {
              provider: 'youtube',
              url: 'https://www.youtube.com/watch?v=X50Qkm9-d8M',
              durationSec: 14400,
            },
          },
          {
            title: 'Core Security Concepts',
            type: 'note',
            order: 2,
            isPreviewable: true,
            content: {
              provider: 'inline',
              markdown:
                '**CIA Triad** — the three pillars of information security:\n- **Confidentiality:** Only authorized users can access data\n- **Integrity:** Data is accurate and unaltered\n- **Availability:** Systems are accessible when needed\n\n**Common Threats:**\n- Phishing: social engineering via fake emails/websites\n- Malware: viruses, ransomware, trojans, spyware\n- Man-in-the-Middle: intercepting communications\n- SQL Injection: injecting malicious database queries\n- DDoS: overwhelming a system with traffic\n\n**Defense Layers:**\n- Firewalls, IDS/IPS, encryption\n- Access control and authentication\n- Regular patching and updates\n- Security awareness training',
            },
          },
        ],
      },
      {
        title: 'Ethical Hacking & Defense',
        description: 'Learn to think like an attacker to defend better.',
        order: 2,
        lessons: [
          {
            title: 'Cybersecurity Full Course 2025',
            type: 'video',
            order: 1,
            content: {
              provider: 'youtube',
              url: 'https://www.youtube.com/watch?v=HZzXbxajz80',
              durationSec: 10800,
            },
          },
          {
            title: 'Beginner\'s Guide to Cyber Security',
            type: 'video',
            order: 2,
            content: {
              provider: 'youtube',
              url: 'https://www.youtube.com/watch?v=NHyKJpQsJQU',
              durationSec: 1200,
            },
          },
          {
            title: 'Cybersecurity Quiz',
            type: 'quiz',
            order: 3,
            content: {
              provider: 'inline',
              markdown: JSON.stringify({
                format: 'flashcard',
                cards: [
                  { front: 'What is the CIA Triad?', back: 'Confidentiality (only authorized access), Integrity (data is accurate and unaltered), and Availability (systems accessible when needed). It\'s the foundation of information security.' },
                  { type: 'mcq', question: 'Which of these is a social engineering attack?', options: ['SQL Injection', 'DDoS', 'Phishing', 'Brute Force'], answer: 2, explanation: 'Phishing tricks people into revealing sensitive info by impersonating trusted entities. The others are technical attacks, not social engineering.' },
                  { front: 'What is the difference between symmetric and asymmetric encryption?', back: 'Symmetric uses one shared key for encryption and decryption (fast, e.g., AES). Asymmetric uses a public/private key pair (slower but more secure for key exchange, e.g., RSA).' },
                  { type: 'mcq', question: 'What does the "A" in CIA Triad stand for?', options: ['Authentication', 'Authorization', 'Availability', 'Anonymity'], answer: 2, explanation: 'CIA = Confidentiality, Integrity, Availability. Availability means systems and data are accessible when needed by authorized users.' },
                  { front: 'What is SQL Injection?', back: 'An attack where malicious SQL code is inserted into input fields to manipulate or access the database. Prevented by using parameterized queries and input validation.' },
                  { type: 'mcq', question: 'Which encryption type uses a public/private key pair?', options: ['Symmetric encryption', 'Asymmetric encryption', 'Hashing', 'Base64 encoding'], answer: 1, explanation: 'Asymmetric encryption (e.g., RSA) uses a public key to encrypt and a private key to decrypt. Symmetric uses one shared key for both.' },
                  { front: 'What is a DDoS attack?', back: 'Distributed Denial of Service — attackers flood a server with traffic from many sources to overwhelm it and make it unavailable to legitimate users.' },
                  { type: 'mcq', question: 'What is the best defense against SQL Injection?', options: ['Strong passwords', 'Parameterized queries', 'Firewalls', 'Antivirus software'], answer: 1, explanation: 'Parameterized queries (prepared statements) separate SQL code from user input, preventing malicious SQL from being executed.' },
                ],
              }),
            },
          },
        ],
      },
    ],
  },
  {
    title: 'Data Science',
    description:
      'Analyze data and build predictive models using Python, pandas, and visualization tools.',
    category: 'Data Science',
    level: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    tags: ['data', 'python', 'analytics', 'pandas'],
    modules: [
      {
        title: 'Data Science Workflow',
        description: 'From data collection to insights.',
        order: 1,
        lessons: [
          {
            title: 'Python for Data Science (Full Bootcamp)',
            type: 'video',
            order: 1,
            isPreviewable: true,
            content: {
              provider: 'youtube',
              url: 'https://www.youtube.com/watch?v=XX44XYjK_JQ',
              durationSec: 14400,
            },
          },
          {
            title: 'The Data Science Process',
            type: 'note',
            order: 2,
            isPreviewable: true,
            content: {
              provider: 'inline',
              markdown:
                '**The Data Science Lifecycle:**\n\n1. **Problem Definition** — What question are we trying to answer?\n2. **Data Collection** — Gather data from databases, APIs, files\n3. **Data Cleaning** — Handle missing values, outliers, formatting\n4. **Exploratory Data Analysis (EDA)** — Visualize and understand patterns\n5. **Feature Engineering** — Create meaningful variables for modeling\n6. **Model Building** — Train ML models (regression, classification, etc.)\n7. **Evaluation** — Measure accuracy, precision, recall, F1-score\n8. **Deployment** — Put the model into production\n\n**Essential Python Libraries:**\n- **NumPy** — numerical computing\n- **Pandas** — data manipulation and analysis\n- **Matplotlib / Seaborn** — data visualization\n- **Scikit-learn** — machine learning',
            },
          },
        ],
      },
      {
        title: 'Python Data Tools',
        description: 'Master pandas, NumPy, and visualization.',
        order: 2,
        lessons: [
          {
            title: 'Python Pandas Complete Tutorial',
            type: 'video',
            order: 1,
            content: {
              provider: 'youtube',
              url: 'https://www.youtube.com/watch?v=2uvysYbKdjM',
              durationSec: 3600,
            },
          },
          {
            title: 'Data Analysis with Python (NumPy, Pandas, Matplotlib)',
            type: 'video',
            order: 2,
            content: {
              provider: 'youtube',
              url: 'https://www.youtube.com/watch?v=r-uOLxNrNk8',
              durationSec: 16200,
            },
          },
          {
            title: 'Data Science Quiz',
            type: 'quiz',
            order: 3,
            content: {
              provider: 'inline',
              markdown: JSON.stringify({
                format: 'flashcard',
                cards: [
                  { front: 'What is a DataFrame in pandas?', back: 'A 2-dimensional labeled data structure with columns of potentially different types. Think of it as a spreadsheet or SQL table in Python. Created with pd.DataFrame().' },
                  { type: 'mcq', question: 'Which Python library is primarily used for data manipulation and analysis?', options: ['NumPy', 'Matplotlib', 'Pandas', 'Scikit-learn'], answer: 2, explanation: 'Pandas provides DataFrames and Series for data manipulation. NumPy is for numerical computing, Matplotlib for visualization, Scikit-learn for ML.' },
                  { front: 'What is the difference between correlation and causation?', back: 'Correlation means two variables move together (positive or negative). Causation means one variable directly causes a change in another. Correlation does NOT imply causation.' },
                  { type: 'mcq', question: 'Which method removes rows with missing values in pandas?', options: ['df.fillna()', 'df.dropna()', 'df.replace()', 'df.clean()'], answer: 1, explanation: 'df.dropna() removes rows containing missing values. df.fillna() fills them with a specified value instead of removing.' },
                  { front: 'What is feature engineering?', back: 'The process of creating new features (variables) from existing data to improve model performance. Examples: extracting year from dates, creating ratios, one-hot encoding categories.' },
                  { type: 'mcq', question: 'Predicting house prices is an example of which type of problem?', options: ['Classification', 'Clustering', 'Regression', 'Dimensionality Reduction'], answer: 2, explanation: 'Regression predicts continuous numerical values (like prices). Classification predicts discrete categories. Clustering groups similar items.' },
                  { front: 'What is EDA?', back: 'Exploratory Data Analysis — the process of examining datasets to summarize their characteristics using statistics and visualizations before formal modeling. Tools: histograms, scatter plots, box plots.' },
                  { type: 'mcq', question: 'What does "correlation does NOT imply causation" mean?', options: ['Correlated variables are always independent', 'Two variables moving together doesn\'t mean one causes the other', 'Causation is stronger than correlation', 'You cannot measure correlation'], answer: 1, explanation: 'Just because two variables are correlated doesn\'t mean one causes the other. There could be a third variable, coincidence, or reverse causation.' },
                ],
              }),
            },
          },
        ],
      },
    ],
  },
  {
    title: 'Cloud Computing',
    description:
      'Explore cloud services, deployment models, and infrastructure on major providers.',
    category: 'Cloud Computing',
    level: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1603732551658-5fabbafa84eb?w=800',
    tags: ['aws', 'cloud', 'devops'],
    modules: [
      {
        title: 'Cloud Fundamentals',
        description: 'Understand what cloud computing is and why it matters.',
        order: 1,
        lessons: [
          {
            title: 'Cloud Computing Explained for Beginners',
            type: 'video',
            order: 1,
            isPreviewable: true,
            content: {
              provider: 'youtube',
              url: 'https://www.youtube.com/watch?v=-y7gx3fZLnI',
              durationSec: 3600,
            },
          },
          {
            title: 'Cloud Computing Overview',
            type: 'note',
            order: 2,
            isPreviewable: true,
            content: {
              provider: 'inline',
              markdown:
                '**What is Cloud Computing?**\nOn-demand delivery of IT resources over the internet with pay-as-you-go pricing.\n\n**Service Models:**\n- **IaaS** (Infrastructure as a Service): Virtual machines, storage, networking — e.g., AWS EC2, Azure VMs\n- **PaaS** (Platform as a Service): Managed runtime for apps — e.g., Heroku, Google App Engine\n- **SaaS** (Software as a Service): Ready-to-use applications — e.g., Gmail, Slack, Salesforce\n\n**Deployment Models:**\n- Public Cloud: shared infrastructure (AWS, Azure, GCP)\n- Private Cloud: dedicated infrastructure for one organization\n- Hybrid Cloud: combination of public and private\n\n**Key Benefits:**\n- Scalability and elasticity\n- Cost efficiency (no upfront hardware)\n- Global availability\n- Automatic updates and maintenance',
            },
          },
        ],
      },
      {
        title: 'AWS in Practice',
        description: 'Hands-on with Amazon Web Services.',
        order: 2,
        lessons: [
          {
            title: 'AWS Full Course for Beginners',
            type: 'video',
            order: 1,
            content: {
              provider: 'youtube',
              url: 'https://www.youtube.com/watch?v=VIEiR-mia0c',
              durationSec: 18000,
            },
          },
          {
            title: 'AWS Step-by-Step Tutorial',
            type: 'video',
            order: 2,
            content: {
              provider: 'youtube',
              url: 'https://www.youtube.com/watch?v=Nzv-tzU-UAw',
              durationSec: 5400,
            },
          },
          {
            title: 'Cloud Computing Quiz',
            type: 'quiz',
            order: 3,
            content: {
              provider: 'inline',
              markdown: JSON.stringify({
                format: 'flashcard',
                cards: [
                  { front: 'What are the three main cloud service models?', back: 'IaaS (Infrastructure as a Service — VMs, storage), PaaS (Platform as a Service — managed app hosting), and SaaS (Software as a Service — ready-to-use apps like Gmail).' },
                  { type: 'mcq', question: 'Gmail is an example of which cloud service model?', options: ['IaaS', 'PaaS', 'SaaS', 'FaaS'], answer: 2, explanation: 'Gmail is Software as a Service (SaaS) — a ready-to-use application delivered over the internet. No infrastructure or platform management needed.' },
                  { front: 'What is the difference between scaling up and scaling out?', back: 'Scaling up (vertical): adding more power to an existing machine (more CPU/RAM). Scaling out (horizontal): adding more machines to distribute the load.' },
                  { type: 'mcq', question: 'What is AWS EC2?', options: ['A database service', 'A virtual machine service', 'A storage service', 'A DNS service'], answer: 1, explanation: 'EC2 (Elastic Compute Cloud) provides resizable virtual servers in the cloud. S3 is storage, RDS is database, Route 53 is DNS.' },
                  { front: 'What is serverless computing?', back: 'A cloud model where the provider manages the infrastructure and automatically allocates resources. You only pay for actual execution time. Example: AWS Lambda, Azure Functions.' },
                  { type: 'mcq', question: 'Adding more machines to handle traffic is called:', options: ['Scaling up (vertical)', 'Scaling out (horizontal)', 'Load shedding', 'Auto-patching'], answer: 1, explanation: 'Scaling out (horizontal scaling) adds more machines. Scaling up (vertical scaling) adds more CPU/RAM to an existing machine.' },
                  { front: 'What is a CDN?', back: 'Content Delivery Network — a distributed network of servers that delivers web content to users based on their geographic location, reducing latency. Example: AWS CloudFront.' },
                  { type: 'mcq', question: 'Which cloud model means you only pay when your code runs?', options: ['IaaS', 'PaaS', 'Dedicated hosting', 'Serverless / FaaS'], answer: 3, explanation: 'Serverless (Function as a Service) charges only for execution time. AWS Lambda, Azure Functions, and Google Cloud Functions are examples.' },
                ],
              }),
            },
          },
        ],
      },
    ],
  },
  {
    title: 'Game Development',
    description:
      'Create engaging games with core design principles and popular engines.',
    category: 'Game Development',
    level: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=800',
    tags: ['games', 'unity', 'c-sharp', 'game-design'],
    modules: [
      {
        title: 'Game Dev Intro',
        description: 'Getting started with game development concepts.',
        order: 1,
        lessons: [
          {
            title: 'Unity 6 - Complete Beginners Tutorial',
            type: 'video',
            order: 1,
            isPreviewable: true,
            content: {
              provider: 'youtube',
              url: 'https://www.youtube.com/watch?v=vQY4jsho1nQ',
              durationSec: 7200,
            },
          },
          {
            title: 'Game Development Fundamentals',
            type: 'note',
            order: 2,
            isPreviewable: true,
            content: {
              provider: 'inline',
              markdown:
                '**Game Development Pillars:**\n\n1. **Game Design** — mechanics, rules, player experience\n2. **Programming** — game logic, physics, AI behavior\n3. **Art & Animation** — 2D sprites, 3D models, UI design\n4. **Audio** — sound effects, music, voice acting\n5. **Testing & QA** — bug fixing, playtesting, balancing\n\n**Popular Game Engines:**\n- **Unity** — C#, huge asset store, great for 2D/3D, mobile\n- **Unreal Engine** — C++/Blueprints, AAA graphics, free\n- **Godot** — GDScript/C#, open source, lightweight\n\n**Key Programming Concepts for Games:**\n- Game loop (update → render → repeat)\n- Physics simulation (collisions, gravity)\n- State machines (menu → playing → paused → game over)\n- Entity-Component-System (ECS) architecture',
            },
          },
        ],
      },
      {
        title: 'Building Your First Game',
        description: 'Hands-on game creation with Unity.',
        order: 2,
        lessons: [
          {
            title: 'How To Make A Game In Unity (2025)',
            type: 'video',
            order: 1,
            content: {
              provider: 'youtube',
              url: 'https://www.youtube.com/watch?v=w0KPnGOLiGY',
              durationSec: 3600,
            },
          },
          {
            title: 'Game Development with Unity & C#',
            type: 'video',
            order: 2,
            content: {
              provider: 'youtube',
              url: 'https://www.youtube.com/watch?v=bSW9E5uoxa4',
              durationSec: 5400,
            },
          },
          {
            title: 'Game Development Quiz',
            type: 'quiz',
            order: 3,
            content: {
              provider: 'inline',
              markdown: JSON.stringify({
                format: 'flashcard',
                cards: [
                  { front: 'What is a game loop?', back: 'The core cycle of a game: Process Input → Update Game State → Render Frame → Repeat. It runs continuously (typically 30-60 times per second) to create the illusion of real-time interaction.' },
                  { type: 'mcq', question: 'Which programming language does Unity primarily use?', options: ['Python', 'Java', 'C#', 'C++'], answer: 2, explanation: 'Unity uses C# for scripting. Unreal Engine uses C++ and Blueprints. Godot uses GDScript or C#.' },
                  { front: 'What is a sprite?', back: 'A 2D image or animation used in games. Sprites represent characters, objects, and backgrounds in 2D games. A sprite sheet combines multiple frames into one image for animation.' },
                  { type: 'mcq', question: 'What is the typical frame rate for smooth gameplay?', options: ['10 FPS', '24 FPS', '60 FPS', '1000 FPS'], answer: 2, explanation: '60 FPS (frames per second) is the standard for smooth gameplay. 30 FPS is acceptable. 24 FPS is film standard but feels choppy in games.' },
                  { front: 'What is collision detection?', back: 'The process of determining when two game objects overlap or touch. Types include AABB (axis-aligned bounding boxes), circle/sphere colliders, and pixel-perfect collision.' },
                  { type: 'mcq', question: 'In a game loop, what happens after processing user input?', options: ['The game exits', 'Game state is updated', 'Assets are downloaded', 'The game is saved'], answer: 1, explanation: 'The game loop cycle: Process Input → Update Game State → Render Frame → Repeat.' },
                  { front: 'What is a state machine in game development?', back: 'A pattern for managing game/character states (idle, walking, jumping, attacking). Each state defines behavior, and transitions define when to switch between states.' },
                  { type: 'mcq', question: 'Which game engine is open source and free?', options: ['Unity', 'Unreal Engine', 'Godot', 'GameMaker'], answer: 2, explanation: 'Godot is fully open source (MIT license). Unity is free for personal use but proprietary. Unreal is free with royalty fees above a revenue threshold.' },
                ],
              }),
            },
          },
        ],
      },
    ],
  },
];

function youtubeIdFromUrl(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  );
  return match ? match[1] : null;
}

async function seed() {
  await connectDB();

  let instructor = await User.findOne({ email: INSTRUCTOR_EMAIL });
  if (!instructor) {
    instructor = await User.create({
      name: 'StudyHub Instructor',
      email: INSTRUCTOR_EMAIL,
      password: 'studyhub123',
      role: 'instructor',
      emailVerified: true,
    });
    console.log(`Created instructor: ${INSTRUCTOR_EMAIL} / studyhub123`);
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const data of sampleCourses) {
    const modules = (data.modules || []).map((mod) => ({
      ...mod,
      lessons: (mod.lessons || []).map((lesson) => {
        const content = { ...lesson.content };
        if (content.provider === 'youtube' && content.url && !content.url.includes('embed')) {
          const videoId = youtubeIdFromUrl(content.url);
          if (videoId) content.url = `https://www.youtube.com/embed/${videoId}`;
        }
        return { ...lesson, content };
      }),
    }));

    const existing = await Course.findOne({ title: data.title });
    if (existing) {
      existing.modules = modules;
      existing.description = data.description;
      existing.tags = data.tags;
      await existing.save();
      updated += 1;
      console.log(`Updated: ${existing.title}`);
      continue;
    }

    const course = await Course.create({
      ...data,
      modules,
      published: true,
      price: 0,
      instructor: instructor._id,
    });

    await User.findByIdAndUpdate(instructor._id, {
      $addToSet: { createdCourses: course._id },
    });

    created += 1;
    console.log(`Seeded: ${course.title} (${course.slug})`);
  }

  console.log(`Done. Created ${created}, updated ${updated}, skipped ${skipped}.`);
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
