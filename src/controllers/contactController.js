import { Contact } from '../models/Contact.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { sendContactAckEmail } from '../utils/emailService.js';
import { createNotificationHelper } from '../utils/notificationService.js';

const mockContacts = [];

export const submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, eventType, eventDate, guestCount, message } = req.body;

    let contact;
    try {
      contact = await Contact.create({
        name,
        email,
        phone,
        eventType: eventType || 'General Inquiry',
        eventDate,
        guestCount: guestCount ? Number(guestCount) : undefined,
        message
      });
    } catch {
      contact = {
        _id: `contact-${Date.now()}`,
        name,
        email,
        phone,
        eventType: eventType || 'General Inquiry',
        eventDate,
        guestCount: guestCount ? Number(guestCount) : undefined,
        message,
        status: 'new',
        createdAt: new Date()
      };
      mockContacts.unshift(contact);
    }

    sendContactAckEmail(contact).catch((err) => {
      console.error('Contact acknowledgment email error:', err);
    });

    createNotificationHelper({
      title: '📩 New Contact Inquiry',
      message: `New contact inquiry received from ${contact.name || 'Customer'}. Message: "${(contact.message || '').slice(0, 60)}..."`,
      type: 'Contact',
      icon: 'Mail',
      priority: 'Medium',
      relatedModule: 'Contact',
      relatedRecordId: contact._id,
      actionUrl: '/admin/contacts',
      createdBy: 'Contact Form'
    }).catch(err => console.error('Contact notification creation error:', err));

    return res.status(201).json(new ApiResponse(201, contact, 'Contact inquiry submitted successfully! Our team will get in touch shortly.'));
  } catch (error) {
    next(error);
  }
};

export const getAllContacts = async (req, res, next) => {
  try {
    let contacts = await Contact.find().sort({ createdAt: -1 }).catch(() => []);
    if (!contacts.length) {
      contacts = mockContacts;
    }
    return res.status(200).json(new ApiResponse(200, contacts, 'Contacts list fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const getContactById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let contact = await Contact.findById(id).catch(() => null);
    if (!contact) {
      contact = mockContacts.find(c => c._id === id || c.id === id) || null;
    }
    if (!contact) {
      return next(new ApiError(404, 'Contact inquiry not found'));
    }
    return res.status(200).json(new ApiResponse(200, contact, 'Contact fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateContactStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    let contact = await Contact.findByIdAndUpdate(id, { status, notes }, { new: true, runValidators: true }).catch(() => null);
    if (!contact) {
      const idx = mockContacts.findIndex(c => c._id === id || c.id === id);
      if (idx !== -1) {
        if (status) mockContacts[idx].status = status;
        if (notes !== undefined) mockContacts[idx].notes = notes;
        contact = mockContacts[idx];
      }
    }

    if (!contact) {
      return next(new ApiError(404, 'Contact inquiry record not found'));
    }

    return res.status(200).json(new ApiResponse(200, contact, 'Contact status updated'));
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Contact.findByIdAndDelete(id).catch(() => null);
    const idx = mockContacts.findIndex(c => c._id === id || c.id === id);
    if (idx !== -1) mockContacts.splice(idx, 1);

    return res.status(200).json(new ApiResponse(200, null, 'Contact inquiry deleted successfully'));
  } catch (error) {
    next(error);
  }
};
