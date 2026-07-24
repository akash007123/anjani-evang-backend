import { Notification } from '../models/Notification.js';

/**
 * Initial seed notifications for rich admin demonstration & instant fallback
 */
export let inMemoryNotifications = [
  {
    _id: 'notif-101',
    id: 'notif-101',
    title: '📅 New Booking Received',
    message: 'Rahul Sharma submitted a wedding catering booking request for 250 guests on Aug 15, 2026.',
    type: 'Booking',
    icon: 'Calendar',
    priority: 'High',
    recipientRoles: ['Super Admin', 'Admin', 'Manager'],
    relatedModule: 'Booking',
    relatedRecordId: 'EVG-84920',
    readStatus: false,
    readBy: [],
    actionUrl: '/admin/bookings',
    createdBy: 'Booking Form',
    isDeleted: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 mins ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString()
  },
  {
    _id: 'notif-102',
    id: 'notif-102',
    title: '📩 New Contact Inquiry',
    message: 'Priya Patel sent an inquiry regarding corporate gala lunch platters.',
    type: 'Contact',
    icon: 'Mail',
    priority: 'Medium',
    recipientRoles: ['Super Admin', 'Admin', 'Manager'],
    relatedModule: 'Contact',
    relatedRecordId: 'cnt-201',
    readStatus: false,
    readBy: [],
    actionUrl: '/admin/contacts',
    createdBy: 'Contact Form',
    isDeleted: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    _id: 'notif-103',
    id: 'notif-103',
    title: '🤖 AI Chatbot Booking Request',
    message: 'Amit Verma requested an instant sangeet catering quote via AI Concierge for ₹2,50,000 budget.',
    type: 'Chatbot',
    icon: 'Bot',
    priority: 'High',
    recipientRoles: ['Super Admin', 'Admin', 'Manager'],
    relatedModule: 'Chatbot',
    relatedRecordId: 'chat-901',
    readStatus: false,
    readBy: [],
    actionUrl: '/admin/bookings',
    createdBy: 'AI Concierge',
    isDeleted: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  },
  {
    _id: 'notif-104',
    id: 'notif-104',
    title: '🛒 New Catering Order Placed',
    message: 'Victoria Sterling ordered Truffle Glazed Tenderloin Platters for $900.',
    type: 'Order',
    icon: 'ShoppingCart',
    priority: 'High',
    recipientRoles: ['Super Admin', 'Admin', 'Manager'],
    relatedModule: 'Order',
    relatedRecordId: 'ORD-9021',
    readStatus: true,
    readBy: ['admin@evengcatering.com'],
    actionUrl: '/admin/orders',
    createdBy: 'Checkout',
    isDeleted: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  },
  {
    _id: 'notif-105',
    id: 'notif-105',
    title: '✉️ New Newsletter Subscriber',
    message: 'samantha.t@gmail.com subscribed to seasonal menu updates.',
    type: 'Newsletter',
    icon: 'Send',
    priority: 'Low',
    recipientRoles: ['Super Admin', 'Admin', 'Manager'],
    relatedModule: 'Newsletter',
    relatedRecordId: 'sub-1',
    readStatus: true,
    readBy: ['admin@evengcatering.com'],
    actionUrl: '/admin/newsletter',
    createdBy: 'Website Footer',
    isDeleted: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  }
];

/**
 * Reusable helper to dispatch and persist a new notification across the system
 */
export async function createNotificationHelper({
  title,
  message,
  type = 'System',
  icon = 'Bell',
  priority = 'Medium',
  recipientRoles = ['Super Admin', 'Admin', 'Manager'],
  relatedModule = 'Other',
  relatedRecordId = '',
  actionUrl = '/admin/dashboard',
  createdBy = 'System'
}) {
  const notifObj = {
    _id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title,
    message,
    type,
    icon,
    priority,
    recipientRoles,
    relatedModule,
    relatedRecordId,
    readStatus: false,
    readBy: [],
    actionUrl,
    createdBy,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    // Attempt Mongoose DB creation
    await Notification.create({
      ...notifObj,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (err) {
    // Silently fallback to in-memory list
  }

  // Prepend to in-memory list so instant polling returns it immediately
  inMemoryNotifications.unshift(notifObj);
  console.log(`🔔 [Notification System] New ${type} Notification Created: "${title}"`);
  return notifObj;
}

/**
 * Filter and search in-memory notifications
 */
export function getInMemoryNotificationsFiltered({
  search = '',
  type = '',
  priority = '',
  readStatus = '',
  startDate = '',
  endDate = '',
  sortBy = 'latest',
  page = 1,
  limit = 10
}) {
  let list = inMemoryNotifications.filter(n => !n.isDeleted);

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.message.toLowerCase().includes(q) ||
      n.type.toLowerCase().includes(q) ||
      (n.relatedRecordId && n.relatedRecordId.toLowerCase().includes(q))
    );
  }

  if (type) {
    list = list.filter(n => n.type.toLowerCase() === type.toLowerCase());
  }

  if (priority) {
    list = list.filter(n => n.priority.toLowerCase() === priority.toLowerCase());
  }

  if (readStatus !== '' && readStatus !== undefined && readStatus !== null) {
    const isRead = String(readStatus) === 'true' || readStatus === true;
    list = list.filter(n => n.readStatus === isRead);
  }

  if (startDate) {
    const startMs = new Date(startDate).getTime();
    if (!isNaN(startMs)) {
      list = list.filter(n => new Date(n.createdAt).getTime() >= startMs);
    }
  }

  if (endDate) {
    const endMs = new Date(endDate).getTime() + 86400000; // Include end day
    if (!isNaN(endMs)) {
      list = list.filter(n => new Date(n.createdAt).getTime() <= endMs);
    }
  }

  // Sorting
  if (sortBy === 'oldest') {
    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else if (sortBy === 'priority') {
    const pWeight = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    list.sort((a, b) => (pWeight[b.priority] || 0) - (pWeight[a.priority] || 0));
  } else if (sortBy === 'type') {
    list.sort((a, b) => a.type.localeCompare(b.type));
  } else {
    // Default 'latest'
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const total = list.length;
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const totalPages = Math.ceil(total / limitNum) || 1;
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedItems = list.slice(startIndex, startIndex + limitNum);

  return {
    notifications: paginatedItems,
    total,
    page: pageNum,
    totalPages,
    unreadCount: list.filter(n => !n.readStatus).length
  };
}
