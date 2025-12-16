// Comprehensive skills, goals, and interests for all BRACU departments

export const BRACU_OPTIONS = {
  // Skills organized by department and general
  skills: {
    // Computer Science & Engineering
    cse: [
      'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift',
      'React', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Flask', 'Spring Boot', 'ASP.NET',
      'Machine Learning', 'Deep Learning', 'Data Science', 'Artificial Intelligence',
      'Computer Vision', 'Natural Language Processing', 'Big Data', 'Cloud Computing',
      'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD',
      'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
      'Git', 'GitHub', 'Agile', 'Scrum', 'DevOps', 'Testing', 'Debugging',
      'Cybersecurity', 'Network Security', 'Penetration Testing', 'Blockchain',
      'Mobile App Development', 'iOS Development', 'Android Development', 'Flutter', 'React Native',
      'UI/UX Design', 'Wireframing', 'Prototyping', 'Figma', 'Adobe XD',
      'Algorithm Design', 'Data Structures', 'System Design', 'Microservices',
    ],
    
    // Electrical & Electronic Engineering
    eee: [
      'Circuit Design', 'PCB Design', 'Embedded Systems', 'Microcontrollers', 'Arduino', 'Raspberry Pi',
      'MATLAB', 'Simulink', 'LabVIEW', 'VHDL', 'Verilog', 'FPGA Programming',
      'Power Systems', 'Renewable Energy', 'Solar Energy', 'Wind Energy',
      'Control Systems', 'Automation', 'Robotics', 'PLC Programming',
      'Signal Processing', 'Image Processing', 'Communication Systems',
      'RF Engineering', 'Antenna Design', 'Wireless Communication',
      'Internet of Things (IoT)', 'Smart Home Systems', '5G Technology',
      'Power Electronics', 'Electric Vehicles', 'Battery Technology',
      'Electronics Manufacturing', 'Quality Assurance', 'Testing & Measurement',
    ],
    
    // Business Administration
    bba: [
      'Financial Analysis', 'Accounting', 'Bookkeeping', 'Taxation', 'Auditing',
      'Marketing Strategy', 'Digital Marketing', 'Social Media Marketing', 'SEO', 'Content Marketing',
      'Brand Management', 'Market Research', 'Consumer Behavior Analysis',
      'Human Resource Management', 'Recruitment', 'Employee Relations', 'Training & Development',
      'Operations Management', 'Supply Chain Management', 'Logistics', 'Inventory Management',
      'Project Management', 'Risk Management', 'Change Management',
      'Business Strategy', 'Business Planning', 'Entrepreneurship', 'Startup Management',
      'Excel', 'PowerPoint', 'Business Analytics', 'Data Visualization', 'Tableau', 'Power BI',
      'CRM Systems', 'ERP Systems', 'SAP', 'Salesforce',
      'Negotiation', 'Contract Management', 'Business Law', 'Corporate Governance',
      'International Business', 'Import/Export', 'Cross-cultural Management',
    ],
    
    // Economics
    economics: [
      'Microeconomics', 'Macroeconomics', 'Econometrics', 'Statistical Analysis',
      'Economic Modeling', 'Forecasting', 'Time Series Analysis',
      'Public Policy Analysis', 'Development Economics', 'International Economics',
      'Financial Economics', 'Behavioral Economics', 'Game Theory',
      'R Programming', 'Stata', 'SAS', 'SPSS', 'Python for Economics',
      'Research Methodology', 'Data Collection', 'Survey Design',
      'Economic Research', 'Report Writing', 'Policy Recommendations',
    ],
    
    // Architecture
    architecture: [
      'AutoCAD', 'Revit', 'SketchUp', '3ds Max', 'Rhino', 'Grasshopper',
      'Architectural Design', 'Urban Design', 'Landscape Design', 'Interior Design',
      'Building Information Modeling (BIM)', 'Sustainable Architecture', 'Green Building',
      'Construction Management', 'Project Planning', 'Cost Estimation',
      'Structural Design', 'Building Codes', 'Zoning Regulations',
      'Rendering', 'V-Ray', 'Lumion', 'Photoshop', 'Illustrator', 'InDesign',
      'Hand Drawing', 'Technical Drawing', 'Model Making',
    ],
    
    // English & Humanities
    english: [
      'Creative Writing', 'Academic Writing', 'Technical Writing', 'Content Writing',
      'Copywriting', 'Proofreading', 'Editing', 'Publishing',
      'Literature Analysis', 'Literary Criticism', 'Research',
      'Communication Skills', 'Public Speaking', 'Presentation Skills',
      'Journalism', 'Reporting', 'Media Studies',
      'Translation', 'Language Teaching', 'TESOL', 'ESL',
    ],
    
    // Pharmacy
    pharmacy: [
      'Pharmaceutical Chemistry', 'Pharmacology', 'Pharmacokinetics', 'Drug Development',
      'Clinical Pharmacy', 'Hospital Pharmacy', 'Community Pharmacy',
      'Quality Control', 'Quality Assurance', 'Regulatory Affairs',
      'Drug Information Services', 'Patient Counseling', 'Medication Therapy Management',
      'Pharmaceutical Manufacturing', 'GMP', 'GLP', 'Good Distribution Practices',
      'Research Methodology', 'Clinical Trials', 'Biostatistics',
    ],
    
    // Biotechnology
    biotechnology: [
      'Molecular Biology', 'Genetics', 'Genetic Engineering', 'CRISPR',
      'Cell Culture', 'Tissue Culture', 'Microbiology', 'Immunology',
      'Bioinformatics', 'Genomics', 'Proteomics', 'Metabolomics',
      'PCR', 'DNA Sequencing', 'Gel Electrophoresis', 'Western Blotting',
      'Fermentation Technology', 'Bioprocess Engineering', 'Downstream Processing',
      'Enzyme Technology', 'Protein Purification', 'Chromatography',
    ],
    
    // Mathematics
    mathematics: [
      'Calculus', 'Linear Algebra', 'Differential Equations', 'Abstract Algebra',
      'Real Analysis', 'Complex Analysis', 'Number Theory', 'Topology',
      'Probability Theory', 'Statistics', 'Stochastic Processes',
      'Numerical Methods', 'Computational Mathematics', 'Mathematical Modeling',
      'Optimization', 'Operations Research', 'Game Theory',
      'MATLAB', 'Mathematica', 'R', 'Python (NumPy, SciPy)',
    ],
    
    // Physics
    physics: [
      'Classical Mechanics', 'Quantum Mechanics', 'Thermodynamics', 'Electromagnetism',
      'Optics', 'Solid State Physics', 'Nuclear Physics', 'Particle Physics',
      'Astrophysics', 'Cosmology', 'Relativity',
      'Computational Physics', 'Simulation', 'Data Analysis',
      'Laboratory Skills', 'Instrumentation', 'Spectroscopy',
      'MATLAB', 'Python', 'LabVIEW', 'Origin',
    ],
    
    // Microbiology
    microbiology: [
      'Bacteriology', 'Virology', 'Mycology', 'Parasitology',
      'Medical Microbiology', 'Industrial Microbiology', 'Food Microbiology',
      'Immunology', 'Serology', 'Molecular Diagnostics',
      'Aseptic Technique', 'Culture Methods', 'Microscopy',
      'PCR', 'ELISA', 'Flow Cytometry', 'Antibiotic Sensitivity Testing',
      'Quality Control', 'Good Laboratory Practice', 'Biosafety',
    ],
    
    // Law
    law: [
      'Legal Research', 'Legal Writing', 'Case Analysis', 'Legal Drafting',
      'Contract Law', 'Corporate Law', 'Criminal Law', 'Civil Law',
      'Constitutional Law', 'International Law', 'Human Rights Law',
      'Intellectual Property Law', 'Cyber Law', 'Environmental Law',
      'Litigation', 'Mediation', 'Arbitration', 'Negotiation',
      'Legal Advocacy', 'Moot Court', 'Client Counseling',
    ],
    
    // General/Soft Skills
    general: [
      'Leadership', 'Team Management', 'Time Management', 'Problem Solving',
      'Critical Thinking', 'Analytical Skills', 'Decision Making',
      'Communication', 'Interpersonal Skills', 'Collaboration', 'Networking',
      'Presentation', 'Public Speaking', 'Storytelling',
      'Creativity', 'Innovation', 'Design Thinking',
      'Adaptability', 'Flexibility', 'Resilience', 'Stress Management',
      'Microsoft Office', 'Google Workspace', 'Email Etiquette',
      'Research', 'Documentation', 'Report Writing',
      'Event Planning', 'Volunteer Management', 'Community Engagement',
    ],
  },

  // Goals
  goals: [
    // Career Goals
    'Software Engineer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
    'Data Scientist', 'Data Analyst', 'Machine Learning Engineer', 'AI Researcher',
    'DevOps Engineer', 'Cloud Architect', 'Cybersecurity Specialist', 'Network Engineer',
    'Mobile App Developer', 'Game Developer', 'UI/UX Designer', 'Product Manager',
    
    'Electrical Engineer', 'Electronics Engineer', 'Power Systems Engineer', 'Control Systems Engineer',
    'Embedded Systems Engineer', 'IoT Engineer', 'Robotics Engineer', 'Automation Engineer',
    
    'Marketing Manager', 'Brand Manager', 'Digital Marketing Specialist', 'SEO Specialist',
    'Financial Analyst', 'Investment Banker', 'Accountant', 'Auditor', 'Tax Consultant',
    'HR Manager', 'Talent Acquisition Specialist', 'Training Manager', 'Business Analyst',
    'Operations Manager', 'Supply Chain Manager', 'Project Manager', 'Entrepreneur',
    'Management Consultant', 'Business Development Manager', 'Sales Manager',
    
    'Economist', 'Economic Researcher', 'Policy Analyst', 'Development Consultant',
    
    'Architect', 'Urban Planner', 'Interior Designer', 'Landscape Architect',
    'Construction Manager', 'BIM Specialist', 'Sustainable Design Consultant',
    
    'Content Writer', 'Technical Writer', 'Copywriter', 'Editor', 'Journalist',
    'English Teacher', 'Communications Specialist', 'Public Relations Manager',
    
    'Clinical Pharmacist', 'Hospital Pharmacist', 'Community Pharmacist',
    'Pharmaceutical Researcher', 'Regulatory Affairs Specialist', 'Quality Assurance Manager',
    
    'Biotechnology Researcher', 'Genetic Engineer', 'Bioinformatics Specialist',
    'Quality Control Analyst', 'Bioprocess Engineer', 'R&D Scientist',
    
    'Mathematician', 'Statistician', 'Data Analyst', 'Quantitative Analyst',
    'Operations Research Analyst', 'Actuary', 'Math Teacher',
    
    'Physicist', 'Research Scientist', 'Laboratory Technician', 'Science Teacher',
    
    'Microbiologist', 'Medical Laboratory Technologist', 'Quality Control Microbiologist',
    'Research Scientist', 'Food Safety Specialist',
    
    'Lawyer', 'Corporate Lawyer', 'Human Rights Lawyer', 'Legal Consultant',
    'Judge', 'Legal Researcher', 'Law Teacher',
    
    // Academic Goals
    'Pursue Masters Degree', 'Pursue PhD', 'Become a Professor', 'Conduct Research',
    'Publish Research Papers', 'Attend International Conferences',
    
    // Entrepreneurial Goals
    'Start a Tech Startup', 'Launch E-commerce Business', 'Build a SaaS Product',
    'Create a Mobile App', 'Start a Consulting Firm', 'Establish NGO',
    
    // Personal Development Goals
    'Improve Communication Skills', 'Develop Leadership Skills', 'Build Professional Network',
    'Learn New Programming Language', 'Get Industry Certifications', 'Mentor Students',
    'Contribute to Open Source', 'Speak at Conferences', 'Write Technical Blogs',
  ],

  // Interests
  interests: [
    // Technology
    'Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'Computer Vision',
    'Natural Language Processing', 'Robotics', 'Internet of Things', 'Blockchain',
    'Cybersecurity', 'Cloud Computing', 'Edge Computing', 'Quantum Computing',
    'Web Development', 'Mobile Development', 'Game Development', 'AR/VR',
    '3D Printing', 'Drones', 'Smart Cities', 'Autonomous Vehicles',
    
    // Business & Finance
    'Entrepreneurship', 'Startups', 'Venture Capital', 'Stock Market',
    'Cryptocurrency', 'FinTech', 'E-commerce', 'Digital Marketing',
    'Supply Chain Optimization', 'Business Analytics', 'Strategic Planning',
    
    // Engineering
    'Renewable Energy', 'Sustainable Technology', 'Green Buildings',
    'Electric Vehicles', 'Smart Grids', 'Power Systems',
    'Embedded Systems', 'Microcontrollers', 'PCB Design',
    'Signal Processing', 'Control Systems', 'Automation',
    
    // Science & Research
    'Genetics', 'Biotechnology', 'Nanotechnology', 'Materials Science',
    'Environmental Science', 'Climate Change', 'Bioinformatics',
    'Drug Discovery', 'Medical Research', 'Public Health',
    'Space Exploration', 'Astrophysics', 'Particle Physics',
    
    // Design & Arts
    'Architecture', 'Interior Design', 'Urban Planning', 'Landscape Design',
    'Graphic Design', 'UI/UX Design', 'Product Design', 'Industrial Design',
    'Photography', 'Videography', 'Animation', 'Digital Art',
    'Fashion Design', 'Sustainable Fashion',
    
    // Social Sciences
    'Economics', 'Public Policy', 'International Relations', 'Development Studies',
    'Psychology', 'Sociology', 'Anthropology', 'Political Science',
    'Human Rights', 'Social Justice', 'Gender Studies',
    
    // Education & Learning
    'Online Education', 'EdTech', 'Educational Psychology', 'Curriculum Development',
    'Teaching Methods', 'Language Learning', 'STEM Education',
    
    // Health & Wellness
    'Pharmaceuticals', 'Healthcare Technology', 'Telemedicine',
    'Mental Health', 'Nutrition', 'Fitness', 'Yoga', 'Meditation',
    
    // Media & Communication
    'Journalism', 'Broadcasting', 'Content Creation', 'Podcasting',
    'Video Production', 'Social Media', 'Influencer Marketing',
    'Public Relations', 'Brand Management',
    
    // Hobbies & Lifestyle
    'Reading', 'Writing', 'Blogging', 'Creative Writing', 'Poetry',
    'Music', 'Playing Instruments', 'Singing', 'Music Production',
    'Sports', 'Football', 'Cricket', 'Basketball', 'Badminton', 'Chess',
    'Travel', 'Adventure Sports', 'Hiking', 'Camping', 'Cooking',
    'Volunteering', 'Community Service', 'NGO Work', 'Environmental Activism',
    'Debate', 'Model UN', 'Drama', 'Theatre', 'Stand-up Comedy',
    'Gaming', 'E-sports', 'Game Streaming', 'Board Games',
  ],
};

// Helper function to get all skills as a flat array
export const getAllSkills = () => {
  const allSkills = [];
  Object.values(BRACU_OPTIONS.skills).forEach(categorySkills => {
    allSkills.push(...categorySkills);
  });
  return [...new Set(allSkills)].sort(); // Remove duplicates and sort
};

// Helper function to get skills by department
export const getSkillsByDepartment = (department) => {
  const deptKey = department?.toLowerCase().replace(/[^a-z]/g, '');
  return BRACU_OPTIONS.skills[deptKey] || BRACU_OPTIONS.skills.general;
};
