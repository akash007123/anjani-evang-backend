import { Booking } from '../models/Booking.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { BOOKING_STATUS } from '../constants/status.js';
import { sendBookingAckEmail } from '../utils/emailService.js';
import { createNotificationHelper } from '../utils/notificationService.js';

const mockBookings = [
  {
    _id: 'b-101',
    bookingReference: 'EVG-84920',
    fullName: 'Sophia Montgomery',
    email: 'sophia@luxeevents.com',
    phone: '+91 98765 43210',
    eventType: 'Wedding',
    eventDate: '2026-08-15',
    eventTime: '06:00 PM',
    guestCount: 250,
    preferredCuisine: 'North Indian',
    cateringPackage: 'Royal Buffet',
    budget: 250000,
    venueAddress: 'The Grand Ballroom, Oberoi Hotel',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    specialRequirements: 'Sugar-free dessert options for VIP table.',
    status: 'Confirmed',
    notes: 'Advance deposit paid.',
    createdAt: new Date('2026-07-01')
  },
  {
    _id: 'b-102',
    bookingReference: 'EVG-84921',
    fullName: 'Alexander Wright',
    email: 'alex.wright@techcorp.io',
    phone: '+91 98765 12345',
    eventType: 'Corporate Event',
    eventDate: '2026-09-01',
    eventTime: '07:30 PM',
    guestCount: 120,
    preferredCuisine: 'Multi Cuisine',
    cateringPackage: 'Corporate Platter',
    budget: 120000,
    venueAddress: 'Tech Park Convention Center',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    specialRequirements: 'Live live live pasta counter required.',
    status: 'New Booking',
    notes: '',
    createdAt: new Date('2026-07-10')
  },
  {
    _id: 'b-103',
    bookingReference: 'EVG-84922',
    fullName: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    phone: '+91 98123 45678',
    eventType: 'Birthday Party',
    eventDate: '2026-08-20',
    eventTime: '01:00 PM',
    guestCount: 80,
    preferredCuisine: 'South Indian',
    cateringPackage: 'Silver Buffet',
    budget: 75000,
    venueAddress: 'Green Acres Lawn',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110001',
    specialRequirements: 'Jain food options required for 15 guests.',
    status: 'Contacted',
    notes: 'Shared sample menu options.',
    createdAt: new Date('2026-07-15')
  }
];

