const seedTranslations = async () => {
  const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
  
  if (!ACCESS_TOKEN) {
    console.error('Please provide ACCESS_TOKEN as an environment variable');
    process.exit(1);
  }

  try {
    const response = await fetch('http://localhost:3000/api/v1/translations/seed', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error seeding translations:', error);
    process.exit(1);
  }
};

seedTranslations(); 