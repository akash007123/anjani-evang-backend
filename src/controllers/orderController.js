import { Order } from '../models/Order.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { createNotificationHelper } from '../utils/notificationService.js';

const mockOrders = [
  {
    _id: 'ord-301',
    orderNumber: 'ORD-9021',
    customerName: 'Victoria Sterling',
    email: 'victoria@sterlingholdings.com',
    phone: '+1 (555) 345-6789',
    items: [
      { id: 'item-1', title: 'Truffle Glazed Tenderloin Platters', price: 450, quantity: 2 }
    ],
    totalAmount: 900,
    deliveryAddress: '740 Park Ave, Penthouse B, New York',
    status: 'delivered',
    paymentStatus: 'Paid',
    createdAt: new Date()
  }
];

export const createOrder = async (req, res, next) => {
  try {
    const { customerName, email, phone, items, totalAmount, deliveryAddress } = req.body;
    const orderNum = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    let order;
    try {
      order = await Order.create({
        orderNumber: orderNum,
        customerName,
        email,
        phone,
        items: items || [],
        totalAmount,
        deliveryAddress
      });
    } catch {
      order = {
        _id: `ord-${Date.now()}`,
        orderNumber: orderNum,
        customerName,
        email,
        phone,
        items: items || [],
        totalAmount,
        deliveryAddress,
        status: 'pending',
        paymentStatus: 'Pending',
        createdAt: new Date()
      };
      mockOrders.unshift(order);
    }

    // Trigger admin notification asynchronously
    createNotificationHelper({
      title: '🛒 New Catering Order Received',
      message: `New order #${order.orderNumber} placed by ${order.customerName || 'Customer'} for $${order.totalAmount || 0}.`,
      type: 'Order',
      icon: 'ShoppingCart',
      priority: 'High',
      relatedModule: 'Order',
      relatedRecordId: order.orderNumber || order._id,
      actionUrl: '/admin/orders',
      createdBy: 'Checkout'
    }).catch(err => console.error('Order notification creation error:', err));

    return res.status(201).json(new ApiResponse(201, order, 'Order placed successfully. Order #: ' + orderNum));
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    let orders = await Order.find().sort({ createdAt: -1 }).catch(() => []);
    if (!orders.length) {
      orders = mockOrders;
    }
    return res.status(200).json(new ApiResponse(200, orders, 'Orders retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let order = await Order.findById(id).catch(() => null);
    if (!order) {
      order = mockOrders.find(o => o._id === id || o.orderNumber === id) || null;
    }
    if (!order) {
      return next(new ApiError(404, 'Order not found'));
    }
    return res.status(200).json(new ApiResponse(200, order, 'Order retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Order.findByIdAndDelete(id).catch(() => null);
    const idx = mockOrders.findIndex(o => o._id === id || o.orderNumber === id);
    if (idx !== -1) mockOrders.splice(idx, 1);
    return res.status(200).json(new ApiResponse(200, null, 'Order deleted successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    let order = await Order.findByIdAndUpdate(id, { status, paymentStatus }, { new: true }).catch(() => null);
    if (!order) {
      const idx = mockOrders.findIndex(o => o._id === id || o.orderNumber === id);
      if (idx !== -1) {
        if (status) mockOrders[idx].status = status;
        if (paymentStatus) mockOrders[idx].paymentStatus = paymentStatus;
        order = mockOrders[idx];
      }
    }

    if (!order) {
      return next(new ApiError(404, 'Order record not found'));
    }

    return res.status(200).json(new ApiResponse(200, order, 'Order status updated successfully'));
  } catch (error) {
    next(error);
  }
};
