import { Newsletter } from '../models/Newsletter.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { createNotificationHelper } from '../utils/notificationService.js';

let inMemorySubscribers = [
  {
    _id: 'sub-1',
    id: 'sub-1',
    email: 'samantha.t@gmail.com',
    subscribedAt: new Date('2026-07-15').toISOString(),
    status: 'Active',
    source: 'Website Footer'
  },
  {
    _id: 'sub-2',
    id: 'sub-2',
    email: 'mbrody@oracle.com',
    subscribedAt: new Date('2026-07-16').toISOString(),
    status: 'Active',
    source: 'Quote Popup'
  },
  {
    _id: 'sub-3',
    id: 'sub-3',
    email: 'elena.ros@yahoo.com',
    subscribedAt: new Date('2026-07-18').toISOString(),
    status: 'Active',
    source: 'Menu Download'
  },
  {
    _id: 'sub-4',
    id: 'sub-4',
    email: 'rahul.kapoor@techcorp.io',
    subscribedAt: new Date('2026-07-19').toISOString(),
    status: 'Inactive',
    source: 'Website Footer'
  },
  {
    _id: 'sub-5',
    id: 'sub-5',
    email: 'priya.sharma@gmail.com',
    subscribedAt: new Date('2026-07-20').toISOString(),
    status: 'Active',
    source: 'Checkout Banner'
  }
];

export const getSubscribers = async (req, res, next) => {
  try {
    const { search, status, source, page = 1, limit = 10 } = req.query;

    let items = [];
    try {
      items = await Newsletter.find().lean();
    } catch (e) {
      items = [];
    }
    if (!items || items.length === 0) {
      items = [...inMemorySubscribers];
    }

    if (search) {
      const q = String(search).toLowerCase();
      items = items.filter(s => s.email && s.email.toLowerCase().includes(q));
    }

    if (status && status !== 'All') {
      items = items.filter(s => s.status === status);
    }

    if (source && source !== 'All') {
      items = items.filter(s => s.source === source);
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const total = items.length;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const paginatedItems = items.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.status(200).json(new ApiResponse(200, {
      subscribers: paginatedItems,
      total,
      page: pageNum,
      totalPages
    }, 'Newsletter subscribers retrieved'));
  } catch (error) {
    next(error);
  }
};

export const subscribeNewsletter = async (req, res, next) => {
  try {
    const { email, source } = req.body;
    if (!email) {
      return res.status(400).json(new ApiResponse(400, null, 'Email is required'));
    }

    const newSub = {
      _id: `sub-${Date.now()}`,
      id: `sub-${Date.now()}`,
      email,
      subscribedAt: new Date().toISOString(),
      status: 'Active',
      source: source || 'Website Footer'
    };

    try {
      await Newsletter.create(newSub);
    } catch (e) {
      // Fallback
    }

    const existingIndex = inMemorySubscribers.findIndex(s => s.email.toLowerCase() === email.toLowerCase());
    if (existingIndex !== -1) {
      inMemorySubscribers[existingIndex].status = 'Active';
    } else {
      inMemorySubscribers.unshift(newSub);
    }

    // Trigger admin notification asynchronously
    createNotificationHelper({
      title: '✉️ New Newsletter Subscriber',
      message: `New subscriber joined: ${newSub.email} (${newSub.source || 'Website'}).`,
      type: 'Newsletter',
      icon: 'Send',
      priority: 'Low',
      relatedModule: 'Newsletter',
      relatedRecordId: newSub._id,
      actionUrl: '/admin/newsletter',
      createdBy: 'Newsletter Form'
    }).catch(err => console.error('Newsletter notification creation error:', err));

    return res.status(201).json(new ApiResponse(201, newSub, 'Subscribed successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateSubscriberStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    let updated = null;
    try {
      updated = await Newsletter.findByIdAndUpdate(id, { status }, { new: true }).lean();
    } catch (e) {
      updated = null;
    }

    const index = inMemorySubscribers.findIndex(s => s._id === id || s.id === id);
    if (index !== -1) {
      inMemorySubscribers[index].status = status;
      updated = inMemorySubscribers[index];
    }

    if (!updated) {
      return res.status(404).json(new ApiResponse(404, null, 'Subscriber not found'));
    }

    return res.status(200).json(new ApiResponse(200, updated, 'Subscriber status updated'));
  } catch (error) {
    next(error);
  }
};

export const deleteSubscriber = async (req, res, next) => {
  try {
    const { id } = req.params;
    try {
      await Newsletter.findByIdAndDelete(id);
    } catch (e) {
      // Fallback
    }
    inMemorySubscribers = inMemorySubscribers.filter(s => s._id !== id && s.id !== id);

    return res.status(200).json(new ApiResponse(200, { id }, 'Subscriber deleted successfully'));
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteSubscribers = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json(new ApiResponse(400, null, 'ids array is required'));
    }

    try {
      await Newsletter.deleteMany({ _id: { $in: ids } });
    } catch (e) {
      // Fallback
    }

    inMemorySubscribers = inMemorySubscribers.filter(s => !ids.includes(s._id) && !ids.includes(s.id));

    return res.status(200).json(new ApiResponse(200, { deletedCount: ids.length }, 'Subscribers deleted successfully'));
  } catch (error) {
    next(error);
  }
};

export const exportSubscribersCSV = async (req, res, next) => {
  try {
    let items = [...inMemorySubscribers];
    let csv = 'Email,Subscription Date,Status,Source\n';
    items.forEach(s => {
      csv += `"${s.email}","${s.subscribedAt}","${s.status}","${s.source}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=newsletter_subscribers.csv');
    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};