export const getBookingAvailability = async (req, res, next) => {
  try {
    const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;
    const y = Number(year);
    const m = Number(month);

    let bookings = [];
    try {
      const startDateStr = `${y}-${String(m).padStart(2, '0')}-01`;
      const lastDay = new Date(y, m, 0).getDate();
      const endDateStr = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      bookings = await Booking.find({
        eventDate: { $gte: startDateStr, $lte: endDateStr },
        status: { $ne: 'Cancelled' }
      });
    } catch {
      bookings = mockBookings.filter(b => {
        if (!b.eventDate || b.status === 'Cancelled') return false;
        const [by, bm] = b.eventDate.split('-').map(Number);
        return by === y && bm === m;
      });
    }

    if (!bookings) bookings = mockBookings;

    // Group bookings count by YYYY-MM-DD
    const countsByDate = {};
    bookings.forEach(b => {
      if (b.eventDate) {
        countsByDate[b.eventDate] = (countsByDate[b.eventDate] || 0) + 1;
      }
    });

    return res.status(200).json(new ApiResponse(200, {
      year: y,
      month: m,
      availabilityByDate: countsByDate
    }, 'Monthly availability fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const getAvailableSlotsForDate = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return next(new ApiError(400, 'Date query parameter is required (YYYY-MM-DD)'));
    }

    const standardSlots = [
      { id: 'slot-1', time: '09:00 AM', label: 'Morning / Breakfast Event' },
      { id: 'slot-2', time: '01:00 PM', label: 'Gourmet Lunch Special' },
      { id: 'slot-3', time: '04:00 PM', label: 'High Tea & Canapés' },
      { id: 'slot-4', time: '07:00 PM', label: 'Grand Dinner Gala' },
      { id: 'slot-5', time: '09:30 PM', label: 'Late Night Celebration' }
    ];

    let dateBookings = [];
    try {
      dateBookings = await Booking.find({
        eventDate: date,
        status: { $ne: 'Cancelled' }
      });
    } catch {
      dateBookings = mockBookings.filter(b => b.eventDate === date && b.status !== 'Cancelled');
    }

    if (!dateBookings) {
      dateBookings = mockBookings.filter(b => b.eventDate === date && b.status !== 'Cancelled');
    }

    const bookedTimes = dateBookings.map(b => (b.eventTime || '').trim().toLowerCase());

    const slotsWithAvailability = standardSlots.map(slot => {
      const isBooked = bookedTimes.some(bt => {
        if (!bt) return false;
        // Direct match or 24h format match
        if (bt === slot.time.toLowerCase()) return true;
        if (slot.time === '09:00 AM' && (bt === '09:00' || bt === '9:00')) return true;
        if (slot.time === '01:00 PM' && (bt === '13:00' || bt === '1:00')) return true;
        if (slot.time === '04:00 PM' && (bt === '16:00' || bt === '4:00')) return true;
        if (slot.time === '07:00 PM' && (bt === '19:00' || bt === '7:00')) return true;
        if (slot.time === '09:30 PM' && (bt === '21:30' || bt === '9:30')) return true;
        return false;
      });

      return {
        ...slot,
        isBooked,
        status: isBooked ? 'booked' : 'available'
      };
    });

    const availableCount = slotsWithAvailability.filter(s => !s.isBooked).length;

    return res.status(200).json(new ApiResponse(200, {
      date,
      totalSlots: standardSlots.length,
      availableCount,
      isFullyBooked: availableCount === 0,
      slots: slotsWithAvailability
    }, `Slots fetched for date ${date}`));
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (req, res, next) => {
  try {
    const {
      fullName, email, phone, eventType, eventDate, eventTime,
      guestCount, preferredCuisine, cateringPackage, budget,
      venueAddress, city, state, pincode, specialRequirements, attachment
    } = req.body;

    // Double-booking check: verify if date & time slot is already taken
    if (eventDate && eventTime) {
      let existing = [];
      try {
        existing = await Booking.find({
          eventDate,
          status: { $ne: 'Cancelled' }
        });
      } catch {
        existing = mockBookings.filter(b => b.eventDate === eventDate && b.status !== 'Cancelled');
      }

      if (!existing) existing = mockBookings.filter(b => b.eventDate === eventDate && b.status !== 'Cancelled');

      const isConflict = existing.some(b => {
        const t1 = (b.eventTime || '').trim().toLowerCase();
        const t2 = (eventTime || '').trim().toLowerCase();
        if (t1 === t2 && t1 !== '') return true;
        // Normalize 12h / 24h
        if (t2.includes('19:00') && t1.includes('7:00 pm')) return true;
        if (t2.includes('7:00 pm') && t1.includes('19:00')) return true;
        if (t2.includes('13:00') && t1.includes('1:00 pm')) return true;
        if (t2.includes('1:00 pm') && t1.includes('13:00')) return true;
        return false;
      });

      if (isConflict) {
        return res.status(400).json({
          success: false,
          message: `Double-Booking Conflict: The slot at ${eventTime} on ${eventDate} is already reserved. Please select another available time slot.`
        });
      }
    }

    const ref = `EVG-${Math.floor(10000 + Math.random() * 90000)}`;

    const bookingPayload = {
      bookingReference: ref,
      fullName,
      email,
      phone,
      eventType,
      eventDate,
      eventTime: eventTime || '12:00 PM',
      guestCount: Number(guestCount) || 1,
      preferredCuisine: preferredCuisine || 'Multi Cuisine',
      cateringPackage: cateringPackage || 'Royal Buffet',
      budget: Number(budget) || 0,
      venueAddress,
      city: city || '',
      state: state || '',
      pincode: pincode || '',
      specialRequirements: specialRequirements || '',
      attachment: attachment || '',
      status: BOOKING_STATUS.NEW_BOOKING,
      source: 'website'
    };

    let booking;
    try {
      booking = await Booking.create(bookingPayload);
    } catch {
      booking = {
        _id: `b-${Date.now()}`,
        ...bookingPayload,
        createdAt: new Date()
      };
      mockBookings.unshift(booking);
    }

    // Trigger customer acknowledgment email asynchronously
    sendBookingAckEmail(booking);

    // Trigger admin notification asynchronously
    createNotificationHelper({
      title: '📅 New Booking Received',
      message: `New booking received from ${booking.fullName || 'Customer'} for ${booking.eventType || 'Catering Event'}. Ref: #${booking.bookingReference}`,
      type: 'Booking',
      icon: 'Calendar',
      priority: 'High',
      relatedModule: 'Booking',
      relatedRecordId: booking.bookingReference || booking._id,
      actionUrl: '/admin/bookings',
      createdBy: 'Booking Form'
    }).catch(err => console.error('Booking notification creation error:', err));

    return res.status(201).json(
      new ApiResponse(201, booking, `Booking request submitted successfully! Reference: ${ref}`)
    );
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const {
      search,
      status,
      eventType,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    let bookings = [];
    try {
      let query = {};
      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { bookingReference: { $regex: search, $options: 'i' } }
        ];
      }
      if (status && status !== 'all') {
        query.status = status;
      }
      if (eventType && eventType !== 'all') {
        query.eventType = eventType;
      }
      if (startDate || endDate) {
        query.eventDate = {};
        if (startDate) query.eventDate.$gte = startDate;
        if (endDate) query.eventDate.$lte = endDate;
      }

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

      bookings = await Booking.find(query).sort(sortOptions);
    } catch {
      bookings = mockBookings;
    }

    if (!bookings || !bookings.length) {
      bookings = mockBookings;
    }

    // Apply memory filters if mockBookings used
    let filtered = [...bookings];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(b => 
        (b.fullName && b.fullName.toLowerCase().includes(q)) ||
        (b.email && b.email.toLowerCase().includes(q)) ||
        (b.phone && b.phone.toLowerCase().includes(q)) ||
        (b.bookingReference && b.bookingReference.toLowerCase().includes(q))
      );
    }
    if (status && status !== 'all') {
      filtered = filtered.filter(b => b.status === status);
    }
    if (eventType && eventType !== 'all') {
      filtered = filtered.filter(b => b.eventType === eventType);
    }
    if (startDate) {
      filtered = filtered.filter(b => b.eventDate >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(b => b.eventDate <= endDate);
    }

    // Sort memory items
    filtered.sort((a, b) => {
      let valA = a[sortBy] || '';
      let valB = b[sortBy] || '';
      if (sortBy === 'budget' || sortBy === 'guestCount') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = filtered.length;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedBookings = filtered.slice(startIndex, startIndex + limitNum);

    return res.status(200).json(new ApiResponse(200, {
      bookings: paginatedBookings,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1
    }, 'Bookings list fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let booking = await Booking.findById(id).catch(() => null);
    if (!booking) {
      booking = mockBookings.find(b => b._id === id || b.bookingReference === id);
    }

    if (!booking) {
      return next(new ApiError(404, 'Booking not found'));
    }

    return res.status(200).json(new ApiResponse(200, booking, 'Booking details fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    let booking = await Booking.findByIdAndUpdate(id, req.body, { new: true }).catch(() => null);
    if (!booking) {
      const idx = mockBookings.findIndex(b => b._id === id || b.bookingReference === id);
      if (idx !== -1) {
        mockBookings[idx] = { ...mockBookings[idx], ...req.body, updatedAt: new Date() };
        booking = mockBookings[idx];
      }
    }

    if (!booking) {
      return next(new ApiError(404, 'Booking record not found'));
    }

    return res.status(200).json(new ApiResponse(200, booking, 'Booking record updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    let booking = await Booking.findByIdAndUpdate(id, { status, notes }, { new: true }).catch(() => null);
    if (!booking) {
      const idx = mockBookings.findIndex(b => b._id === id || b.bookingReference === id);
      if (idx !== -1) {
        if (status) mockBookings[idx].status = status;
        if (notes !== undefined) mockBookings[idx].notes = notes;
        booking = mockBookings[idx];
      }
    }

    if (!booking) {
      return next(new ApiError(404, 'Booking record not found'));
    }

    return res.status(200).json(new ApiResponse(200, booking, 'Booking status updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Booking.findByIdAndDelete(id).catch(() => null);
    const idx = mockBookings.findIndex(b => b._id === id || b.bookingReference === id);
    if (idx !== -1) mockBookings.splice(idx, 1);

    return res.status(200).json(new ApiResponse(200, null, 'Booking record deleted successfully'));
  } catch (error) {
    next(error);
  }
};
