import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'customer', 'tour_operator', 'hotel_partner'],
    default: 'customer'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

const User = mongoose.model('User', userSchema);

// Destination/Package Schema
const packageSchema = new mongoose.Schema({
  operatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  createdBy: {
    type: String,
    enum: ['admin', 'tour_operator'],
    default: 'tour_operator'
  },
  name: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  bookings: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  description: String,
  inclusions: [String],
  image: String,
  images: [String],
  category: String,
  shortDescription: String,
  highlights: [String],
  exclusions: [String],
  terms: String,
  cancellationPolicy: String,
  pickupInfo: String,
  startingLocation: String,
  transportType: String,
  minTravelers: {
    type: Number,
    default: 1
  },
  maxTravelers: {
    type: Number,
    default: 20
  },
  publishedStatus: {
    type: String,
    enum: ['draft', 'published', 'unpublished'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Package = mongoose.model('Package', packageSchema);

// Itinerary Schema
const itinerarySchema = new mongoose.Schema({
  operatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  packageName: String,
  days: {
    type: Number,
    required: true
  },
  hotels: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  dayDetails: [{
    dayNumber: Number,
    title: String,
    date: Date,
    description: String,
    location: String,
    activities: [String],
    meals: [String],
    accommodation: String,
    transportation: String,
    images: [String],
    notes: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

// Hotel Schema
const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  rooms: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  partner: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Hotel = mongoose.model('Hotel', hotelSchema);

// Room Schema
const roomSchema = new mongoose.Schema({
  hotel: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  available: {
    type: Number,
    required: true
  },
  booked: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Room = mongoose.model('Room', roomSchema);

// Booking Schema
const bookingSchema = new mongoose.Schema({
  operatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: false
  },
  customer: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: String,
  package: {
    type: String,
    required: true
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: false
  },
  hotelName: {
    type: String,
    required: false
  },
  dates: {
    type: String,
    required: true
  },
  travelers: {
    type: Number,
    default: 1
  },
  amount: {
    type: Number,
    required: true
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['confirmed', 'pending', 'cancelled', 'completed', 'rejected'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'partial', 'refunded', 'failed'],
    default: 'pending'
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  bookingId: {
    type: String,
    unique: true
  },
  timeline: [{
    status: String,
    date: Date,
    note: String
  }]
});

const Booking = mongoose.model('Booking', bookingSchema);

// Wishlist Schema
const wishlistSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  packageName: {
    type: String,
    required: true
  },
  destination: String,
  price: Number,
  image: String,
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

// Invoice Schema
const invoiceSchema = new mongoose.Schema({
  invoiceNo: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  package: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['paid', 'pending', 'overdue'],
    default: 'pending'
  },
  date: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  }
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

// Review Schema
const reviewSchema = new mongoose.Schema({
  operatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: false
  },
  customer: {
    type: String,
    required: true
  },
  package: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  response: {
    text: String,
    date: Date
  },
  status: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'pending'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Review = mongoose.model('Review', reviewSchema);

// Coupon Schema
const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  discount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['percentage', 'flat'],
    required: true
  },
  minPurchase: {
    type: Number,
    required: true
  },
  maxDiscount: {
    type: Number
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  expiry: {
    type: Date,
    required: true
  },
  usage: {
    type: Number,
    default: 0
  },
  maxUsage: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Coupon = mongoose.model('Coupon', couponSchema);

// Settings Schema
const settingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: 'Travel Tour Management System'
  },
  siteEmail: String,
  sitePhone: String,
  currency: {
    type: String,
    default: 'INR'
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  allowRegistration: {
    type: Boolean,
    default: true
  },
  requireApproval: {
    type: Boolean,
    default: false
  },
  taxRate: {
    type: Number,
    default: 18
  },
  cancellationPolicy: String,
  refundPolicy: String,
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Settings = mongoose.model('Settings', settingsSchema);

// Operator Profile Schema
const operatorProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: String,
  logo: String,
  businessAddress: String,
  city: String,
  state: String,
  country: String,
  postalCode: String,
  website: String,
  description: String,
  businessRegNumber: String,
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  alternatePhone: String,
  licenseNumber: String,
  taxId: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const OperatorProfile = mongoose.model('OperatorProfile', operatorProfileSchema);

// Notification Schema
const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['booking', 'payment', 'review', 'system', 'offer', 'availability'],
    required: true
  },
  title: String,
  message: String,
  relatedId: mongoose.Schema.Types.ObjectId,
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

// Audit Log Schema
const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userRole: {
    type: String,
    enum: ['admin', 'customer', 'tour_operator', 'hotel_partner'],
    required: true
  },
  action: {
    type: String,
    enum: ['create', 'update', 'delete', 'status_change', 'login', 'export', 'settings_update'],
    required: true
  },
  entityType: {
    type: String,
    enum: ['user', 'package', 'hotel', 'room', 'booking', 'invoice', 'review', 'coupon', 'itinerary', 'settings', 'notification'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  entityName: String,
  details: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
    changes: [String],
    ip: String,
    userAgent: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

// Helper to create audit log entries
async function createAuditLog(userId, userRole, action, entityType, entityId, entityName, details = {}) {
  try {
    const entry = new AuditLog({
      userId, userRole, action, entityType, entityId, entityName,
      details: {
        ...details,
        ip: details.ip,
        userAgent: details.userAgent
      }
    });
    await entry.save();
  } catch (logError) {
    console.error('Failed to create audit log:', logError.message);
  }
}

// Pricing Schema
const pricingSchema = new mongoose.Schema({
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  operatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  basePrice: {
    type: Number,
    required: true
  },
  adultPrice: Number,
  childPrice: Number,
  infantPrice: Number,
  singleOccupancyPrice: Number,
  groupPricing: [{
    minPeople: Number,
    pricePerPerson: Number
  }],
  discount: {
    type: Number,
    default: 0
  },
  promotionalPrice: Number,
  tax: {
    type: Number,
    default: 0
  },
  serviceFee: {
    type: Number,
    default: 0
  },
  validFrom: Date,
  validUntil: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Pricing = mongoose.model('Pricing', pricingSchema);

// Availability Schema
const availabilitySchema = new mongoose.Schema({
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  operatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalSeats: {
    type: Number,
    required: true
  },
  availableSeats: {
    type: Number,
    required: true
  },
  soldSeats: {
    type: Number,
    default: 0
  },
  bookingCutoffDate: Date,
  minGroupSize: {
    type: Number,
    default: 1
  },
  maxGroupSize: Number,
  status: {
    type: String,
    enum: ['available', 'limited', 'full', 'closed', 'past'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Availability = mongoose.model('Availability', availabilitySchema);

const hotelPartnerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  hotelName: String,
  logo: String,
  address: String,
  city: String,
  state: String,
  country: String,
  postalCode: String,
  starRating: Number,
  checkinTime: String,
  checkoutTime: String,
  website: String,
  description: String,
  amenities: [String],
  registrationNumber: String,
  taxId: String,
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'verified'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const HotelPartnerProfile = mongoose.model('HotelPartnerProfile', hotelPartnerProfileSchema);

const hotelSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  emailNotifications: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: false },
  pushNotifications: { type: Boolean, default: true },
  bookingAlerts: { type: Boolean, default: true },
  paymentUpdates: { type: Boolean, default: true },
  reviewAlerts: { type: Boolean, default: true },
  guestNotifications: { type: Boolean, default: true },
  currency: { type: String, default: 'INR' },
  language: { type: String, default: 'English' },
  timezone: { type: String, default: 'IST' },
  updatedAt: { type: Date, default: Date.now }
});

const HotelSettings = mongoose.model('HotelSettings', hotelSettingsSchema);

const hotelBookingSchema = new mongoose.Schema({
  hotelPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hotelName: { type: String, required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  roomType: String,
  guestName: { type: String, required: true },
  guestEmail: String,
  guestPhone: String,
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  guests: { type: Number, default: 1 },
  rooms: { type: Number, default: 1 },
  amount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['confirmed', 'pending', 'checked_in', 'checked_out', 'cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['paid', 'pending', 'partial', 'refunded', 'failed'], default: 'pending' },
  bookingId: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const HotelBooking = mongoose.model('HotelBooking', hotelBookingSchema);

function isOperatorProfileComplete(profile) {
  const requiredFields = [
    'companyName',
    'businessAddress',
    'city',
    'state',
    'country',
    'postalCode',
    'website',
    'description',
    'businessRegNumber',
    'licenseNumber',
    'taxId'
  ];
  return requiredFields.every(field => String(profile?.[field] || '').trim().length > 0);
}

function pickUpdates(body, keys) {
  const updates = {};
  for (const key of keys) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  return updates;
}

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

function requireTourOperator(req, res, next) {
  if (req.user?.role !== 'tour_operator') {
    return res.status(403).json({ message: 'Tour operator access required' });
  }
  next();
}

function requireCustomer(req, res, next) {
  if (req.user?.role !== 'customer') {
    return res.status(403).json({ message: 'Customer access required' });
  }
  next();
}

function requireHotelPartner(req, res, next) {
  if (req.user?.role !== 'hotel_partner') {
    return res.status(403).json({ message: 'Hotel partner access required' });
  }
  next();
}

async function requireOperatorOwnership(req, res, next) {
  const resourceId = req.params.id || req.params.packageId || req.params.bookingId;
  const resourceType = req.path.includes('packages') ? 'Package' : 
                        req.path.includes('bookings') ? 'Booking' : 
                        req.path.includes('itineraries') ? 'Itinerary' : 
                        req.path.includes('reviews') ? 'Review' : null;
  
  if (!resourceType || !resourceId) {
    return next();
  }

  try {
    let resource;
    if (resourceType === 'Package') {
      resource = await Package.findById(resourceId);
    } else if (resourceType === 'Booking') {
      resource = await Booking.findById(resourceId);
    } else if (resourceType === 'Itinerary') {
      resource = await Itinerary.findById(resourceId);
    } else if (resourceType === 'Review') {
      resource = await Review.findById(resourceId);
    }

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.operatorId && resource.operatorId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You do not have permission to access this resource' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Error checking ownership' });
  }
}

function rangeStart(range) {
  const start = new Date();
  if (range === 'week') start.setDate(start.getDate() - 7);
  else if (range === 'quarter') start.setMonth(start.getMonth() - 3);
  else if (range === 'year') start.setFullYear(start.getFullYear() - 1);
  else start.setMonth(start.getMonth() - 1);
  return start;
}

function duplicateError(error) {
  return error?.code === 11000;
}

async function nextInvoiceNo() {
  const now = new Date();
  const prefix = `INV-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const count = await Invoice.countDocuments();
  return `${prefix}-${String(count + 1).padStart(3, '0')}`;
}

function nextBookingId() {
  const now = new Date();
  const prefix = `BK-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const rand = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${rand}`;
}

async function createPaidInvoice(booking) {
  const existing = await Invoice.findOne({
    customer: booking.customer,
    email: booking.email,
    package: booking.package,
    amount: booking.amount
  });
  if (existing) return existing;
  const due = new Date();
  due.setDate(due.getDate() + 7);
  const invoice = new Invoice({
    invoiceNo: await nextInvoiceNo(),
    customer: booking.customer,
    email: booking.email,
    package: booking.package,
    amount: booking.amount,
    status: 'paid',
    dueDate: due
  });
  await invoice.save();
  return invoice;
}

async function refreshPackageRating(packageName) {
  if (!packageName) return;
  const approved = await Review.find({ package: packageName, status: 'approved' });
  const avg = approved.length
    ? approved.reduce((sum, review) => sum + review.rating, 0) / approved.length
    : 0;
  await Package.findOneAndUpdate({ name: packageName }, { rating: Number(avg.toFixed(1)) });
}

// Log collection name for debugging
console.log('User collection name:', User.collection.name);

// Routes

// Signup Route
app.post('/api/signup', async (req, res) => {
  try {
    const { fullName, email, phone, password, role } = req.body;

    const settings = await Settings.findOne({});
    if (settings && settings.allowRegistration === false) {
      return res.status(403).json({ message: 'Registration is currently disabled' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role,
      status: settings?.requireApproval ? 'inactive' : 'active'
    });

    await newUser.save();

    const message = settings?.requireApproval
      ? 'Account created. Wait for admin approval before logging in.'
      : 'User created successfully';

    res.status(201).json({ message, user: { fullName, email, role, status: newUser.status } });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Find user by email and role
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials or role' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Account is inactive. Contact an administrator.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login timestamp in MongoDB
    user.lastLogin = new Date();
    await user.save();
    console.log(`User ${email} logged in successfully at ${user.lastLogin}`);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get All Users Route (for debugging)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    console.log('Total users in database:', users.length);
    console.log('Users:', JSON.stringify(users, null, 2));
    res.status(200).json({ count: users.length, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// Public package routes (used by customer-facing pages)
app.get('/api/packages', async (req, res) => {
  try {
    const filter = { status: 'active' };
    if (req.query.publishedOnly === 'true') {
      filter.publishedStatus = 'published';
    }
    const packages = await Package.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ packages });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching packages' });
  }
});

app.get('/api/packages/:id', async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.status(200).json({ package: pkg });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching package' });
  }
});

// Public hotels listing for customer-facing pages
app.get('/api/public/hotels', async (req, res) => {
  try {
    const hotels = await Hotel.find({ status: 'active' }).sort({ createdAt: -1 });
    const hotelIds = hotels.map(h => h.name);
    const allRooms = await Room.find({ hotel: { $in: hotelIds } });

    // Build rating from reviews for each hotel
    const reviews = await Review.find({});

    const enriched = hotels.map(h => {
      const hotelRooms = allRooms.filter(r => r.hotel === h.name);
      const totalRooms = hotelRooms.reduce((s, r) => s + (r.total || 0), 0);
      const availableRooms = hotelRooms.reduce((s, r) => s + (r.available || 0), 0);
      const bookedRooms = hotelRooms.reduce((s, r) => s + (r.booked || 0), 0);
      const minPrice = hotelRooms.length > 0 ? Math.min(...hotelRooms.map(r => r.price || 0).filter(p => p > 0)) : 0;
      const maxPrice = hotelRooms.length > 0 ? Math.max(...hotelRooms.map(r => r.price || 0)) : 0;
      const hotelReviews = reviews.filter(r => r.package === h.name);
      const rating = hotelReviews.length > 0
        ? Number((hotelReviews.reduce((s, r) => s + r.rating, 0) / hotelReviews.length).toFixed(1))
        : (h.rating || 4.0);
      return {
        _id: h._id,
        name: h.name,
        location: h.location,
        rating,
        reviewCount: hotelReviews.length,
        totalRooms,
        availableRooms,
        bookedRooms,
        minPrice,
        maxPrice,
        rooms: hotelRooms.map(r => ({ type: r.type, price: r.price, total: r.total, available: r.available })),
        partner: h.partner,
        image: h.image || `https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80`,
        description: h.description || `Comfortable stay at ${h.name}`,
        amenities: h.amenities || ['WiFi', 'Room Service', 'Reception'],
        category: h.category || 'standard',
        createdAt: h.createdAt
      };
    });

    res.json({ hotels: enriched });
  } catch (error) {
    console.error('Public hotels error:', error);
    res.status(500).json({ message: 'Error fetching hotels' });
  }
});

app.get('/api/public/hotels/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    const rooms = await Room.find({ hotel: hotel.name });
    const reviews = await Review.find({ package: hotel.name });
    const rating = reviews.length > 0
        ? Number((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1))
        : (hotel.rating || 4.0);
    res.json({
      hotel: {
        ...hotel.toObject(),
        rating,
        reviewCount: reviews.length,
        rooms: rooms.map(r => ({ _id: r._id, type: r.type, price: r.price, total: r.total, available: r.available, status: r.status }))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hotel' });
  }
});

app.use('/api/admin', authenticate, requireAdmin);

// Admin User Management Routes
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

app.post('/api/admin/users', async (req, res) => {
    try {
      const { fullName, email, phone, password, role } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ fullName, email, phone, password: hashedPassword, role });
      await newUser.save();
      const safeUser = newUser.toObject();
      delete safeUser.password;
      await createAuditLog(req.user.userId, req.user.role, 'create', 'user', newUser._id, newUser.fullName, {
        after: { fullName, email, role },
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      res.status(201).json({ message: 'User created successfully', user: safeUser });
    } catch (error) {
    if (duplicateError(error)) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    res.status(500).json({ message: 'Error creating user' });
  }
});

  app.put('/api/admin/users/:id', async (req, res) => {
    try {
      const updates = pickUpdates(req.body, ['fullName', 'email', 'phone', 'role', 'status']);
      if (req.body.password) {
        updates.password = await bcrypt.hash(req.body.password, 10);
      }
      const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      await createAuditLog(req.user.userId, req.user.role, 'update', 'user', user._id, user.fullName, {
        changes: Object.keys(updates),
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
      res.status(500).json({ message: 'Error updating user' });
    }
  });

  app.delete('/api/admin/users/:id', async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      await User.findByIdAndDelete(req.params.id);
      await createAuditLog(req.user.userId, req.user.role, 'delete', 'user', req.params.id, user?.fullName || 'Unknown User', {
        before: { fullName: user?.fullName, email: user?.email, role: user?.role },
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting user' });
    }
  });

// Package Management Routes
app.get('/api/admin/packages', async (req, res) => {
  try {
    const packages = await Package.find({});
    res.status(200).json({ packages });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching packages' });
  }
});

app.post('/api/admin/packages', async (req, res) => {
  try {
    const newPackage = new Package({
      ...req.body,
      operatorId: null,
      createdBy: 'admin',
      status: req.body.status || 'active',
      publishedStatus: req.body.publishedStatus || 'published',
      updatedAt: new Date()
    });
    await newPackage.save();
    res.status(201).json({ message: 'Package created successfully', package: newPackage });
  } catch (error) {
    res.status(500).json({ message: 'Error creating package' });
  }
});

app.put('/api/admin/packages/:id', async (req, res) => {
  try {
    const updates = pickUpdates(req.body, [
      'name', 'destination', 'duration', 'price', 'rating', 'bookings', 'status',
      'description', 'inclusions', 'image', 'images', 'category', 'shortDescription',
      'highlights', 'exclusions', 'terms', 'cancellationPolicy', 'pickupInfo',
      'startingLocation', 'transportType', 'minTravelers', 'maxTravelers', 'publishedStatus'
    ]);
    updates.updatedAt = new Date();
    const pkg = await Package.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.status(200).json({ message: 'Package updated successfully', package: pkg });
  } catch (error) {
    console.error('Error updating package:', error);
    res.status(500).json({ message: 'Error updating package', error: error.message });
  }
});

app.delete('/api/admin/packages/:id', async (req, res) => {
  try {
    await Package.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting package' });
  }
});

// Itinerary Management Routes
app.get('/api/admin/itineraries', async (req, res) => {
  try {
    const itineraries = await Itinerary.find({});
    res.status(200).json({ itineraries });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching itineraries' });
  }
});

app.post('/api/admin/itineraries', async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.packageName && !payload.packageId) {
      const pkg = await Package.findOne({ name: payload.packageName });
      if (pkg) payload.packageId = pkg._id;
    }
    const newItinerary = new Itinerary(payload);
    await newItinerary.save();
    res.status(201).json({ message: 'Itinerary created successfully', itinerary: newItinerary });
  } catch (error) {
    res.status(500).json({ message: 'Error creating itinerary' });
  }
});

app.put('/api/admin/itineraries/:id', async (req, res) => {
  try {
    const updates = pickUpdates(req.body, ['name', 'packageId', 'packageName', 'days', 'hotels', 'status']);
    if (updates.packageName && !updates.packageId) {
      const pkg = await Package.findOne({ name: updates.packageName });
      if (pkg) updates.packageId = pkg._id;
    }
    const itinerary = await Itinerary.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }
    res.status(200).json({ message: 'Itinerary updated successfully', itinerary });
  } catch (error) {
    res.status(500).json({ message: 'Error updating itinerary' });
  }
});

app.delete('/api/admin/itineraries/:id', async (req, res) => {
  try {
    await Itinerary.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Itinerary deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting itinerary' });
  }
});

// Hotel Management Routes
app.get('/api/admin/hotels', async (req, res) => {
  try {
    const hotels = await Hotel.find({});
    res.status(200).json({ hotels });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hotels' });
  }
});

app.post('/api/admin/hotels', async (req, res) => {
  try {
    const newHotel = new Hotel(req.body);
    await newHotel.save();
    res.status(201).json({ message: 'Hotel created successfully', hotel: newHotel });
  } catch (error) {
    res.status(500).json({ message: 'Error creating hotel' });
  }
});

app.put('/api/admin/hotels/:id', async (req, res) => {
  try {
    const updates = pickUpdates(req.body, ['name', 'location', 'rooms', 'rating', 'partner', 'status']);
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    res.status(200).json({ message: 'Hotel updated successfully', hotel });
  } catch (error) {
    res.status(500).json({ message: 'Error updating hotel' });
  }
});

app.delete('/api/admin/hotels/:id', async (req, res) => {
  try {
    await Hotel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting hotel' });
  }
});

// Room Management Routes
app.get('/api/admin/rooms', async (req, res) => {
  try {
    const rooms = await Room.find({});
    res.status(200).json({ rooms });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms' });
  }
});

app.post('/api/admin/rooms', async (req, res) => {
  try {
    const newRoom = new Room(req.body);
    await newRoom.save();
    res.status(201).json({ message: 'Room created successfully', room: newRoom });
  } catch (error) {
    res.status(500).json({ message: 'Error creating room' });
  }
});

app.put('/api/admin/rooms/:id', async (req, res) => {
  try {
    const updates = pickUpdates(req.body, ['hotel', 'type', 'total', 'available', 'booked', 'price', 'status']);
    const room = await Room.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json({ message: 'Room updated successfully', room });
  } catch (error) {
    res.status(500).json({ message: 'Error updating room' });
  }
});

app.delete('/api/admin/rooms/:id', async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting room' });
  }
});

// Booking Management Routes
app.get('/api/admin/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({});
    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

app.post('/api/admin/bookings', async (req, res) => {
    try {
      const payload = { ...req.body };
      if (payload.paymentStatus === 'paid' && !payload.status) {
        payload.status = 'confirmed';
      }
      const newBooking = new Booking(payload);
      await newBooking.save();
      if (newBooking.package) {
        await Package.findOneAndUpdate({ name: newBooking.package }, { $inc: { bookings: 1 } });
      }
      if (newBooking.paymentStatus === 'paid') {
        await createPaidInvoice(newBooking);
      }
      await createAuditLog(req.user.userId, req.user.role, 'create', 'booking', newBooking._id, newBooking.bookingId || newBooking.package, {
        after: { customer: newBooking.customer, package: newBooking.package, amount: newBooking.amount, status: newBooking.status },
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      const pkg = await Package.findOne({ name: newBooking.package }).lean();
      if (pkg?.operatorId) {
        await new Notification({
          userId: pkg.operatorId,
          type: 'booking',
          title: 'New Booking Received',
          message: `${newBooking.customer} booked ${newBooking.package} for ${newBooking.dates || 'your package'}.`,
          relatedId: newBooking._id
        }).save().catch(() => {});
      }
      res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
    } catch (error) {
    res.status(500).json({ message: 'Error creating booking' });
  }
});

  app.put('/api/admin/bookings/:id', async (req, res) => {
    try {
      const updates = pickUpdates(req.body, ['customer', 'email', 'package', 'dates', 'amount', 'status', 'paymentStatus']);
      if (updates.paymentStatus === 'paid' && !updates.status) {
        updates.status = 'confirmed';
      }
      const booking = await Booking.findByIdAndUpdate(req.params.id, updates, { new: true });
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      if (booking.paymentStatus === 'paid') {
        await createPaidInvoice(booking);
      }
      await createAuditLog(req.user.userId, req.user.role, 'update', 'booking', booking._id, booking.bookingId || booking.package, {
        changes: Object.keys(updates),
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      if (updates.status || updates.paymentStatus) {
        const customerUser = await User.findOne({ fullName: booking.customer, role: 'customer' }).lean();
        if (customerUser) {
          await new Notification({
            userId: customerUser._id,
            type: 'payment',
            title: booking.status === 'confirmed' ? 'Booking Confirmed' : 'Booking Updated',
            message: `Your booking for ${booking.package || 'package'} has been ${booking.status}.`,
            relatedId: booking._id
          }).save().catch(() => {});
        }
      }
      res.status(200).json({ message: 'Booking updated successfully', booking });
    } catch (error) {
    res.status(500).json({ message: 'Error updating booking' });
  }
});

app.delete('/api/admin/bookings/:id', async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id);
      await Booking.findByIdAndDelete(req.params.id);
      await createAuditLog(req.user.userId, req.user.role, 'delete', 'booking', req.params.id, booking?.bookingId || booking?.package || 'Unknown Booking', {
        before: { customer: booking?.customer, package: booking?.package, amount: booking?.amount, status: booking?.status },
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
    res.status(500).json({ message: 'Error deleting booking' });
  }
});

// Invoice Management Routes
app.get('/api/admin/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.find({});
    res.status(200).json({ invoices });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoices' });
  }
});

app.post('/api/admin/invoices', async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.invoiceNo) {
      payload.invoiceNo = await nextInvoiceNo();
    }
    const newInvoice = new Invoice(payload);
    await newInvoice.save();
    res.status(201).json({ message: 'Invoice created successfully', invoice: newInvoice });
  } catch (error) {
    if (duplicateError(error)) {
      return res.status(400).json({ message: 'Invoice number already exists' });
    }
    res.status(500).json({ message: 'Error creating invoice' });
  }
});

app.put('/api/admin/invoices/:id', async (req, res) => {
  try {
    const updates = pickUpdates(req.body, ['invoiceNo', 'customer', 'email', 'package', 'amount', 'status', 'date', 'dueDate']);
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.status(200).json({ message: 'Invoice updated successfully', invoice });
  } catch (error) {
    res.status(500).json({ message: 'Error updating invoice' });
  }
});

app.delete('/api/admin/invoices/:id', async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting invoice' });
  }
});

// Review Management Routes
app.get('/api/admin/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({});
    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

app.post('/api/admin/reviews', async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.status) payload.status = 'approved';
    const newReview = new Review(payload);
    await newReview.save();
    if (newReview.status === 'approved') {
      await refreshPackageRating(newReview.package);
    }
    await createAuditLog(req.user.userId, req.user.role, 'create', 'review', newReview._id, `${newReview.customer} - ${newReview.package}`, {
      after: { customer: newReview.customer, package: newReview.package, rating: newReview.rating, status: newReview.status },
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    res.status(201).json({ message: 'Review created successfully', review: newReview });
  } catch (error) {
    res.status(500).json({ message: 'Error creating review' });
  }
});

app.put('/api/admin/reviews/:id', async (req, res) => {
  try {
    const updates = pickUpdates(req.body, ['customer', 'package', 'rating', 'comment', 'status']);
    const review = await Review.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    await refreshPackageRating(review.package);
    await createAuditLog(req.user.userId, req.user.role, 'update', 'review', review._id, `${review.customer} - ${review.package}`, {
      changes: Object.keys(updates),
      after: { rating: review.rating, status: review.status },
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    res.status(200).json({ message: 'Review updated successfully', review });
  } catch (error) {
    res.status(500).json({ message: 'Error updating review' });
  }
});

app.delete('/api/admin/reviews/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    await Review.findByIdAndDelete(req.params.id);
    await createAuditLog(req.user.userId, req.user.role, 'delete', 'review', req.params.id, `${review?.customer || 'Unknown'} - ${review?.package || 'Unknown'}`, {
      before: { customer: review?.customer, package: review?.package, rating: review?.rating, status: review?.status },
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review' });
  }
});

// Coupon Management Routes
app.get('/api/admin/coupons', async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    res.status(200).json({ coupons });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupons' });
  }
});

app.post('/api/admin/coupons', async (req, res) => {
    try {
      const newCoupon = new Coupon(req.body);
      await newCoupon.save();
      await createAuditLog(req.user.userId, req.user.role, 'create', 'coupon', newCoupon._id, newCoupon.code, {
        after: { code: newCoupon.code, discount: newCoupon.discount, type: newCoupon.type, status: newCoupon.status },
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      res.status(201).json({ message: 'Coupon created successfully', coupon: newCoupon });
    } catch (error) {
    if (duplicateError(error)) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }
    res.status(500).json({ message: 'Error creating coupon' });
  }
});

app.put('/api/admin/coupons/:id', async (req, res) => {
    try {
      const updates = pickUpdates(req.body, ['code', 'discount', 'type', 'minPurchase', 'maxDiscount', 'status', 'expiry', 'usage', 'maxUsage']);
      const coupon = await Coupon.findByIdAndUpdate(req.params.id, updates, { new: true });
      if (!coupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }
      await createAuditLog(req.user.userId, req.user.role, 'update', 'coupon', coupon._id, coupon.code, {
        changes: Object.keys(updates),
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      res.status(200).json({ message: 'Coupon updated successfully', coupon });
    } catch (error) {
    res.status(500).json({ message: 'Error updating coupon' });
  }
});

app.delete('/api/admin/coupons/:id', async (req, res) => {
    try {
      const coupon = await Coupon.findById(req.params.id);
      await Coupon.findByIdAndDelete(req.params.id);
      await createAuditLog(req.user.userId, req.user.role, 'delete', 'coupon', req.params.id, coupon?.code || 'Unknown Coupon', {
        before: { code: coupon?.code, discount: coupon?.discount },
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      res.status(200).json({ message: 'Coupon deleted successfully' });
    } catch (error) {
    res.status(500).json({ message: 'Error deleting coupon' });
  }
});

// Settings Management Routes
app.get('/api/admin/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.status(200).json({ settings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings' });
  }
});

app.put('/api/admin/settings', async (req, res) => {
    try {
      const updates = pickUpdates(req.body, [
        'siteName', 'siteEmail', 'sitePhone', 'currency', 'timezone',
        'maintenanceMode', 'allowRegistration', 'requireApproval', 'taxRate',
        'cancellationPolicy', 'refundPolicy'
      ]);
      updates.updatedAt = new Date();
      let settings = await Settings.findOneAndUpdate({}, updates, { new: true, upsert: true, setDefaultsOnInsert: true });
      await createAuditLog(req.user.userId, req.user.role, 'settings_update', 'settings', null, 'Platform Settings', {
        changes: Object.keys(updates),
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      res.status(200).json({ message: 'Settings updated successfully', settings });
    } catch (error) {
    res.status(500).json({ message: 'Error updating settings' });
  }
});

// Analytics Routes
app.get('/api/admin/analytics', async (req, res) => {
  try {
    const since = rangeStart(req.query.range || 'month');
    const totalUsers = await User.countDocuments();
    const activeTours = await Package.countDocuments({ status: 'active' });
    const partnerHotels = await Hotel.countDocuments({ status: 'active' });
    const totalBookings = await Booking.countDocuments();
    const paidBookings = await Booking.find({ paymentStatus: 'paid' });
    const totalRevenue = paidBookings.reduce((sum, b) => sum + b.amount, 0);
    const reviews = await Review.find({});
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    const bookingStats = {
      confirmed: await Booking.countDocuments({ status: 'confirmed' }),
      pending: await Booking.countDocuments({ status: 'pending' }),
      cancelled: await Booking.countDocuments({ status: 'cancelled' })
    };

    const revenueByPackage = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: '$package', revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { revenue: -1 } }
    ])

    const topTours = await Package.find({}).sort({ price: -1 }).limit(10).lean();
    const topToursBookings = await Booking.find({ paymentStatus: 'paid' }).select('package amount');
    const recentUsers = await User.find({}).sort({ createdAt: -1 }).limit(4).select('-password').lean();
    const recentBookings = await Booking.find({}).sort({ bookingDate: -1 }).limit(6).lean();
    const recentReviews = await Review.find({}).sort({ date: -1 }).limit(4).lean();
    const recentInvoices = await Invoice.find({}).sort({ date: -1 }).limit(3).lean();
    const roomSummary = await Room.aggregate([
      { $group: { _id: null, total: { $sum: '$total' }, available: { $sum: '$available' }, booked: { $sum: '$booked' } } }
    ]);

    const monthlyRevenue = [];
    const userGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date();
      start.setMonth(start.getMonth() - i, 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      const monthPaid = await Booking.find({ paymentStatus: 'paid', bookingDate: { $gte: start, $lt: end } });
      monthlyRevenue.push(monthPaid.reduce((sum, b) => sum + b.amount, 0));
      userGrowth.push(await User.countDocuments({ createdAt: { $lt: end } }));
    }

    const rangeBookings = await Booking.countDocuments({ bookingDate: { $gte: since } });
    const rangeUsers = await User.countDocuments({ createdAt: { $gte: since } });
    const rangeRevenue = (await Booking.find({ paymentStatus: 'paid', bookingDate: { $gte: since } }))
      .reduce((sum, b) => sum + b.amount, 0);

    const notificationStats = {
      total: await Notification.countDocuments(),
      unread: await Notification.countDocuments({ read: false }),
      byType: {
        booking: await Notification.countDocuments({ type: 'booking' }),
        payment: await Notification.countDocuments({ type: 'payment' }),
        review: await Notification.countDocuments({ type: 'review' }),
        system: await Notification.countDocuments({ type: 'system' }),
        offer: await Notification.countDocuments({ type: 'offer' }),
        availability: await Notification.countDocuments({ type: 'availability' })
      }
    };

    res.status(200).json({
      totalUsers,
      activeTours,
      partnerHotels,
      totalBookings,
      totalRevenue,
      avgRating: Number(avgRating.toFixed(1)),
      bookingStats,
      topTours: topTours.map((pkg) => {
          const pkgBookings = topToursBookings.filter(b => b.package === pkg.name);
          const count = pkgBookings.length;
          const revenue = pkgBookings.reduce((sum, b) => sum + (b.paidAmount || b.amount || 0), 0);
          return {
            name: pkg.name,
            bookings: count,
            revenue: revenue
          };
        }).sort((a, b) => b.bookings - a.bookings).slice(0, 5),
      recentActivity: [
        ...recentUsers.map((u) => ({ type: 'user', text: `New user: ${u.fullName} (${u.role})` })),
        ...recentBookings.map((b) => ({ type: 'booking', text: `Booking: ${b.package} by ${b.customer}` })),
        ...recentReviews.map((r) => ({ type: 'review', text: `Review: ${r.rating}★ for ${r.package}` })),
        ...recentInvoices.map((inv) => ({ type: 'invoice', text: `Invoice ${inv.invoiceNo} for ${inv.customer}` }))
      ].slice(0, 8),
      monthlyRevenue,
      userGrowth,
      upcomingBookings: recentBookings.slice(0, 5).map((booking) => ({
        customer: booking.customer,
        package: booking.package,
        dates: booking.dates,
        amount: booking.amount,
        status: booking.status
      })),
       rooms: roomSummary[0] || { total: 0, available: 0, booked: 0 },
       notificationStats,
       range: {
        bookings: rangeBookings,
        users: rangeUsers,
        revenue: rangeRevenue
      }
    });
   } catch (error) {
     console.error('Analytics error:', error);
     res.status(500).json({ message: 'Error fetching analytics' });
   }
 });

// Audit Log Routes
app.get('/api/admin/audit-logs', async (req, res) => {
  try {
    const { entityType, action, limit, role } = req.query;
    const filter = {};
    if (entityType) filter.entityType = entityType;
    if (action) filter.action = action;
    if (role) filter.userRole = role;

    const logs = await AuditLog.find(filter)
      .populate('userId', 'fullName email role')
      .sort({ timestamp: -1 })
      .limit(Number(limit) || 100);

    res.status(200).json({ logs });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audit logs' });
  }
});

// Enhanced admin report: role breakdown and revenue by category
app.get('/api/admin/reports/summary', async (req, res) => {
  try {
    const since = rangeStart(req.query.range || 'month');

    const usersByRole = {
      admin: await User.countDocuments({ role: 'admin' }),
      customer: await User.countDocuments({ role: 'customer' }),
      tour_operator: await User.countDocuments({ role: 'tour_operator' }),
      hotel_partner: await User.countDocuments({ role: 'hotel_partner' })
    };

    const roleGrowth = {
      customer: { current: 0, previous: 0 }
    };
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - 1, 1);
    monthStart.setHours(0, 0, 0, 0);
    const prevMonthStart = new Date(monthStart);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    roleGrowth.customer = {
      current: await User.countDocuments({ role: 'customer', createdAt: { $gte: monthStart } }),
      previous: await User.countDocuments({ role: 'customer', createdAt: { $gte: prevMonthStart, $lt: monthStart } })
    };

    const bookingsByStatus = {
      confirmed: await Booking.countDocuments({ status: 'confirmed' }),
      pending: await Booking.countDocuments({ status: 'pending' }),
      cancelled: await Booking.countDocuments({ status: 'cancelled' }),
      completed: await Booking.countDocuments({ status: 'completed' }),
      rejected: await Booking.countDocuments({ status: 'rejected' })
    };

    const bookingsByPayment = {
      paid: await Booking.countDocuments({ paymentStatus: 'paid' }),
      pending: await Booking.countDocuments({ paymentStatus: 'pending' }),
      partial: await Booking.countDocuments({ paymentStatus: 'partial' }),
      refunded: await Booking.countDocuments({ paymentStatus: 'refunded' }),
      failed: await Booking.countDocuments({ paymentStatus: 'failed' })
    };

    const packages = await Package.find({});
    const revenueByCategory = {};
    const revenueByDestination = {};
    const paidBookings = await Booking.find({ paymentStatus: 'paid' });

    packages.forEach((pkg) => {
      const category = pkg.category || 'Uncategorized';
      const destination = pkg.destination || 'Unknown';
      const pkgBookings = paidBookings.filter(b => b.package === pkg.name);
      const revenue = pkgBookings.reduce((sum, b) => sum + (b.paidAmount || b.amount || 0), 0);
      revenueByCategory[category] = (revenueByCategory[category] || 0) + revenue;
      revenueByDestination[destination] = (revenueByDestination[destination] || 0) + revenue;
    });

    const sortedCategories = Object.entries(revenueByCategory)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    const sortedDestinations = Object.entries(revenueByDestination)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const rangeBookings = await Booking.countDocuments({ bookingDate: { $gte: since } });
    const rangeRevenue = paidBookings
      .filter(b => new Date(b.bookingDate) >= since)
      .reduce((sum, b) => sum + (b.paidAmount || b.amount || 0), 0);

    res.status(200).json({
      usersByRole,
      roleGrowth,
      bookingsByStatus,
      bookingsByPayment,
      revenueByCategory: sortedCategories,
      revenueByDestination: sortedDestinations,
      range: {
        bookings: rangeBookings,
        revenue: rangeRevenue,
        since: since.toISOString()
      }
    });
  } catch (error) {
    console.error('Report summary error:', error);
    res.status(500).json({ message: 'Error fetching report summary' });
  }
});

// Admin Notification Management Routes
app.get('/api/admin/notifications', async (req, res) => {
  try {
    const { type, userId, read, search, limit = 100 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (read !== undefined && read !== '') filter.read = read === 'true';
    if (userId) filter.userId = userId;
    if (search) filter.$or = [
      { title: new RegExp(search, 'i') },
      { message: new RegExp(search, 'i') }
    ];
    const notifications = await Notification.find(filter)
      .populate('userId', 'fullName email role')
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    const stats = {
      total: await Notification.countDocuments(),
      unread: await Notification.countDocuments({ read: false }),
      byType: {}
    };
    const types = ['booking', 'payment', 'review', 'system', 'offer', 'availability'];
    for (const t of types) {
      stats.byType[t] = await Notification.countDocuments({ type: t });
    }
    const usersCount = await Notification.aggregate([
      { $group: { _id: null, uniqueUsers: { $addToSet: '$userId' } } }
    ]);
    stats.recipients = usersCount[0]?.uniqueUsers?.length || 0;
    res.status(200).json({ notifications, stats });
  } catch (error) {
    console.error('Notification fetch error:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

app.post('/api/admin/notifications', async (req, res) => {
  try {
    const { title, message, type, userIds, role } = req.body;
    if (!title || !message || !type) {
      return res.status(400).json({ message: 'title, message, and type are required' });
    }
    let targetUserIds = [];
    if (userIds && Array.isArray(userIds)) {
      targetUserIds = userIds;
    } else if (role) {
      const users = await User.find(role === 'all' ? {} : { role }).select('_id');
      targetUserIds = users.map(u => u._id);
    } else {
      return res.status(400).json({ message: 'Must specify userIds or role' });
    }
    const notifications = [];
    for (const uid of targetUserIds) {
      const notif = new Notification({
        userId: uid,
        type,
        title,
        message,
        read: false
      });
      notifications.push(await notif.save());
    }
    await createAuditLog(
      req.user.userId, req.user.role, 'create', 'notification', null, title,
      { recipientCount: targetUserIds.length, type, role: role || 'specific' }
    );
    res.status(201).json({ message: 'Notifications sent', count: notifications.length });
  } catch (error) {
    console.error('Notification creation error:', error);
    res.status(500).json({ message: 'Error sending notifications' });
  }
});

app.delete('/api/admin/notifications', async (req, res) => {
  try {
    const { type, olderThan } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (olderThan) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - Number(olderThan));
      filter.createdAt = { $lt: cutoff };
    }
    const result = await Notification.deleteMany(filter);
    await createAuditLog(
      req.user.userId, req.user.role, 'delete', 'notification', null, 'Bulk delete',
      { deletedCount: result.deletedCount, type, olderThan }
    );
    res.status(200).json({ message: 'Notifications deleted', deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Notification delete error:', error);
    res.status(500).json({ message: 'Error deleting notifications' });
  }
});

app.put('/api/admin/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    await createAuditLog(
      req.user.userId, req.user.role, 'update', 'notification', req.params.id,
      notification.title || '', { action: 'mark_read' }
    );
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Notification read error:', error);
    res.status(500).json({ message: 'Error marking notification as read' });
  }
});

app.delete('/api/admin/notifications/:id', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    await createAuditLog(
      req.user.userId, req.user.role, 'delete', 'notification', req.params.id,
      notification.title || '', {}
    );
    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Notification delete error:', error);
    res.status(500).json({ message: 'Error deleting notification' });
  }
});

// Tour Operator Routes
app.use('/api/operator', authenticate, requireTourOperator);

// Operator Profile Routes
app.get('/api/operator/profile', async (req, res) => {
  try {
    let profile = await OperatorProfile.findOne({ userId: req.user.userId });
    if (!profile) {
      profile = new OperatorProfile({ userId: req.user.userId });
      await profile.save();
    } else if (profile.verificationStatus === 'pending' && isOperatorProfileComplete(profile)) {
      profile.verificationStatus = 'verified';
      await profile.save();
    }
    const user = await User.findById(req.user.userId).select('-password');
    res.status(200).json({ profile, user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

app.put('/api/operator/profile', async (req, res) => {
  try {
    const updates = pickUpdates(req.body, [
      'companyName', 'logo', 'businessAddress', 'city', 'state', 'country',
      'postalCode', 'website', 'description', 'businessRegNumber', 'alternatePhone',
      'licenseNumber', 'taxId'
    ]);
    updates.updatedAt = new Date();
    let profile = await OperatorProfile.findOneAndUpdate(
      { userId: req.user.userId },
      updates,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    
    if (req.body.fullName || req.body.email || req.body.phone) {
      const userUpdates = pickUpdates(req.body, ['fullName', 'email', 'phone']);
      if (req.body.password) {
        userUpdates.password = await bcrypt.hash(req.body.password, 10);
      }
      await User.findByIdAndUpdate(req.user.userId, userUpdates);
    }
    
    res.status(200).json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Operator Package Routes
app.get('/api/operator/packages', async (req, res) => {
  try {
    // Fetch packages created by this operator OR packages created by admin
    const packages = await Package.find({
      $or: [
        { operatorId: req.user.userId },
        { createdBy: 'admin' }
      ]
    }).sort({ createdAt: -1 });
    res.status(200).json({ packages });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching packages' });
  }
});

app.post('/api/operator/packages', async (req, res) => {
  try {
    const newPackage = new Package({
      ...req.body,
      operatorId: req.user.userId,
      updatedAt: new Date()
    });
    await newPackage.save();
    res.status(201).json({ message: 'Package created successfully', package: newPackage });
  } catch (error) {
    res.status(500).json({ message: 'Error creating package' });
  }
});

app.get('/api/operator/packages/:id', async (req, res) => {
  try {
    const pkg = await Package.findOne({ _id: req.params.id, operatorId: req.user.userId });
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.status(200).json({ package: pkg });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching package' });
  }
});

app.put('/api/operator/packages/:id', async (req, res) => {
  try {
    const updates = pickUpdates(req.body, [
      'name', 'destination', 'duration', 'price', 'status', 'description',
      'inclusions', 'image', 'images', 'category', 'shortDescription', 'highlights',
      'exclusions', 'terms', 'cancellationPolicy', 'pickupInfo', 'startingLocation',
      'transportType', 'minTravelers', 'maxTravelers', 'publishedStatus'
    ]);
    updates.updatedAt = new Date();
    const pkg = await Package.findOneAndUpdate(
      { _id: req.params.id, operatorId: req.user.userId },
      updates,
      { new: true, runValidators: true }
    );
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.status(200).json({ message: 'Package updated successfully', package: pkg });
  } catch (error) {
    res.status(500).json({ message: 'Error updating package' });
  }
});

app.delete('/api/operator/packages/:id', async (req, res) => {
  try {
    const pkg = await Package.findOneAndDelete({ _id: req.params.id, operatorId: req.user.userId });
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.status(200).json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting package' });
  }
});

// Operator Itinerary Routes
app.get('/api/operator/itineraries', async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ operatorId: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json({ itineraries });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching itineraries' });
  }
});

app.get('/api/operator/itineraries/package/:packageId', async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({ packageId: req.params.packageId, operatorId: req.user.userId });
    res.status(200).json({ itinerary });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching itinerary' });
  }
});

app.post('/api/operator/itineraries', async (req, res) => {
  try {
    const newItinerary = new Itinerary({
      ...req.body,
      operatorId: req.user.userId,
      updatedAt: new Date()
    });
    await newItinerary.save();
    res.status(201).json({ message: 'Itinerary created successfully', itinerary: newItinerary });
  } catch (error) {
    res.status(500).json({ message: 'Error creating itinerary' });
  }
});

app.put('/api/operator/itineraries/:id', async (req, res) => {
  try {
    const updates = pickUpdates(req.body, ['name', 'packageId', 'packageName', 'days', 'hotels', 'status', 'dayDetails']);
    updates.updatedAt = new Date();
    const itinerary = await Itinerary.findOneAndUpdate(
      { _id: req.params.id, operatorId: req.user.userId },
      updates,
      { new: true }
    );
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }
    res.status(200).json({ message: 'Itinerary updated successfully', itinerary });
  } catch (error) {
    res.status(500).json({ message: 'Error updating itinerary' });
  }
});

app.delete('/api/operator/itineraries/:id', async (req, res) => {
  try {
    const itinerary = await Itinerary.findOneAndDelete({ _id: req.params.id, operatorId: req.user.userId });
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }
    res.status(200).json({ message: 'Itinerary deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting itinerary' });
  }
});

// Operator Pricing Routes
app.get('/api/operator/pricing/package/:packageId', async (req, res) => {
  try {
    const pricing = await Pricing.findOne({ packageId: req.params.packageId, operatorId: req.user.userId });
    res.status(200).json({ pricing });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pricing' });
  }
});

app.post('/api/operator/pricing', async (req, res) => {
  try {
    const newPricing = new Pricing({
      ...req.body,
      operatorId: req.user.userId,
      updatedAt: new Date()
    });
    await newPricing.save();
    res.status(201).json({ message: 'Pricing created successfully', pricing: newPricing });
  } catch (error) {
    res.status(500).json({ message: 'Error creating pricing' });
  }
});

app.put('/api/operator/pricing/:id', async (req, res) => {
  try {
    const updates = pickUpdates(req.body, [
      'basePrice', 'adultPrice', 'childPrice', 'infantPrice', 'singleOccupancyPrice',
      'groupPricing', 'discount', 'promotionalPrice', 'tax', 'serviceFee',
      'validFrom', 'validUntil'
    ]);
    updates.updatedAt = new Date();
    const pricing = await Pricing.findOneAndUpdate(
      { _id: req.params.id, operatorId: req.user.userId },
      updates,
      { new: true }
    );
    if (!pricing) {
      return res.status(404).json({ message: 'Pricing not found' });
    }
    res.status(200).json({ message: 'Pricing updated successfully', pricing });
  } catch (error) {
    res.status(500).json({ message: 'Error updating pricing' });
  }
});

// Operator Availability Routes
app.get('/api/operator/availability/package/:packageId', async (req, res) => {
  try {
    const availability = await Availability.find({ packageId: req.params.packageId, operatorId: req.user.userId });
    res.status(200).json({ availability });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching availability' });
  }
});

app.post('/api/operator/availability', async (req, res) => {
  try {
    const newAvailability = new Availability({
      ...req.body,
      operatorId: req.user.userId,
      updatedAt: new Date()
    });
    await newAvailability.save();
    res.status(201).json({ message: 'Availability created successfully', availability: newAvailability });
  } catch (error) {
    res.status(500).json({ message: 'Error creating availability' });
  }
});

app.put('/api/operator/availability/:id', async (req, res) => {
  try {
    const updates = pickUpdates(req.body, [
      'startDate', 'endDate', 'totalSeats', 'availableSeats', 'soldSeats',
      'bookingCutoffDate', 'minGroupSize', 'maxGroupSize', 'status'
    ]);
    updates.updatedAt = new Date();
    const availability = await Availability.findOneAndUpdate(
      { _id: req.params.id, operatorId: req.user.userId },
      updates,
      { new: true }
    );
    if (!availability) {
      return res.status(404).json({ message: 'Availability not found' });
    }
    res.status(200).json({ message: 'Availability updated successfully', availability });
  } catch (error) {
    res.status(500).json({ message: 'Error updating availability' });
  }
});

app.delete('/api/operator/availability/:id', async (req, res) => {
  try {
    const availability = await Availability.findOneAndDelete({ _id: req.params.id, operatorId: req.user.userId });
    if (!availability) {
      return res.status(404).json({ message: 'Availability not found' });
    }
    res.status(200).json({ message: 'Availability deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting availability' });
  }
});

// Operator Booking Routes
app.get('/api/operator/bookings', async (req, res) => {
  try {
    const accessiblePackages = await Package.find({
      $or: [
        { operatorId: req.user.userId },
        { createdBy: 'admin' }
      ]
    }).distinct('_id')
    const bookings = await Booking.find({
      $or: [
        { operatorId: req.user.userId },
        { packageId: { $in: accessiblePackages } }
      ]
    }).sort({ bookingDate: -1 });
    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

app.get('/api/operator/bookings/:id', async (req, res) => {
  try {
    const accessiblePackages = await Package.find({
      $or: [
        { operatorId: req.user.userId },
        { createdBy: 'admin' }
      ]
    }).distinct('_id')
    const booking = await Booking.findOne({
      _id: req.params.id,
      $or: [
        { operatorId: req.user.userId },
        { packageId: { $in: accessiblePackages } }
      ]
    });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(200).json({ booking });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking' });
  }
});

app.put('/api/operator/bookings/:id', async (req, res) => {
  try {
    const accessiblePackages = await Package.find({
      $or: [
        { operatorId: req.user.userId },
        { createdBy: 'admin' }
      ]
    }).distinct('_id')
    const updates = pickUpdates(req.body, ['status', 'paymentStatus']);
    const booking = await Booking.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [
          { operatorId: req.user.userId },
          { packageId: { $in: accessiblePackages } }
        ]
      },
      updates,
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Add timeline entry
    if (updates.status) {
      booking.timeline.push({
        status: updates.status,
        date: new Date(),
        note: `Status changed to ${updates.status}`
      });
    }
    
    await booking.save();
    res.status(200).json({ message: 'Booking updated successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking' });
  }
});

// Operator Customer Routes
app.get('/api/operator/customers', async (req, res) => {
  try {
    const accessiblePackages = await Package.find({
      $or: [
        { operatorId: req.user.userId },
        { createdBy: 'admin' }
      ]
    }).distinct('_id')
    const bookings = await Booking.find({
      $or: [
        { operatorId: req.user.userId },
        { packageId: { $in: accessiblePackages } }
      ]
    })
    const customerIds = [...new Set(bookings.map(b => b.customerId))];
    const customers = await User.find({ _id: { $in: customerIds } }).select('-password');
    
    const customersWithStats = await Promise.all(customers.map(async (customer) => {
      const customerBookings = bookings.filter(b => b.customerId.toString() === customer._id.toString());
      const totalSpent = customerBookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
      return {
        ...customer.toObject(),
        totalBookings: customerBookings.length,
        totalSpent,
        lastBooking: customerBookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))[0]?.bookingDate
      };
    }));
    
    res.status(200).json({ customers: customersWithStats });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customers' });
  }
});

app.get('/api/operator/customers/:id', async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const accessiblePackages = await Package.find({
      $or: [
        { operatorId: req.user.userId },
        { createdBy: 'admin' }
      ]
    }).distinct('_id')
    const bookings = await Booking.find({
      customerId: req.params.id,
      $or: [
        { operatorId: req.user.userId },
        { packageId: { $in: accessiblePackages } }
      ]
    });
    const reviews = await Review.find({
      customerId: req.params.id,
      $or: [
        { operatorId: req.user.userId },
        { packageId: { $in: accessiblePackages } }
      ]
    });
    
    res.status(200).json({
      customer,
      bookings,
      reviews,
      totalBookings: bookings.length,
      totalSpent: bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer details' });
  }
});

// Operator Review Routes
app.get('/api/operator/reviews', async (req, res) => {
  try {
    const accessiblePackages = await Package.find({
      $or: [
        { operatorId: req.user.userId },
        { createdBy: 'admin' }
      ]
    }).distinct('_id')
    const reviews = await Review.find({
      $or: [
        { operatorId: req.user.userId },
        { packageId: { $in: accessiblePackages } }
      ]
    }).sort({ date: -1 });
    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

app.put('/api/operator/reviews/:id/respond', async (req, res) => {
  try {
    const accessiblePackages = await Package.find({
      $or: [
        { operatorId: req.user.userId },
        { createdBy: 'admin' }
      ]
    }).distinct('_id')
    const review = await Review.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [
          { operatorId: req.user.userId },
          { packageId: { $in: accessiblePackages } }
        ]
      },
      {
        response: {
          text: req.body.response,
          date: new Date()
        }
      },
      { new: true }
    );
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(200).json({ message: 'Response added successfully', review });
  } catch (error) {
    res.status(500).json({ message: 'Error adding response' });
  }
});

// Operator Revenue Routes
app.get('/api/operator/revenue', async (req, res) => {
  try {
    const range = req.query.range || 'month';
    const since = rangeStart(range);
    const accessiblePackages = await Package.find({
      $or: [
        { operatorId: req.user.userId },
        { createdBy: 'admin' }
      ]
    }).distinct('_id')
    const match = {
      $or: [
        { operatorId: req.user.userId },
        { packageId: { $in: accessiblePackages } }
      ]
    }
    
    const bookings = await Booking.find({ ...match, paymentStatus: 'paid' });
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.paidAmount || b.amount), 0);
    
    const rangeBookings = await Booking.find({ 
      ...match,
      paymentStatus: 'paid',
      bookingDate: { $gte: since } 
    });
    const rangeRevenue = rangeBookings.reduce((sum, b) => sum + (b.paidAmount || b.amount), 0);
    
    const pendingBookings = await Booking.find({ 
      ...match,
      paymentStatus: { $in: ['pending', 'partial'] } 
    });
    const pendingRevenue = pendingBookings.reduce((sum, b) => sum + (b.amount - (b.paidAmount || 0)), 0);
    
    const refundedBookings = await Booking.find({ 
      ...match,
      paymentStatus: 'refunded' 
    });
    const refundedRevenue = refundedBookings.reduce((sum, b) => sum + b.amount, 0);
    
    // Revenue by package
    const revenueByPackage = await Booking.aggregate([
      { $match: { ...match, paymentStatus: 'paid' } },
      { $group: { _id: '$package', revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { revenue: -1 } }
    ]);
    
    // Monthly revenue
    const monthlyRevenue = [];
    for (let i = 11; i >= 0; i--) {
      const start = new Date();
      start.setMonth(start.getMonth() - i, 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      const monthRevenue = await Booking.find({
        ...match,
        paymentStatus: 'paid',
        bookingDate: { $gte: start, $lt: end }
      });
      monthlyRevenue.push(monthRevenue.reduce((sum, b) => sum + (b.paidAmount || b.amount), 0));
    }
    
    res.status(200).json({
      totalRevenue,
      rangeRevenue,
      pendingRevenue,
      refundedRevenue,
      totalBookings: bookings.length,
      rangeBookings: rangeBookings.length,
      averageBookingValue: bookings.length > 0 ? totalRevenue / bookings.length : 0,
      revenueByPackage,
      monthlyRevenue
    });
  } catch (error) {
    console.error('Revenue error:', error);
    res.status(500).json({ message: 'Error fetching revenue data' });
  }
});

// Operator Notification Routes
app.get('/api/operator/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ userId: req.user.userId, read: false });
    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

app.put('/api/operator/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read' });
  }
});

app.put('/api/operator/notifications/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.userId, read: false },
      { read: true }
    );
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking all notifications as read' });
  }
});

app.delete('/api/operator/notifications/:id', async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification' });
  }
});

// Customer Routes
app.use('/api/customer', authenticate, requireCustomer);

app.get('/api/customer/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user.userId }).sort({ bookingDate: -1 });
    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

app.get('/api/customer/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, customerId: req.user.userId });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.status(200).json({ booking });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking' });
  }
});

app.put('/api/customer/bookings/:id/pay', async (req, res) => {
  try {
    const { amount } = req.body;
    const booking = await Booking.findOne({ _id: req.params.id, customerId: req.user.userId });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const additional = Number(amount) || (booking.amount - (booking.paidAmount || 0));
    booking.paidAmount = (booking.paidAmount || 0) + additional;
    if (booking.paidAmount >= booking.amount) {
      booking.paymentStatus = 'paid';
      booking.status = booking.status === 'pending' ? 'confirmed' : booking.status;
      booking.timeline.push({ status: 'payment_paid', date: new Date(), note: `Paid ${booking.paidAmount} via customer portal` });
      await createPaidInvoice(booking);
    } else if (booking.paidAmount > 0) {
      booking.paymentStatus = 'partial';
      booking.timeline.push({ status: 'payment_partial', date: new Date(), note: `Partial payment of ${additional}` });
    }
    await booking.save();
    if (booking.package) {
      await Package.findOneAndUpdate({ name: booking.package }, { $inc: { bookings: 0 } });
    }
    await new Notification({
      userId: req.user.userId,
      type: 'payment',
      title: booking.paymentStatus === 'paid' ? 'Payment Successful' : 'Partial Payment Received',
      message: booking.paymentStatus === 'paid'
        ? `Payment of ₹${(booking.paidAmount || 0).toLocaleString()} received for ${booking.package || 'booking'}.`
        : `Partial payment of ₹${(additional || 0).toLocaleString()} received. Remaining: ₹${((booking.amount || 0) - (booking.paidAmount || 0)).toLocaleString()}`,
      relatedId: booking._id
    }).save()
    res.status(200).json({ message: 'Payment recorded', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error processing payment' });
  }
});

app.get('/api/customer/analytics', async (req, res) => {
  try {
    const range = req.query.range || 'month'
    const since = rangeStart(range)

    const bookings = await Booking.find({ customerId: req.user.userId }).sort({ bookingDate: -1 })
    const paidBookings = bookings.filter(b => b.paymentStatus === 'paid')
    const totalBookings = bookings.length
    const totalSpent = paidBookings.reduce((sum, b) => sum + (b.paidAmount || b.amount || 0), 0)

    const rangeBookings = bookings.filter(b => new Date(b.bookingDate) >= since)
    const rangeSpent = rangeBookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (b.paidAmount || b.amount || 0), 0)

    const bookingStatus = {
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      pending: bookings.filter(b => b.status === 'pending').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      completed: bookings.filter(b => b.status === 'completed').length
    }

    const paymentStatus = {
      paid: bookings.filter(b => b.paymentStatus === 'paid').length,
      partial: bookings.filter(b => b.paymentStatus === 'partial').length,
      pending: bookings.filter(b => b.paymentStatus === 'pending').length,
      refunded: bookings.filter(b => b.paymentStatus === 'refunded').length,
      failed: bookings.filter(b => b.paymentStatus === 'failed').length
    }

    const revenueTrend = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date()
      monthStart.setMonth(monthStart.getMonth() - i)
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      const monthEnd = new Date(monthStart)
      monthEnd.setMonth(monthEnd.getMonth() + 1)
      const monthBookings = bookings.filter(b => {
        const d = new Date(b.bookingDate)
        return d >= monthStart && d < monthEnd
      })
      const monthRevenue = monthBookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + (b.paidAmount || b.amount || 0), 0)
      revenueTrend.push({
        label: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthRevenue,
        bookings: monthBookings.length
      })
    }

    const recentBookings = await Booking.find({ customerId: req.user.userId })
      .sort({ bookingDate: -1 }).limit(8).lean()

    const recentReviews = await Review.find({ customerId: req.user.userId })
      .sort({ date: -1 }).limit(5).lean()

    const destCounts = {}
    bookings.forEach(b => {
      if (b.package) {
        const dest = (b.package || '').split(/[,-]/)[0].trim()
        if (dest) destCounts[dest] = (destCounts[dest] || 0) + 1
      }
    })
    const topDestinations = Object.entries(destCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const upcomingTrips = bookings
      .filter(b => ['confirmed', 'pending', 'partial'].includes(b.status))
      .slice(0, 5)

    const wishlistCount = 0

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const alerts = {
      upcomingTrips: upcomingTrips.length,
      pendingPayments: bookings.filter(b => ['pending', 'partial'].includes(b.paymentStatus) && new Date(b.bookingDate) < sevenDaysAgo).length
    }

    res.status(200).json({
      totalBookings,
      totalSpent,
      rangeBookings,
      rangeSpent,
      bookingStatus,
      paymentStatus,
      revenueTrend,
      recentBookings,
      recentReviews,
      topDestinations,
      upcomingTrips,
      wishlistCount,
      alerts,
      loyaltyTier: totalSpent >= 100000 ? 'Gold' : totalSpent >= 25000 ? 'Silver' : 'Explorer'
    })
  } catch (error) {
    console.error('Customer analytics error:', error)
    res.status(500).json({ message: 'Error fetching analytics' })
  }
})

// Customer Profile Routes
app.get('/api/customer/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password')
    res.status(200).json({ profile: user })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' })
  }
})

app.put('/api/customer/profile', async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body
    const updates = {}
    if (fullName !== undefined && fullName) updates.fullName = String(fullName).trim()
    if (email !== undefined && email) updates.email = String(email).trim().toLowerCase()
    if (phone !== undefined && phone) updates.phone = String(phone).trim()
    if (password && password.length >= 6) updates.password = await bcrypt.hash(password, 10)
    if (Object.keys(updates).length === 0) return res.status(200).json({ profile: await User.findById(req.user.userId).select('-password') })
    const profile = await User.findByIdAndUpdate(req.user.userId, updates, { new: true, runValidators: false }).select('-password')
    res.status(200).json({ message: 'Profile updated successfully', profile })
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile: ' + (error.message || 'unknown error') })
  }
})

// Customer Invoice Routes
app.get('/api/customer/invoices', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password')
    const invoices = await Invoice.find({ email: user.email }).sort({ date: -1 })
    res.status(200).json({ invoices })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoices' })
  }
})

app.get('/api/customer/invoices/:id', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password')
    const invoice = await Invoice.findOne({ _id: req.params.id, email: user.email })
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' })
    res.status(200).json({ invoice })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoice' })
  }
})

// Customer Wishlist Routes
app.get('/api/customer/wishlist', async (req, res) => {
  try {
    const items = await Wishlist.find({ customerId: req.user.userId }).sort({ addedAt: -1 })
    res.status(200).json({ wishlist: items })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wishlist' })
  }
})

app.post('/api/customer/wishlist', async (req, res) => {
  try {
    const { packageId, packageName, destination, price, image } = req.body
    const existing = await Wishlist.findOne({ customerId: req.user.userId, packageId })
    if (existing) return res.status(200).json({ message: 'Already in wishlist', wishlist: await Wishlist.find({ customerId: req.user.userId }).sort({ addedAt: -1 }) })
    const item = new Wishlist({ customerId: req.user.userId, packageId, packageName, destination, price, image })
    await item.save()
    res.status(201).json({ message: 'Added to wishlist', item, wishlist: await Wishlist.find({ customerId: req.user.userId }).sort({ addedAt: -1 }) })
  } catch (error) {
    res.status(500).json({ message: 'Error adding to wishlist' })
  }
})

app.delete('/api/customer/wishlist/:id', async (req, res) => {
  try {
    const item = await Wishlist.findOneAndDelete({ _id: req.params.id, customerId: req.user.userId })
    if (!item) return res.status(404).json({ message: 'Wishlist item not found' })
    res.status(200).json({ message: 'Removed from wishlist', wishlist: await Wishlist.find({ customerId: req.user.userId }).sort({ addedAt: -1 }) })
  } catch (error) {
    res.status(500).json({ message: 'Error removing from wishlist' })
  }
})

// Customer Itineraries Routes
app.get('/api/customer/itineraries', async (req, res) => {
  try {
    const publishedPackages = await Package.find({ publishedStatus: 'published', status: 'active' }).distinct('_id')
    const itineraries = await Itinerary.find({
      packageId: { $in: publishedPackages },
      status: 'active'
    }).sort({ createdAt: -1 })
    res.status(200).json({ itineraries })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching itineraries' })
  }
})

app.get('/api/customer/itineraries/package/:packageId', async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({
      packageId: req.params.packageId,
      status: 'active'
    })
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' })
    }
    res.status(200).json({ itinerary })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching itinerary' })
  }
})

// Customer Reviews Routes
app.get('/api/customer/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ customerId: req.user.userId }).sort({ date: -1 })
    res.status(200).json({ reviews })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews' })
  }
})

app.post('/api/customer/reviews', async (req, res) => {
  try {
    const { packageId, packageName, rating, comment } = req.body
    const user = await User.findById(req.user.userId).select('-password')
    
    let operatorId = null
    if (packageId) {
      try {
        const pkg = await Package.findById(packageId)
        if (pkg) operatorId = pkg.operatorId
      } catch (err) {
        const pkg = await Package.findOne({ name: packageId })
        if (pkg) operatorId = pkg.operatorId
      }
    } else if (packageName) {
      const pkg = await Package.findOne({ name: packageName })
      if (pkg) operatorId = pkg.operatorId
    }
    
    const reviewData = {
      customerId: req.user.userId,
      customer: user.fullName,
      package: packageName || '',
      rating: Number(rating),
      comment,
      status: 'approved',
      operatorId
    }
    if (packageId) {
      try {
        reviewData.packageId = new mongoose.Types.ObjectId(packageId)
      } catch (err) {
        // invalid ObjectId format, skip setting packageId
      }
    }
    const review = new Review(reviewData)
    await review.save()
    await new Notification({
      userId: req.user.userId,
      type: 'review',
      title: 'Review Submitted',
      message: `Your review for ${review.package || 'package'} has been submitted successfully.`,
      relatedId: review._id
    }).save()
    const pkg = await Package.findOne({ name: review.package }).lean();
    if (pkg?.operatorId && pkg.operatorId.toString() !== req.user.userId) {
      await new Notification({
        userId: pkg.operatorId,
        type: 'review',
        title: 'New Review Received',
        message: `${review.rating}⭐ review submitted for ${review.package || 'your package'}.`,
        relatedId: review._id
      }).save().catch(() => {});
    }
    res.status(201).json({ message: 'Review submitted', review })
  } catch (error) {
    console.error('Submit review error:', error)
    res.status(500).json({ message: 'Error submitting review', detail: error.message })
  }
})

app.put('/api/customer/reviews/:id', async (req, res) => {
  try {
    const { rating, comment } = req.body
    const review = await Review.findOneAndUpdate({ _id: req.params.id, customerId: req.user.userId }, { rating: Number(rating), comment }, { new: true })
    if (!review) return res.status(404).json({ message: 'Review not found' })
    res.status(200).json({ message: 'Review updated', review })
  } catch (error) {
    res.status(500).json({ message: 'Error updating review' })
  }
})

app.delete('/api/customer/reviews/:id', async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, customerId: req.user.userId })
    if (!review) return res.status(404).json({ message: 'Review not found' })
    res.status(200).json({ message: 'Review deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review' })
  }
})

// Customer Notifications Routes
app.get('/api/customer/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId }).sort({ createdAt: -1 }).limit(50)
    const unreadCount = await Notification.countDocuments({ userId: req.user.userId, read: false })
    res.status(200).json({ notifications, unreadCount })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' })
  }
})

app.put('/api/customer/notifications/:id/read', async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, { read: true }, { new: true })
    if (!notif) return res.status(404).json({ message: 'Notification not found' })
    res.status(200).json({ message: 'Marked as read', notification: notif })
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read' })
  }
})

app.put('/api/customer/notifications/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.userId, read: false }, { read: true })
    res.status(200).json({ message: 'All notifications marked as read' })
  } catch (error) {
    res.status(500).json({ message: 'Error marking all notifications as read' })
  }
})

app.delete('/api/customer/notifications/:id', async (req, res) => {
  try {
    const notif = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.userId })
    if (!notif) return res.status(404).json({ message: 'Notification not found' })
    res.status(200).json({ message: 'Notification deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification' })
  }
})

// Customer Bookings Create
app.post('/api/customer/bookings', async (req, res) => {
  try {
    const { package: packageName, hotelId, hotelName, customer, email, phone, dates, travelers, amount } = req.body
    if (!customer || !email || !dates || !amount) {
      return res.status(400).json({ message: 'customer, email, dates, and amount are required' })
    }
    const user = await User.findById(req.user.userId).select('-password')
    
    let operatorId = null
    if (req.body.packageId) {
      const pkg = await Package.findById(req.body.packageId)
      if (pkg) operatorId = pkg.operatorId
    } else if (packageName) {
      const pkg = await Package.findOne({ name: packageName })
      if (pkg) operatorId = pkg.operatorId
    }
    
    const booking = new Booking({
      customerId: req.user.userId,
      operatorId,
      bookingId: nextBookingId(),
      package: packageName || hotelName || 'Hotel Booking',
      packageId: req.body.packageId || undefined,
      hotelId: hotelId || undefined,
      hotelName: hotelName || undefined,
      customer: customer || user.fullName,
      email: email || user.email,
      phone: phone || user.phone,
      dates,
      travelers: travelers || 1,
      amount: Number(amount),
      status: 'pending',
      paymentStatus: 'pending',
      timeline: [{ status: 'booking_created', date: new Date(), note: 'Booking created by customer' }]
    })
    await booking.save()
    await new Notification({
      userId: req.user.userId,
      type: 'booking',
      title: 'Booking Confirmed',
      message: `Your booking for ${booking.package || 'package'} has been created successfully.`,
      relatedId: booking._id
    }).save()
    res.status(201).json({ message: 'Booking created successfully', booking })
  } catch (error) {
    console.error('Create booking error:', error)
    res.status(500).json({ message: 'Error creating booking', detail: error.message })
  }
})

// Hotel Partner Routes
app.use('/api/hotel', authenticate, requireHotelPartner);

// Hotel Profile Routes
app.get('/api/hotel/profile', async (req, res) => {
  try {
    let profile = await HotelPartnerProfile.findOne({ userId: req.user.userId });
    const user = await User.findById(req.user.userId).select('-password');
    res.status(200).json({ profile, user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

app.put('/api/hotel/profile', async (req, res) => {
  try {
    const { hotelName, address, city, state, country, postalCode, starRating,
            checkinTime, checkoutTime, website, description, amenities,
            registrationNumber, taxId, logo, password } = req.body;
    const updates = {};
    if (hotelName !== undefined) updates.hotelName = String(hotelName).trim();
    if (address !== undefined) updates.address = String(address).trim();
    if (city !== undefined) updates.city = String(city).trim();
    if (state !== undefined) updates.state = String(state).trim();
    if (country !== undefined) updates.country = String(country).trim();
    if (postalCode !== undefined) updates.postalCode = String(postalCode).trim();
    if (starRating !== undefined && starRating !== '' && starRating !== null) {
      const n = Number(starRating);
      if (!isNaN(n) && n >= 1 && n <= 5) updates.starRating = n;
    }
    if (checkinTime !== undefined) updates.checkinTime = String(checkinTime);
    if (checkoutTime !== undefined) updates.checkoutTime = String(checkoutTime);
    if (website !== undefined) updates.website = String(website).trim();
    if (description !== undefined) updates.description = String(description);
    if (amenities !== undefined) {
      updates.amenities = Array.isArray(amenities)
        ? amenities
        : String(amenities).split(',').map(s => s.trim()).filter(Boolean);
    }
    if (registrationNumber !== undefined) updates.registrationNumber = String(registrationNumber).trim();
    if (taxId !== undefined) updates.taxId = String(taxId).trim();
    if (logo !== undefined) updates.logo = String(logo);
    updates.updatedAt = new Date();

    const profile = await HotelPartnerProfile.findOneAndUpdate(
      { userId: req.user.userId },
      updates,
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: false }
    );

    const userUpdates = {};
    if (req.body.fullName !== undefined && req.body.fullName) userUpdates.fullName = String(req.body.fullName).trim();
    if (req.body.email !== undefined && req.body.email) userUpdates.email = String(req.body.email).trim().toLowerCase();
    if (req.body.phone !== undefined && req.body.phone) userUpdates.phone = String(req.body.phone).trim();
    if (password && password.length >= 6) {
      userUpdates.password = await bcrypt.hash(password, 10);
    }
    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(req.user.userId, userUpdates, { runValidators: false });
    }

    res.status(200).json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    console.error('Hotel profile update error:', error.message);
    res.status(500).json({ message: 'Error updating profile: ' + (error.message || 'unknown error') });
  }
});

// Hotel Settings Routes
app.get('/api/hotel/settings', async (req, res) => {
  try {
    let settings = await HotelSettings.findOne({ userId: req.user.userId });
    if (!settings) {
      settings = new HotelSettings({ userId: req.user.userId });
      await settings.save();
    }
    res.status(200).json({ settings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings' });
  }
});

app.put('/api/hotel/settings', async (req, res) => {
  try {
    const allowed = ['emailNotifications','smsNotifications','pushNotifications',
                      'bookingAlerts','paymentUpdates','reviewAlerts','guestNotifications',
                      'currency','language','timezone'];
    const updates = pickUpdates(req.body, allowed);
    updates.updatedAt = new Date();
    const settings = await HotelSettings.findOneAndUpdate(
      { userId: req.user.userId },
      updates,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(200).json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings' });
  }
});

// Hotel Dashboard Analytics
app.get('/api/hotel/analytics', async (req, res) => {
  try {
    const range = req.query.range || 'month';
    const since = rangeStart(range);
    const hotelName = req.query.hotelName || '';

    const allRooms = await Room.find({});
    const partnerRooms = allRooms.filter((r) => r.hotel === hotelName);
    const totalRooms = partnerRooms.reduce((sum, r) => sum + (r.total || 0), 0);
    const availableRooms = partnerRooms.reduce((sum, r) => sum + (r.available || 0), 0);
    const occupiedRooms = partnerRooms.reduce((sum, r) => sum + (r.booked || 0), 0);
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    const hotelBookings = await HotelBooking.find({ hotelPartnerId: req.user.userId });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = hotelBookings.filter(b => {
      const d = new Date(b.createdAt);
      return d >= today && d < tomorrow;
    }).length;

    const currentlyCheckedIn = hotelBookings.filter(b => b.status === 'checked_in').length;
    const pendingCheckouts = hotelBookings.filter(b => {
      if (b.status !== 'checked_in') return false;
      const out = new Date(b.checkOutDate);
      return out <= tomorrow;
    }).length;

    const paidBookings = hotelBookings.filter(b => b.paymentStatus === 'paid');
    const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.paidAmount || b.amount || 0), 0);

    const rangeBookings = hotelBookings.filter(b => new Date(b.createdAt) >= since);
    const rangeRevenue = rangeBookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (b.paidAmount || b.amount || 0), 0);

    const pendingPayments = hotelBookings
      .filter(b => ['pending', 'partial'].includes(b.paymentStatus))
      .reduce((sum, b) => sum + ((b.amount || 0) - (b.paidAmount || 0)), 0);

    const derivedRevenue = totalRevenue > 0
      ? totalRevenue
      : partnerRooms.reduce((sum, r) => sum + (r.booked || 0) * (r.price || 0), 0);

    const reviews = await Review.find({});
    const avgRating = reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : (Number(req.query.starRating) || 4.0);

    const recentBookings = await HotelBooking.find({ hotelPartnerId: req.user.userId })
      .sort({ createdAt: -1 }).limit(5);

    const recentReviews = await Review.find({})
      .sort({ date: -1 }).limit(5);

    // Today's check-ins and check-outs lists
    const todayCheckIns = hotelBookings
      .filter(b => b.checkInDate && new Date(b.checkInDate) >= today && new Date(b.checkInDate) < tomorrow)
      .sort((a, b) => new Date(a.checkInDate) - new Date(b.checkInDate));
    const todayCheckOuts = hotelBookings
      .filter(b => b.checkOutDate && new Date(b.checkOutDate) >= today && new Date(b.checkOutDate) < tomorrow)
      .sort((a, b) => new Date(a.checkOutDate) - new Date(b.checkOutDate));

    // Payment status breakdown
    const paymentBreakdown = {
      paid: hotelBookings.filter(b => b.paymentStatus === 'paid').length,
      partial: hotelBookings.filter(b => b.paymentStatus === 'partial').length,
      pending: hotelBookings.filter(b => b.paymentStatus === 'pending').length,
      refunded: hotelBookings.filter(b => b.paymentStatus === 'refunded').length
    };

    // Booking status breakdown
    const bookingStatus = {
      confirmed: hotelBookings.filter(b => b.status === 'confirmed').length,
      pending: hotelBookings.filter(b => b.status === 'pending').length,
      checked_in: hotelBookings.filter(b => b.status === 'checked_in').length,
      checked_out: hotelBookings.filter(b => b.status === 'checked_out').length,
      cancelled: hotelBookings.filter(b => b.status === 'cancelled').length
    };

    // Top performing rooms (by revenue)
    const roomRevenue = {};
    paidBookings.forEach(b => {
      const key = b.roomType || b.hotelName || 'Other';
      roomRevenue[key] = (roomRevenue[key] || 0) + (b.paidAmount || b.amount || 0);
    });
    const topRooms = Object.entries(roomRevenue)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);

    // 7-day revenue trend
    const revenueTrend = [];
    const bookingsTrend = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const dayBookings = hotelBookings.filter(b => {
        const d = new Date(b.createdAt);
        return d >= dayStart && d < dayEnd;
      });
      const dayRevenue = dayBookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + (b.paidAmount || b.amount || 0), 0);
      revenueTrend.push({
        label: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dayRevenue,
        bookings: dayBookings.length
      });
      bookingsTrend.push(dayBookings.length);
    }

    // Room type breakdown for charts
    const roomTypeBreakdown = partnerRooms.map(r => ({
      type: r.type,
      total: r.total || 0,
      available: r.available || 0,
      booked: r.booked || 0,
      price: r.price || 0
    }));

    // Alerts: unpaid > 7 days, low availability, no shows
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const overduePayments = hotelBookings.filter(b =>
      ['pending', 'partial'].includes(b.paymentStatus) &&
      new Date(b.createdAt) < sevenDaysAgo
    ).length;
    const lowAvailability = totalRooms > 0 && (availableRooms / totalRooms) < 0.2;

    const roomStatus = {
      available: availableRooms,
      occupied: occupiedRooms,
      maintenance: partnerRooms.filter(r => r.status === 'inactive').reduce((sum, r) => sum + (r.total || 0), 0),
      reserved: hotelBookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length
    };

    res.status(200).json({
      range,
      totalRooms,
      availableRooms,
      occupiedRooms,
      occupancyRate,
      todayBookings,
      currentlyCheckedIn,
      pendingCheckouts,
      revenue: derivedRevenue,
      totalRevenue,
      rangeRevenue,
      pendingPayments,
      avgRating: Number(avgRating.toFixed(1)),
      recentBookings,
      recentReviews,
      todayCheckIns,
      todayCheckOuts,
      paymentBreakdown,
      bookingStatus,
      topRooms,
      revenueTrend,
      bookingsTrend,
      roomTypeBreakdown,
      alerts: {
        overduePayments,
        lowAvailability
      },
      roomStatus,
      totalBookings: hotelBookings.length
    });
  } catch (error) {
    console.error('Hotel analytics error:', error);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
});

// Hotel Rooms (scoped by hotel name match)
app.get('/api/hotel/rooms', async (req, res) => {
  try {
    const profile = await HotelPartnerProfile.findOne({ userId: req.user.userId });
    const hotelName = req.query.hotelName || profile?.hotelName || '';
    if (!hotelName) {
      return res.status(200).json({ rooms: [], message: 'Set your hotel name in profile to see rooms' });
    }
    const rooms = await Room.find({ hotel: hotelName });
    res.status(200).json({ rooms });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms' });
  }
});

app.post('/api/hotel/rooms', async (req, res) => {
  try {
    const profile = await HotelPartnerProfile.findOne({ userId: req.user.userId });
    const hotelName = req.body.hotel || profile?.hotelName;
    if (!hotelName) {
      return res.status(400).json({ message: 'Hotel name required (set in profile or provide hotel field)' });
    }
    const newRoom = new Room({ ...req.body, hotel: hotelName });
    await newRoom.save();
    res.status(201).json({ message: 'Room created successfully', room: newRoom });
  } catch (error) {
    res.status(500).json({ message: 'Error creating room' });
  }
});

app.put('/api/hotel/rooms/:id', async (req, res) => {
  try {
    const profile = await HotelPartnerProfile.findOne({ userId: req.user.userId });
    const hotelName = profile?.hotelName;
    const updates = pickUpdates(req.body, ['type', 'total', 'available', 'booked', 'price', 'status']);
    const filter = hotelName ? { _id: req.params.id, hotel: hotelName } : { _id: req.params.id };
    const room = await Room.findOneAndUpdate(filter, updates, { new: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.status(200).json({ message: 'Room updated successfully', room });
  } catch (error) {
    res.status(500).json({ message: 'Error updating room' });
  }
});

app.delete('/api/hotel/rooms/:id', async (req, res) => {
  try {
    const profile = await HotelPartnerProfile.findOne({ userId: req.user.userId });
    const hotelName = profile?.hotelName;
    const filter = hotelName ? { _id: req.params.id, hotel: hotelName } : { _id: req.params.id };
    const room = await Room.findOneAndDelete(filter);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting room' });
  }
});

// Hotel Bookings
app.get('/api/hotel/bookings', async (req, res) => {
  try {
    const bookings = await HotelBooking.find({ hotelPartnerId: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

app.post('/api/hotel/bookings', async (req, res) => {
  try {
    const count = await HotelBooking.countDocuments();
    const now = new Date();
    const bookingId = `HB-${now.getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    const newBooking = new HotelBooking({
      ...req.body,
      hotelPartnerId: req.user.userId,
      bookingId,
      updatedAt: new Date()
    });
    await newBooking.save();
    await new Notification({
      userId: req.user.userId,
      type: 'booking',
      title: 'New Hotel Booking Received',
      message: `${newBooking.guestName || 'Guest'} booked ${newBooking.roomType || 'a room'} for ${newBooking.checkInDate || 'check-in'}.`,
      relatedId: newBooking._id
    }).save().catch(() => {});
    res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
  } catch (error) {
    res.status(500).json({ message: 'Error creating booking' });
  }
});

app.put('/api/hotel/bookings/:id', async (req, res) => {
  try {
    const updates = pickUpdates(req.body, [
      'guestName', 'guestEmail', 'guestPhone', 'checkInDate', 'checkOutDate',
      'guests', 'rooms', 'amount', 'paidAmount', 'status', 'paymentStatus', 'roomType'
    ]);
    updates.updatedAt = new Date();
    const booking = await HotelBooking.findOneAndUpdate(
      { _id: req.params.id, hotelPartnerId: req.user.userId },
      updates,
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status === 'confirmed' || booking.status === 'pending') {
      await new Notification({
        userId: req.user.userId,
        type: 'booking',
        title: 'Booking Updated',
        message: `${booking.guestName || 'Guest'} booking status updated to '${booking.status}'.`,
        relatedId: booking._id
      }).save().catch(() => {});
    }
    res.status(200).json({ message: 'Booking updated successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking' });
  }
});

app.delete('/api/hotel/bookings/:id', async (req, res) => {
  try {
    const booking = await HotelBooking.findOneAndDelete({ _id: req.params.id, hotelPartnerId: req.user.userId });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting booking' });
  }
});

// Hotel Guests (returns distinct guests from bookings + their stats)
app.get('/api/hotel/guests', async (req, res) => {
  try {
    const bookings = await HotelBooking.find({ hotelPartnerId: req.user.userId });
    const map = new Map();
    bookings.forEach((b) => {
      const key = b.guestEmail || b.guestName;
      if (!map.has(key)) {
        map.set(key, {
          name: b.guestName,
          email: b.guestEmail,
          phone: b.guestPhone,
          totalStays: 0,
          totalSpent: 0,
          lastStay: null
        });
      }
      const g = map.get(key);
      g.totalStays += 1;
      g.totalSpent += b.paidAmount || b.amount || 0;
      const stayDate = new Date(b.checkOutDate || b.createdAt);
      if (!g.lastStay || stayDate > new Date(g.lastStay)) g.lastStay = stayDate;
    });
    res.status(200).json({ guests: Array.from(map.values()) });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching guests' });
  }
});

// Hotel Reviews (all reviews not tied to a tour operator)
app.get('/api/hotel/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({}).sort({ date: -1 });
    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

app.put('/api/hotel/reviews/:id/respond', async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { response: { text: req.body.response, date: new Date() } },
      { new: true }
    );
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.status(200).json({ message: 'Response added', review });
  } catch (error) {
    res.status(500).json({ message: 'Error responding to review' });
  }
});

app.put('/api/hotel/reviews/:id/status', async (req, res) => {
  try {
    const updates = pickUpdates(req.body, ['status']);
    const review = await Review.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    await refreshPackageRating(review.package);
    res.status(200).json({ message: 'Review status updated', review });
  } catch (error) {
    res.status(500).json({ message: 'Error updating review status' });
  }
});

app.delete('/api/hotel/reviews/:id', async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    await refreshPackageRating(review.package);
    res.status(200).json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review' });
  }
});

// Hotel Booking payment recording
app.put('/api/hotel/bookings/:id/pay', async (req, res) => {
  try {
    const { amount } = req.body;
    const booking = await HotelBooking.findOne({ _id: req.params.id, hotelPartnerId: req.user.userId });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const additional = Number(amount) || 0;
    if (additional <= 0) return res.status(400).json({ message: 'Amount must be greater than zero' });
    booking.paidAmount = (booking.paidAmount || 0) + additional;
    if (booking.paidAmount >= booking.amount) {
      booking.paymentStatus = 'paid';
      if (booking.status === 'pending') booking.status = 'confirmed';
    } else if (booking.paidAmount > 0) {
      booking.paymentStatus = 'partial';
    }
    booking.updatedAt = new Date();
    await booking.save();
    res.status(200).json({ message: 'Payment recorded', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error recording payment' });
  }
});

// Bulk availability update
app.put('/api/hotel/availability/bulk', async (req, res) => {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: 'updates array required' });
    }
    const results = await Promise.all(updates.map(async (u) => {
      if (!u.id) return null;
      const room = await Room.findByIdAndUpdate(
        u.id,
        {
          ...(u.available !== undefined ? { available: Number(u.available) } : {}),
          ...(u.total !== undefined ? { total: Number(u.total) } : {}),
          ...(u.price !== undefined ? { price: Number(u.price) } : {}),
          ...(u.status !== undefined ? { status: u.status } : {})
        },
        { new: true }
      );
      return room;
    }));
    res.status(200).json({ message: 'Bulk update complete', rooms: results.filter(Boolean) });
  } catch (error) {
    res.status(500).json({ message: 'Error in bulk update' });
  }
});

// Hotel Revenue
app.get('/api/hotel/revenue', async (req, res) => {
  try {
    const range = req.query.range || 'month';
    const since = rangeStart(range);
    const all = await HotelBooking.find({ hotelPartnerId: req.user.userId, paymentStatus: 'paid' });
    const totalRevenue = all.reduce((sum, b) => sum + (b.paidAmount || b.amount || 0), 0);
    const rangeBookings = all.filter(b => new Date(b.createdAt) >= since);
    const rangeRevenue = rangeBookings.reduce((sum, b) => sum + (b.paidAmount || b.amount || 0), 0);

    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date();
      start.setMonth(start.getMonth() - i, 1); start.setHours(0,0,0,0);
      const end = new Date(start); end.setMonth(end.getMonth() + 1);
      const sum = all
        .filter(b => new Date(b.createdAt) >= start && new Date(b.createdAt) < end)
        .reduce((s, b) => s + (b.paidAmount || b.amount || 0), 0);
      monthlyRevenue.push(sum);
    }

    res.status(200).json({ totalRevenue, rangeRevenue, monthlyRevenue, totalBookings: all.length });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching revenue' });
  }
});

// Hotel Notifications
app.get('/api/hotel/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId })
      .sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ userId: req.user.userId, read: false });
    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

app.put('/api/hotel/notifications/:id/read', async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { read: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ message: 'Notification not found' });
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read' });
  }
});

app.put('/api/hotel/notifications/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.userId, read: false }, { read: true });
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking all notifications as read' });
  }
});

// Hotel Pricing (seasonal overrides)
app.get('/api/hotel/pricing', async (req, res) => {
  try {
    const profile = await HotelPartnerProfile.findOne({ userId: req.user.userId });
    const hotelName = req.query.hotelName || profile?.hotelName || '';
    const rooms = await Room.find({ hotel: hotelName });
    res.status(200).json({ rooms, hotelName });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pricing' });
  }
});

app.put('/api/hotel/pricing/:roomId', async (req, res) => {
  try {
    const profile = await HotelPartnerProfile.findOne({ userId: req.user.userId });
    const hotelName = profile?.hotelName;
    const filter = hotelName ? { _id: req.params.roomId, hotel: hotelName } : { _id: req.params.roomId };
    const updates = pickUpdates(req.body, ['price', 'status']);
    const room = await Room.findOneAndUpdate(filter, updates, { new: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.status(200).json({ message: 'Price updated', room });
  } catch (error) {
    res.status(500).json({ message: 'Error updating price' });
  }
});

// Hotel Availability (current room counts)
app.get('/api/hotel/availability', async (req, res) => {
  try {
    const profile = await HotelPartnerProfile.findOne({ userId: req.user.userId });
    const hotelName = req.query.hotelName || profile?.hotelName || '';
    const rooms = await Room.find({ hotel: hotelName });
    res.status(200).json({ rooms, hotelName });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching availability' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
