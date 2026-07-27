import { Booking } from '../models/Booking.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { BOOKING_STATUS } from '../constants/status.js';
import { sendBookingAckEmail } from '../utils/emailService.js';
import { createNotificationHelper } from '../utils/notificationService.js';

export const createBooking = async (req, res, next) => {
  try {
    const booking = await Booking.create(req.body);
    sendBookingAckEmail(booking).catch(() => {});
    createNotificationHelper({
      title: 'New Booking Received',
      message: `${booking.fullName} booked for ${booking.eventType} on ${new Date(booking.eventDate).toLocaleDateString()}`,
      type: 'Booking',
      icon: 'CalendarCheck',
      priority: 'High',
      recipientRoles: ['Super Admin', 'Admin', 'Manager'],
      relatedModule: 'Booking',
      relatedRecordId: booking._id.toString(),
      actionUrl: '/admin/bookings',
      createdBy: 'System'
    }).catch(() => {});
    return res.status(201).json(new ApiResponse(201, booking, 'Booking created successfully'));
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const { search, status, sortBy = 'latest', page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      const q = String(search);
      query.$or = [
        { fullName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { bookingReference: { $regex: q, $options: 'i' } },
        { eventType: { $regex: q, $options: 'i' } },
      ];
    }
    if (status && status !== 'All') query.status = status;

    let sortOptions = { createdAt: -1 };
    if (sortBy === 'oldest') sortOptions = { createdAt: 1 };

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Booking.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Booking.countDocuments(query),
    ]);

    return res.status(200).json(new ApiResponse(200, {
      bookings: items,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    }, 'Bookings retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).lean();
    if (!booking) return next(new ApiError(404, 'Booking not found'));
    return res.status(200).json(new ApiResponse(200, booking, 'Booking retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await Booking.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }).lean();
    if (!updated) return next(new ApiError(404, 'Booking not found'));
    return res.status(200).json(new ApiResponse(200, updated, 'Booking updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const updateData = { status };
    if (notes !== undefined) updateData.notes = notes;
    const updated = await Booking.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();
    if (!updated) return next(new ApiError(404, 'Booking not found'));
    return res.status(200).json(new ApiResponse(200, updated, 'Booking status updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Booking.findByIdAndDelete(id);
    if (!deleted) return next(new ApiError(404, 'Booking not found'));
    return res.status(200).json(new ApiResponse(200, { id }, 'Booking deleted successfully'));
  } catch (error) {
    next(error);
  }
};

export const getBookingAvailability = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || new Date().getMonth() + 1;

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    const bookings = await Booking.find({
      eventDate: { $gte: startDate, $lte: endDate },
      status: { $nin: ['Cancelled'] },
    }).select('eventDate guestCount status').lean();

    const dailyCounts = {};
    bookings.forEach(b => {
      const day = new Date(b.eventDate).getDate();
      dailyCounts[day] = (dailyCounts[day] || 0) + b.guestCount;
    });

    return res.status(200).json(new ApiResponse(200, {
      year: y,
      month: m,
      dailyCounts,
      totalBookings: bookings.length,
    }, 'Availability retrieved'));
  } catch (error) {
    next(error);
  }
};

export const getAvailableSlotsForDate = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return next(new ApiError(400, 'Date parameter is required'));

    const slots = [
      { time: '10:00 AM', label: 'Morning (10:00 AM)', available: true },
      { time: '12:00 PM', label: 'Midday (12:00 PM)', available: true },
      { time: '03:00 PM', label: 'Afternoon (03:00 PM)', available: true },
      { time: '06:00 PM', label: 'Evening (06:00 PM)', available: true },
      { time: '08:00 PM', label: 'Night (08:00 PM)', available: true },
    ];

    return res.status(200).json(new ApiResponse(200, { date, slots }, 'Available slots retrieved'));
  } catch (error) {
    next(error);
  }
};
