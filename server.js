import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

function normalizeCorsOrigin(origin) {
  if (!origin) return undefined;
  try {
    const url = new URL(origin);
    if (url.protocol === 'https:' || url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      return origin;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

const jwtSecret = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET not set — using ephemeral fallback. Set this in production environment.');
}

app.use(cors({
  origin: (origin, callback) => {
    const allowed = normalizeCorsOrigin(origin);
    callback(null, allowed);
  },
  credentials: true,
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
    required: true
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
    required: true
  },
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
    required: true
  },
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
    req.user = jwt.verify(token, jwtSecret);
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
      jwtSecret,
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

// In-memory OTP store (email → { otp, expiresAt })
const otpStore = new Map();

// Helper: send email via Brevo SMTP relay
async function sendEmailViaBrevo(to, subject, htmlContent) {
  const smtpUser = process.env.BREVO_SMTP_USER || 'b9e61a001@smtp-brevo.com';
  const smtpKey = process.env.BREVO_SMTP_KEY || process.env.BREVO_API_KEY;
  if (!smtpKey) {
    throw new Error('BREVO_SMTP_KEY or BREVO_API_KEY not configured');
  }
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@traveltour.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'Travel Tour';

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: smtpUser,
      pass: smtpKey,
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
  });

  const info = await transporter.sendMail({
    from: `"${senderName}" <${senderEmail}>`,
    to: to,
    subject: subject,
    html: htmlContent,
  });

  return { messageId: info.messageId };
 }

// Forgot Password Route — sends OTP to user email
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    const html = `<p>Your Travel Tour password reset OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`;
    const smtpKey = process.env.BREVO_SMTP_KEY || process.env.BREVO_API_KEY;
    let emailOk = false;
    if (smtpKey) {
      try {
        await sendEmailViaBrevo(user.email, 'Password Reset OTP', html);
        emailOk = true;
      } catch (emailErr) {
        console.error('Email send error:', emailErr.message);
      }
    } else {
      console.error('[WARN] BREVO_SMTP_KEY not set — OTP is: ' + otp);
    }

    console.log(`[FORGOT PASSWORD] OTP for ${email}: ${otp}`);
    if (!emailOk) {
      return res.status(200).json({
        message: 'OTP generated. Email not sent (Brevo misconfigured) — use this test OTP: ' + otp,
      });
    }
    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
});

// Verify OTP Route
app.post('/api/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = otpStore.get(email);
    if (!record) {
      return res.status(400).json({ message: 'OTP not found or expired. Request a new one.' });
    }
    if (record.expiresAt < Date.now()) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP expired. Request a new one.' });
    }
    if (record.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
});

// Reset Password Route
app.post('/api/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const record = otpStore.get(email);
    if (!record) {
      return res.status(400).json({ message: 'OTP not found or expired. Request a new one.' });
    }
    if (record.expiresAt < Date.now()) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP expired. Request a new one.' });
    }
    if (record.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    otpStore.delete(email);

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
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
    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user' });
  }
});

app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
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
    const newPackage = new Package(req.body);
    await newPackage.save();
    res.status(201).json({ message: 'Package created successfully', package: newPackage });
  } catch (error) {
    res.status(500).json({ message: 'Error creating package' });
  }
});

app.put('/api/admin/packages/:id', async (req, res) => {
  try {
    const updates = pickUpdates(req.body, ['name', 'destination', 'duration', 'price', 'rating', 'bookings', 'status', 'description', 'inclusions', 'image']);
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
    res.status(200).json({ message: 'Booking updated successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking' });
  }
});

app.delete('/api/admin/bookings/:id', async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
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
    res.status(200).json({ message: 'Review updated successfully', review });
  } catch (error) {
    res.status(500).json({ message: 'Error updating review' });
  }
});

app.delete('/api/admin/reviews/:id', async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
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
    res.status(200).json({ message: 'Coupon updated successfully', coupon });
  } catch (error) {
    res.status(500).json({ message: 'Error updating coupon' });
  }
});

app.delete('/api/admin/coupons/:id', async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
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

    const topTours = await Package.find({}).sort({ bookings: -1, price: -1 }).limit(5).lean();
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

    res.status(200).json({
      totalUsers,
      activeTours,
      partnerHotels,
      totalBookings,
      totalRevenue,
      avgRating: Number(avgRating.toFixed(1)),
      bookingStats,
      topTours: topTours.map((pkg) => ({
        name: pkg.name,
        bookings: pkg.bookings || 0,
        revenue: (pkg.bookings || 0) * (pkg.price || 0)
      })),
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
        status: booking.status
      })),
      rooms: roomSummary[0] || { total: 0, available: 0, booked: 0 },
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

// Tour Operator Routes
app.use('/api/operator', authenticate, requireTourOperator);

// Operator Profile Routes
app.get('/api/operator/profile', async (req, res) => {
  try {
    let profile = await OperatorProfile.findOne({ userId: req.user.userId });
    if (!profile) {
      profile = new OperatorProfile({ userId: req.user.userId });
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
    const packages = await Package.find({ operatorId: req.user.userId }).sort({ createdAt: -1 });
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
    const bookings = await Booking.find({ operatorId: req.user.userId }).sort({ bookingDate: -1 });
    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

app.get('/api/operator/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, operatorId: req.user.userId });
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
    const updates = pickUpdates(req.body, ['status', 'paymentStatus']);
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, operatorId: req.user.userId },
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
    const bookings = await Booking.find({ operatorId: req.user.userId });
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
    
    const bookings = await Booking.find({ customerId: req.params.id, operatorId: req.user.userId });
    const reviews = await Review.find({ customerId: req.params.id, operatorId: req.user.userId });
    
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
    const reviews = await Review.find({ operatorId: req.user.userId }).sort({ date: -1 });
    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

app.put('/api/operator/reviews/:id/respond', async (req, res) => {
  try {
    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, operatorId: req.user.userId },
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
    
    const bookings = await Booking.find({ operatorId: req.user.userId, paymentStatus: 'paid' });
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.paidAmount || b.amount), 0);
    
    const rangeBookings = await Booking.find({ 
      operatorId: req.user.userId, 
      paymentStatus: 'paid',
      bookingDate: { $gte: since } 
    });
    const rangeRevenue = rangeBookings.reduce((sum, b) => sum + (b.paidAmount || b.amount), 0);
    
    const pendingBookings = await Booking.find({ 
      operatorId: req.user.userId, 
      paymentStatus: { $in: ['pending', 'partial'] } 
    });
    const pendingRevenue = pendingBookings.reduce((sum, b) => sum + (b.amount - (b.paidAmount || 0)), 0);
    
    const refundedBookings = await Booking.find({ 
      operatorId: req.user.userId, 
      paymentStatus: 'refunded' 
    });
    const refundedRevenue = refundedBookings.reduce((sum, b) => sum + b.amount, 0);
    
    // Revenue by package
    const revenueByPackage = await Booking.aggregate([
      { $match: { operatorId: mongoose.Types.ObjectId(req.user.userId), paymentStatus: 'paid' } },
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
        operatorId: req.user.userId,
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
