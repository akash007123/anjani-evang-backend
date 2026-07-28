import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Service } from '../src/models/Service.js';

function toSlug(text) {
  return text.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function rng(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const catPrices = {
  'Event Planning Services': { min: 800, max: 2000 },
  'Wedding Planning': { min: 1000, max: 2000 },
  'Engagement Ceremony': { min: 800, max: 1500 },
  'Reception Planning': { min: 800, max: 1500 },
  'Birthday Party Management': { min: 500, max: 1000 },
  'Anniversary Celebration': { min: 500, max: 1000 },
  'Baby Shower': { min: 500, max: 1000 },
  'Naming Ceremony': { min: 500, max: 1000 },
  'Housewarming (Griha Pravesh)': { min: 500, max: 1000 },
  'Religious Events (Puja, Bhajan, Yagna)': { min: 400, max: 800 },
  'Corporate Events': { min: 500, max: 2000 },
  'Product Launches': { min: 800, max: 2000 },
  'Conferences': { min: 500, max: 1500 },
  'Seminars': { min: 400, max: 1200 },
  'Annual Day Events': { min: 500, max: 1500 },
  'Award Functions': { min: 500, max: 1500 },
  'Cultural Programs': { min: 350, max: 1000 },
  'College & School Events': { min: 300, max: 800 },
  'Sports Events': { min: 300, max: 800 },
  'Government Events': { min: 500, max: 1500 },
  'Political Events': { min: 500, max: 1500 },
  'Fashion Shows': { min: 800, max: 2000 },
  'Concerts': { min: 800, max: 2000 },
  'Exhibitions & Trade Shows': { min: 500, max: 1500 },
  'Charity Events': { min: 400, max: 1000 },
  'Destination Weddings': { min: 1500, max: 3000 },
  'Catering Services': { min: 350, max: 1500 },
  'Vegetarian Catering': { min: 350, max: 800 },
  'Non-Vegetarian Catering': { min: 450, max: 1000 },
  'Jain Food Catering': { min: 400, max: 900 },
  'Vegan Catering': { min: 400, max: 900 },
  'South Indian Cuisine': { min: 300, max: 700 },
  'North Indian Cuisine': { min: 350, max: 800 },
  'Chinese Cuisine': { min: 350, max: 800 },
  'Italian Cuisine': { min: 400, max: 1000 },
  'Continental Cuisine': { min: 500, max: 1200 },
  'Mexican Cuisine': { min: 400, max: 900 },
  'Mughlai Cuisine': { min: 450, max: 1000 },
  'Gujarati Catering': { min: 300, max: 700 },
  'Rajasthani Catering': { min: 350, max: 800 },
  'Bengali Catering': { min: 350, max: 800 },
  'Maharashtrian Catering': { min: 300, max: 700 },
  'Punjabi Catering': { min: 350, max: 800 },
  'Live Food Counters': { min: 200, max: 500 },
  'BBQ & Grill': { min: 400, max: 1000 },
  'Sweet Counter': { min: 150, max: 400 },
  'Chaat Counter': { min: 150, max: 400 },
  'Mocktail Counter': { min: 150, max: 400 },
  'Dessert Counter': { min: 150, max: 400 },
  'Ice Cream Counter': { min: 100, max: 300 },
  'Bakery Services': { min: 200, max: 500 },
  'Tea & Coffee Counter': { min: 50, max: 200 },
  'Breakfast Catering': { min: 200, max: 500 },
  'Lunch Catering': { min: 300, max: 700 },
  'Dinner Catering': { min: 400, max: 1000 },
  'Corporate Meal Boxes': { min: 200, max: 500 },
  'Packed Food Services': { min: 150, max: 400 },
  'Meal Services': { min: 200, max: 700 },
  'Venue Services': { min: 500, max: 1000 },
  'Venue Booking': { min: 500, max: 1000 },
  'Banquet Hall Booking': { min: 500, max: 1000 },
  'Farmhouse Booking': { min: 800, max: 1500 },
  'Resort Booking': { min: 1000, max: 2000 },
  'Hotel Booking': { min: 1000, max: 2000 },
  'Lawn Booking': { min: 500, max: 1000 },
  'Convention Hall Booking': { min: 800, max: 1500 },
  'Outdoor Venue Booking': { min: 500, max: 1000 },
  'Tent Booking': { min: 300, max: 800 },
  'Decoration Services': { min: 200, max: 800 },
  'Stage Decoration': { min: 300, max: 800 },
  'Floral Decoration': { min: 300, max: 800 },
  'Mandap Decoration': { min: 500, max: 1500 },
  'Balloon Decoration': { min: 200, max: 500 },
  'Theme Decoration': { min: 400, max: 1000 },
  'Lighting Decoration': { min: 200, max: 600 },
  'Entrance Decoration': { min: 300, max: 800 },
  'Table Decoration': { min: 100, max: 300 },
  'Ceiling Decoration': { min: 200, max: 600 },
  'Garden Decoration': { min: 300, max: 800 },
  'Reception Decoration': { min: 400, max: 1000 },
  'Birthday Decoration': { min: 200, max: 600 },
  'Wedding Decoration': { min: 500, max: 1500 },
  'Photography & Videography': { min: 100, max: 500 },
  'Photography': { min: 200, max: 500 },
  'Videography': { min: 300, max: 600 },
  'Cinematic Wedding Film': { min: 500, max: 1000 },
  'Drone Photography': { min: 300, max: 800 },
  'Drone Videography': { min: 400, max: 800 },
  'Live Streaming': { min: 200, max: 500 },
  'LED Screen Recording': { min: 200, max: 500 },
  'Instant Photo Printing': { min: 100, max: 300 },
  'Pre-Wedding Shoot': { min: 500, max: 1000 },
  'Post-Wedding Shoot': { min: 400, max: 800 },
  'Entertainment Services': { min: 300, max: 1000 },
  'DJ': { min: 500, max: 1500 },
  'Live Band': { min: 400, max: 1000 },
  'Orchestra': { min: 500, max: 1200 },
  'Singer': { min: 300, max: 800 },
  'Dancers': { min: 200, max: 600 },
  'Celebrity Booking': { min: 2000, max: 5000 },
  'Anchor (Emcee)': { min: 300, max: 800 },
  'Magician': { min: 200, max: 500 },
  'Puppet Show': { min: 150, max: 400 },
  'Kids Entertainment': { min: 150, max: 400 },
  'Fireworks': { min: 500, max: 1500 },
  'Laser Show': { min: 500, max: 1500 },
  'Folk Dance': { min: 200, max: 600 },
  'Cultural Performance': { min: 300, max: 800 },
  'Sound & Lighting': { min: 300, max: 1000 },
  'Sound System': { min: 200, max: 600 },
  'PA System': { min: 150, max: 500 },
  'Microphones': { min: 100, max: 300 },
  'Stage Lighting': { min: 300, max: 800 },
  'LED Wall': { min: 500, max: 1500 },
  'Projector': { min: 200, max: 500 },
  'Audio Mixing': { min: 200, max: 500 },
  'Generator Backup': { min: 300, max: 800 },
  'Smoke Machine': { min: 200, max: 500 },
  'Special Effects': { min: 400, max: 1000 },
  'Wedding Management': { min: 500, max: 1500 },
  'Guest Management': { min: 200, max: 500 },
  'Invitation Management': { min: 100, max: 300 },
  'RSVP Tracking': { min: 100, max: 300 },
  'Bridal Entry': { min: 300, max: 800 },
  'Groom Entry': { min: 300, max: 800 },
  'Baraat Management': { min: 500, max: 1000 },
  'Mandap Setup': { min: 400, max: 1000 },
  'Wedding Timeline': { min: 200, max: 500 },
  'Ritual Coordination': { min: 200, max: 500 },
  'Corporate Event Services': { min: 500, max: 2000 },
  'Conference Management': { min: 500, max: 1500 },
  'Seminar Management': { min: 400, max: 1200 },
  'Training Programs': { min: 300, max: 1000 },
  'Team Building Activities': { min: 300, max: 1000 },
  'Employee Engagement': { min: 200, max: 800 },
  'Dealer Meets': { min: 500, max: 1500 },
  'Product Launch': { min: 800, max: 2000 },
  'Business Expo': { min: 500, max: 1500 },
  'Award Ceremony': { min: 500, max: 1500 },
  'Annual Meet': { min: 500, max: 1500 },
  'Invitation Services': { min: 50, max: 200 },
  'Printed Invitation Cards': { min: 50, max: 150 },
  'Digital Invitations': { min: 30, max: 100 },
  'WhatsApp Invitations': { min: 20, max: 80 },
  'Email Invitations': { min: 20, max: 80 },
  'QR Code Invitations': { min: 30, max: 100 },
  'RSVP Management': { min: 50, max: 150 },
  'Guest Registration': { min: 50, max: 150 },
  'Guest Check-in': { min: 50, max: 150 },
  'QR Code Entry': { min: 50, max: 150 },
  'VIP Guest Management': { min: 100, max: 300 },
  'Seating Arrangement': { min: 50, max: 150 },
  'Accommodation Management': { min: 100, max: 300 },
  'Welcome Kit Distribution': { min: 50, max: 150 },
  'Transport Coordination': { min: 100, max: 300 },
  'Transportation Services': { min: 100, max: 500 },
  'Guest Pickup': { min: 100, max: 300 },
  'Guest Drop': { min: 100, max: 300 },
  'Bus Booking': { min: 200, max: 500 },
  'Luxury Car Booking': { min: 500, max: 1000 },
  'Taxi Arrangement': { min: 100, max: 300 },
  'Airport Transfers': { min: 300, max: 800 },
  'Valet Parking': { min: 100, max: 300 },
  'Accommodation Services': { min: 500, max: 2000 },
  'Room Allocation': { min: 200, max: 500 },
  'Check-in Management': { min: 100, max: 300 },
  'Guest Stay Tracking': { min: 100, max: 300 },
  'Rental Services': { min: 50, max: 150 },
  'Chairs': { min: 20, max: 80 },
  'Tables': { min: 30, max: 100 },
  'Sofa': { min: 50, max: 150 },
  'Stage': { min: 100, max: 300 },
  'Tent': { min: 100, max: 300 },
  'AC Coolers': { min: 80, max: 200 },
  'Air Conditioners': { min: 100, max: 300 },
  'Generator': { min: 150, max: 400 },
  'Crockery': { min: 20, max: 60 },
  'Cutlery': { min: 10, max: 40 },
  'Glassware': { min: 15, max: 50 },
  'Linen': { min: 20, max: 60 },
  'Furniture': { min: 50, max: 150 },
  'Dance Floor': { min: 100, max: 300 },
  'Event Staffing': { min: 200, max: 800 },
  'Event Manager': { min: 500, max: 1500 },
  'Coordinator': { min: 300, max: 800 },
  'Catering Staff': { min: 200, max: 500 },
  'Waiters': { min: 150, max: 400 },
  'Chefs': { min: 400, max: 1000 },
  'Bartenders (where permitted)': { min: 300, max: 800 },
  'Housekeeping': { min: 150, max: 400 },
  'Security Guards': { min: 200, max: 500 },
  'Valet Staff': { min: 150, max: 400 },
  'Helpers': { min: 100, max: 300 },
  'Volunteers': { min: 100, max: 300 },
  'Kitchen Management': { min: 300, max: 1000 },
  'Menu Planning': { min: 200, max: 500 },
  'Recipe Management': { min: 200, max: 500 },
  'Ingredient Management': { min: 150, max: 400 },
  'Food Cost Calculation': { min: 150, max: 400 },
  'Kitchen Production': { min: 300, max: 800 },
  'Waste Management': { min: 100, max: 300 },
  'Quality Control': { min: 200, max: 500 },
  'Additional Value-Added Services': { min: 200, max: 800 },
  'Mehendi Artists': { min: 300, max: 800 },
  'Makeup Artists': { min: 500, max: 1500 },
  'Hair Stylists': { min: 400, max: 1000 },
  'Bridal Dressing': { min: 500, max: 1500 },
  'Return Gifts': { min: 100, max: 300 },
  'Gift Packaging': { min: 50, max: 150 },
  'Chocolate Counter': { min: 150, max: 400 },
  'Fruit Counter': { min: 100, max: 300 },
  'Live Cooking Stations': { min: 300, max: 800 },
  'Coffee Bar': { min: 100, max: 300 },
  'Tea Stall': { min: 50, max: 200 },
  'Kids Play Zone': { min: 200, max: 500 },
  'Photo Booth': { min: 200, max: 500 },
  'Selfie Point': { min: 150, max: 400 },
  'LED Dance Floor': { min: 300, max: 800 },
  'Fire Safety': { min: 100, max: 300 },
  'Event Insurance': { min: 100, max: 300 },
  'Security Services': { min: 200, max: 500 },
  'Sanitization Services': { min: 100, max: 300 }
};

const featuredServices = new Set([
  'Wedding Planning', 'Engagement Ceremony', 'Reception Planning', 'Birthday Party Management',
  'Vegetarian Catering', 'Non-Vegetarian Catering', 'Venue Booking', 'Stage Decoration',
  'Floral Decoration', 'Photography', 'Videography', 'DJ', 'Live Band', 'Sound System',
  'Wedding Decoration', 'Destination Weddings', 'Conferences', 'Product Launches',
  'Tent Booking', 'Lighting Decoration', 'Mandap Decoration', 'Theme Decoration',
  'Live Food Counters', 'BBQ & Grill', 'Sweet Counter', 'Chaat Counter',
  'Event Manager', 'Menu Planning', 'Bridal Dressing', 'Cinematic Wedding Film',
  'Baraat Management', 'Luxury Car Booking', 'Pre-Wedding Shoot', 'Fireworks',
  'Laser Show', 'Celebrity Booking', 'North Indian Cuisine', 'Continental Cuisine'
]);

const shortDescTemplates = {
  'Event Planning Services': (t) => `Professional ${t.toLowerCase()} services for unforgettable events.`,
  'Wedding Planning': (t) => `Comprehensive ${t.toLowerCase()} tailored to your vision and budget.`,
  'Engagement Ceremony': () => `Beautiful engagement ceremony planning with personalized themes and seamless execution.`,
  'Reception Planning': () => `Grand reception planning with exquisite decor, entertainment, and gourmet catering.`,
  'Birthday Party Management': () => `Creative birthday party management for all ages with custom themes and entertainment.`,
  'Anniversary Celebration': () => `Elegant anniversary celebration services to honor your special milestone.`,
  'Baby Shower': () => `Charming baby shower arrangements with themed decor, games, and refreshments.`,
  'Naming Ceremony': () => `Traditional naming ceremony coordination with religious rituals and family gatherings.`,
  'Housewarming (Griha Pravesh)': () => `Blessings and celebrations with complete housewarming event management.`,
  'Religious Events (Puja, Bhajan, Yagna)': () => `Sacred religious event arrangements including puja, bhajan, and yagna ceremonies.`,
  'Meal Services': (t) => `Convenient and delicious ${t.toLowerCase()} for events of all sizes.`,
  default: (t) => `Expert ${t.toLowerCase()} services by Anjani Catering & Events.`,
};

function genShortDesc(category, title) {
  const fn = shortDescTemplates[title] || shortDescTemplates[category] || shortDescTemplates.default;
  return fn(title);
}

function genFullDesc(category, title) {
  const base = `At Anjani Catering & Events, we specialize in delivering exceptional ${category.toLowerCase()} tailored to your unique requirements. Our ${title.toLowerCase()} service is designed to provide a seamless and memorable experience for you and your guests.`;
  const mid = `With years of expertise in the Indian events industry, our dedicated team ensures every detail is meticulously planned and executed. From conceptualization to execution, we bring creativity, precision, and passion to every project we undertake.`;
  const close = `We pride ourselves on using the finest resources, professional staff, and innovative techniques to deliver results that exceed expectations. Whether it's an intimate gathering or a large-scale celebration, our ${title.toLowerCase()} service is crafted to perfection. Contact Anjani Catering & Events to discuss your requirements and let us create something extraordinary together.`;
  return `${base}\n\n${mid}\n\n${close}`;
}

function genSeoTitle(category, title) {
  return `${title} | ${category} | Anjani Catering & Events`;
}

function genSeoDescription(category, title) {
  return `Professional ${title.toLowerCase()} services by Anjani Catering & Events. Expert ${category.toLowerCase()} for events in Chhatarpur and across India. Contact us for customized ${title.toLowerCase()} solutions.`;
}

function genSeoKeywords(title, category) {
  const kw = new Set();
  kw.add(title.toLowerCase());
  kw.add(`${title.toLowerCase()} services`);
  kw.add(`${title.toLowerCase()} near me`);
  kw.add(`${category.toLowerCase().replace(/ & /g, ' ')}`);
  kw.add(`Anjani Catering & Events`);
  kw.add(`event management company`);
  kw.add(`catering services`);
  kw.add(`event planning`);
  kw.add(`${title.toLowerCase()} in Chhatarpur`);
  kw.add(`${title.toLowerCase()} in MP`);
  return [...kw];
}

function getPrice(category, title) {
  const entry = catPrices[title] || catPrices[category] || { min: 300, max: 1000 };
  return rng(entry.min, entry.max);
}

function getImagePath(slug) {
  return `/uploads/services/${slug}.webp`;
}

function isFeatured(title) {
  return featuredServices.has(title);
}

function getDisplayOrder(category, index) {
  return (index + 1) * 10;
}

const serviceCategories = {
  'Event Planning Services': [
    'Wedding Planning',
    'Engagement Ceremony',
    'Reception Planning',
    'Birthday Party Management',
    'Anniversary Celebration',
    'Baby Shower',
    'Naming Ceremony',
    'Housewarming (Griha Pravesh)',
    'Religious Events (Puja, Bhajan, Yagna)'
  ],
  'Corporate Events': [
    'Product Launches',
    'Conferences',
    'Seminars',
    'Annual Day Events',
    'Award Functions',
    'Cultural Programs',
    'College & School Events',
    'Sports Events',
    'Government Events',
    'Political Events',
    'Fashion Shows',
    'Concerts',
    'Exhibitions & Trade Shows',
    'Charity Events',
    'Destination Weddings'
  ],
  'Catering Services': [
    'Vegetarian Catering',
    'Non-Vegetarian Catering',
    'Jain Food Catering',
    'Vegan Catering',
    'South Indian Cuisine',
    'North Indian Cuisine',
    'Chinese Cuisine',
    'Italian Cuisine',
    'Continental Cuisine',
    'Mexican Cuisine',
    'Mughlai Cuisine',
    'Gujarati Catering',
    'Rajasthani Catering',
    'Bengali Catering',
    'Maharashtrian Catering',
    'Punjabi Catering'
  ],
  'Live Food Counters': [
    'Live Food Counters',
    'BBQ & Grill',
    'Sweet Counter',
    'Chaat Counter',
    'Mocktail Counter',
    'Dessert Counter',
    'Ice Cream Counter',
    'Bakery Services',
    'Tea & Coffee Counter'
  ],
  'Meal Services': [
    'Breakfast Catering',
    'Lunch Catering',
    'Dinner Catering',
    'Corporate Meal Boxes',
    'Packed Food Services'
  ],
  'Venue Services': [
    'Venue Booking',
    'Banquet Hall Booking',
    'Farmhouse Booking',
    'Resort Booking',
    'Hotel Booking',
    'Lawn Booking',
    'Convention Hall Booking',
    'Outdoor Venue Booking',
    'Tent Booking'
  ],
  'Decoration Services': [
    'Stage Decoration',
    'Floral Decoration',
    'Mandap Decoration',
    'Balloon Decoration',
    'Theme Decoration',
    'Lighting Decoration',
    'Entrance Decoration',
    'Table Decoration',
    'Ceiling Decoration',
    'Garden Decoration',
    'Reception Decoration',
    'Birthday Decoration',
    'Wedding Decoration'
  ],
  'Photography & Videography': [
    'Photography',
    'Videography',
    'Cinematic Wedding Film',
    'Drone Photography',
    'Drone Videography',
    'Live Streaming',
    'LED Screen Recording',
    'Instant Photo Printing',
    'Pre-Wedding Shoot',
    'Post-Wedding Shoot'
  ],
  'Entertainment Services': [
    'DJ',
    'Live Band',
    'Orchestra',
    'Singer',
    'Dancers',
    'Celebrity Booking',
    'Anchor (Emcee)',
    'Magician',
    'Puppet Show',
    'Kids Entertainment',
    'Fireworks',
    'Laser Show',
    'Folk Dance',
    'Cultural Performance'
  ],
  'Sound & Lighting': [
    'Sound System',
    'PA System',
    'Microphones',
    'Stage Lighting',
    'LED Wall',
    'Projector',
    'Audio Mixing',
    'Generator Backup',
    'Smoke Machine',
    'Special Effects'
  ],
  'Wedding Management': [
    'Wedding Planning',
    'Guest Management',
    'Invitation Management',
    'RSVP Tracking',
    'Bridal Entry',
    'Groom Entry',
    'Baraat Management',
    'Mandap Setup',
    'Wedding Timeline',
    'Ritual Coordination'
  ],
  'Corporate Event Services': [
    'Conference Management',
    'Seminar Management',
    'Training Programs',
    'Team Building Activities',
    'Employee Engagement',
    'Dealer Meets',
    'Product Launch',
    'Business Expo',
    'Award Ceremony',
    'Annual Meet'
  ],
  'Invitation Services': [
    'Printed Invitation Cards',
    'Digital Invitations',
    'WhatsApp Invitations',
    'Email Invitations',
    'QR Code Invitations'
  ],
  'Guest Management': [
    'RSVP Management',
    'Guest Registration',
    'Guest Check-in',
    'QR Code Entry',
    'VIP Guest Management',
    'Seating Arrangement',
    'Accommodation Management',
    'Welcome Kit Distribution',
    'Transport Coordination'
  ],
  'Transportation Services': [
    'Guest Pickup',
    'Guest Drop',
    'Bus Booking',
    'Luxury Car Booking',
    'Taxi Arrangement',
    'Airport Transfers',
    'Valet Parking'
  ],
  'Accommodation Services': [
    'Hotel Booking',
    'Room Allocation',
    'Check-in Management',
    'Guest Stay Tracking'
  ],
  'Rental Services': [
    'Chairs',
    'Tables',
    'Sofa',
    'Stage',
    'Tent',
    'AC Coolers',
    'Air Conditioners',
    'Generator',
    'Crockery',
    'Cutlery',
    'Glassware',
    'Linen',
    'Furniture',
    'Dance Floor'
  ],
  'Event Staffing': [
    'Event Manager',
    'Coordinator',
    'Catering Staff',
    'Waiters',
    'Chefs',
    'Bartenders (where permitted)',
    'Housekeeping',
    'Security Guards',
    'Valet Staff',
    'Helpers',
    'Volunteers'
  ],
  'Kitchen Management': [
    'Menu Planning',
    'Recipe Management',
    'Ingredient Management',
    'Food Cost Calculation',
    'Kitchen Production',
    'Waste Management',
    'Quality Control'
  ],
  'Additional Value-Added Services': [
    'Mehendi Artists',
    'Makeup Artists',
    'Hair Stylists',
    'Bridal Dressing',
    'Return Gifts',
    'Gift Packaging',
    'Chocolate Counter',
    'Fruit Counter',
    'Live Cooking Stations',
    'Coffee Bar',
    'Tea Stall',
    'Kids Play Zone',
    'Photo Booth',
    'Selfie Point',
    'LED Dance Floor',
    'Fire Safety',
    'Event Insurance',
    'Security Services',
    'Sanitization Services'
  ]
};

async function seedServices() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB\n');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }

  let inserted = 0;
  let skipped = 0;

  const seenSlugs = new Set();

  for (const [category, services] of Object.entries(serviceCategories)) {
    for (let i = 0; i < services.length; i++) {
      const title = services[i];
      const slug = toSlug(title);

      if (seenSlugs.has(slug)) continue;
      seenSlugs.add(slug);

      const existing = await Service.findOne({ slug });
      if (existing) {
        skipped++;
        continue;
      }

      const shortDescription = genShortDesc(category, title);
      const fullDescription = genFullDesc(category, title);
      const seoTitle = genSeoTitle(category, title);
      const seoDescription = genSeoDescription(category, title);
      const seoKeywords = genSeoKeywords(title, category);

      await Service.create({
        title,
        slug,
        shortDescription,
        fullDescription,
        pricePerGuest: getPrice(category, title),
        minGuests: 10,
        image: getImagePath(slug),
        icon: getImagePath(slug),
        category,
        featured: isFeatured(title),
        active: true,
        displayOrder: getDisplayOrder(category, i),
        seoTitle,
        seoDescription,
        seoKeywords
      });

      inserted++;
    }
  }

  console.log(`\nSeed Summary:`);
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Skipped:  ${skipped}`);
  console.log(`  Total:    ${inserted + skipped}\n`);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
  process.exit(0);
}

seedServices();
