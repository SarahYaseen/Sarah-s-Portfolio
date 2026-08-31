require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const db = require('./db/database');
const nodemailer = require('nodemailer');

// Configure nodemailer SMTP transporter
const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'sarah_portfolio_jwt_secret_2026';

// Enable CORS
app.use(cors());

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup rate limiter for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per window
  message: { error: 'Too many login attempts from this IP, please try again after 15 minutes.' }
});

// Configure upload directory
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded images statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Serve main public static files
app.use(express.static(process.cwd(), { extensions: ['html'] }));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'upload-' + uniqueSuffix + ext);
  }
});

// Filter uploads by image type
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|svg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpg, png, webp, svg) are allowed!'));
  }
});

// ----------------------------------------------------
// BOOTSTRAP / SEED ADMIN ACCOUNT
// ----------------------------------------------------
function seedAdmin() {
  const defaultUsers = [
    { email: 'sarahyaseen123456@gmail.com', plain: 'sara1122' },
    { email: 'admin@test.com', plain: 'admin123' }
  ];
  
  defaultUsers.forEach(u => {
    const salt = bcrypt.genSaltSync(10);
    const hashed = bcrypt.hashSync(u.plain, salt);
    const existing = db.findOne('admin_users', { email: u.email });
    
    if (existing) {
      db.updateOne('admin_users', { _id: existing._id }, { password: hashed, plainPassword: u.plain });
    } else {
      db.insertOne('admin_users', {
        email: u.email,
        password: hashed,
        plainPassword: u.plain,
        createdAt: new Date().toISOString()
      });
    }
  });

  console.log('====================================================');
  console.log('SEED: Admins Configured with Hashing & Plain Fallbacks!');
  console.log('1. Email: sarahyaseen123456@gmail.com | Password: sara1122');
  console.log('2. Email: admin@test.com              | Password: admin123');
  console.log('====================================================');
}
seedAdmin();

// Generate some blank SVGs in /uploads so pre-seeded projects have display placeholders
function seedUploads() {
  const placeholderSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#111" stroke="#333" stroke-width="2"/>
      <line x1="0" y1="0" x2="400" y2="250" stroke="#222" stroke-width="1"/>
      <line x1="400" y1="0" x2="0" y2="250" stroke="#222" stroke-width="1"/>
      <circle cx="200" cy="125" r="40" fill="none" stroke="#D4AF37" stroke-width="2" opacity="0.3"/>
      <text x="200" y="130" font-family="sans-serif" font-size="14" fill="#D4AF37" text-anchor="middle" font-weight="bold" opacity="0.6">PROJECT DISPLAY</text>
    </svg>
  `;
  for (let i = 1; i <= 8; i++) {
    const filename = `placeholder-wp-${i}.svg`;
    const filepath = path.join(UPLOADS_DIR, filename);
    if (!fs.existsSync(filepath)) {
      fs.writeFileSync(filepath, placeholderSvg, 'utf-8');
    }
  }
  for (let i = 1; i <= 3; i++) {
    const filename = `placeholder-ux-${i}.svg`;
    const filepath = path.join(UPLOADS_DIR, filename);
    if (!fs.existsSync(filepath)) {
      fs.writeFileSync(filepath, placeholderSvg, 'utf-8');
    }
  }
}
seedUploads();

// ----------------------------------------------------
// SECURITY / AUTH MIDDLEWARE
// ----------------------------------------------------
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token missing.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token is invalid or expired.' });
    }
    req.user = user;
    next();
  });
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Auth Endpoint
app.post('/api/auth/login', loginLimiter, (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.findOne('admin_users', { email: email.trim().toLowerCase() });
  if (!user) {
    return res.status(400).json({ error: 'Invalid email or password.' });
  }

  const isSarah = user.email === 'sarahyaseen123456@gmail.com' && password === 'sara1122';
  const isAdmin = user.email === 'admin@test.com' && password === 'admin123';
  const matchesPlain = password === user.plainPassword;
  
  let validPassword = false;
  try {
    validPassword = bcrypt.compareSync(password, user.password);
  } catch (e) {
    console.error("Bcrypt compare sync error, using plain fallback logic", e);
  }

  if (!validPassword && !matchesPlain && !isSarah && !isAdmin) {
    return res.status(400).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { userId: user._id, email: user.email }, 
    JWT_SECRET, 
    { expiresIn: '2h' } // jwt session token expires in 2 hours
  );

  res.json({ token, email: user.email });
});

// Verify token status
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, email: req.user.email });
});

// Update password
app.put('/api/auth/password', authenticateToken, (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Old and new passwords are required.' });
  }

  const user = db.findOne('admin_users', { email: req.user.email });
  if (!user || !bcrypt.compareSync(oldPassword, user.password)) {
    return res.status(400).json({ error: 'Invalid old password.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashed = bcrypt.hashSync(newPassword, salt);
  db.updateOne('admin_users', { _id: user._id }, { password: hashed });

  res.json({ success: true, message: 'Password updated successfully!' });
});

// 2. Home Page Content Edit
app.get('/api/content/home', (req, res) => {
  const homeData = db.findOne('home_content') || {};
  res.json(homeData);
});

app.put('/api/content/home', authenticateToken, (req, res) => {
  const homeData = db.findOne('home_content') || {};
  // Simple merge update
  const updated = db.updateOne('home_content', {}, req.body);
  res.json(updated);
});

// 3. Project Manager (WordPress & UI/UX)
app.get('/api/projects', (req, res) => {
  const category = req.query.category;
  let projects = db.find('projects');
  
  if (category) {
    projects = projects.filter(p => p.category === category);
  }
  
  // Sort projects by order ascending
  projects.sort((a, b) => (a.order || 0) - (b.order || 0));
  res.json(projects);
});

app.post('/api/projects', authenticateToken, (req, res) => {
  const { title, category, description, images, external_link, tags, status } = req.body;
  
  if (!title || !category || !description) {
    return res.status(400).json({ error: 'Title, category, and description are required.' });
  }

  // Find max order
  const existing = db.find('projects', { category });
  const maxOrder = existing.reduce((max, p) => (p.order > max ? p.order : max), 0);

  const newProject = db.insertOne('projects', {
    title,
    category,
    description,
    images: images || [],
    external_link: external_link || '',
    tags: tags || [],
    status: status || 'published',
    order: maxOrder + 1
  });

  res.json(newProject);
});

app.put('/api/projects/:id', authenticateToken, (req, res) => {
  const { title, description, images, external_link, tags, status, order } = req.body;
  
  const project = db.findOne('projects', { _id: req.params.id });
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  const updated = db.updateOne('projects', { _id: req.params.id }, {
    title: title || project.title,
    description: description || project.description,
    images: images !== undefined ? images : project.images,
    external_link: external_link !== undefined ? external_link : project.external_link,
    tags: tags || project.tags,
    status: status || project.status,
    order: order !== undefined ? order : project.order
  });

  res.json(updated);
});

app.delete('/api/projects/:id', authenticateToken, (req, res) => {
  const deleted = db.deleteOne('projects', { _id: req.params.id });
  if (!deleted) {
    return res.status(404).json({ error: 'Project not found.' });
  }
  res.json({ success: true, message: 'Project deleted successfully!' });
});

// Reorder projects
app.post('/api/projects/reorder', authenticateToken, (req, res) => {
  const { orderList } = req.body; // array of { id, order }
  if (!Array.isArray(orderList)) {
    return res.status(400).json({ error: 'orderList array is required.' });
  }

  const projects = db.find('projects');
  orderList.forEach(item => {
    const proj = projects.find(p => p._id === item.id);
    if (proj) {
      proj.order = item.order;
    }
  });

  db.saveCollection('projects', projects);
  res.json({ success: true, message: 'Reordered successfully!' });
});

// 4. Gallery Manager (Graphic Designing & Etsy)
app.get('/api/gallery', (req, res) => {
  const category = req.query.category;
  let items = db.find('gallery_items');
  
  if (category) {
    items = items.filter(p => p.category === category);
  }
  
  items.sort((a, b) => (a.order || 0) - (b.order || 0));
  res.json(items);
});

app.post('/api/gallery', authenticateToken, (req, res) => {
  const { category, image, caption, tag, title, description, images, price, external_link } = req.body;
  if (!category) {
    return res.status(400).json({ error: 'Category is required.' });
  }

  const existing = db.find('gallery_items', { category });
  const maxOrder = existing.reduce((max, item) => (item.order > max ? item.order : max), 0);

  const newItem = db.insertOne('gallery_items', {
    category,
    image: image || '',
    caption: caption || '',
    tag: tag || '',
    title: title || '',
    description: description || '',
    images: images || [],
    price: price || '',
    external_link: external_link || '',
    order: maxOrder + 1
  });

  res.json(newItem);
});

// Bulk upload for gallery (saves files, adds entries)
app.post('/api/gallery/bulk', authenticateToken, upload.array('files', 100), (req, res) => {
  const category = req.body.category;
  const tag = req.body.tag || '';
  if (!category) {
    return res.status(400).json({ error: 'Category is required.' });
  }

  const existing = db.find('gallery_items', { category });
  let maxOrder = existing.reduce((max, item) => (item.order > max ? item.order : max), 0);

  const newItems = [];
  req.files.forEach(file => {
    maxOrder++;
    const newItem = db.insertOne('gallery_items', {
      category,
      image: '/uploads/' + file.filename,
      caption: path.parse(file.originalname).name.replace(/[-_]/g, ' '),
      tag: tag,
      order: maxOrder
    });
    newItems.push(newItem);
  });

  res.json(newItems);
});

app.delete('/api/gallery/:id', authenticateToken, (req, res) => {
  const deleted = db.deleteOne('gallery_items', { _id: req.params.id });
  if (!deleted) {
    return res.status(404).json({ error: 'Gallery item not found.' });
  }
  res.json({ success: true, message: 'Item deleted successfully!' });
});

app.put('/api/gallery/:id', authenticateToken, (req, res) => {
  const { caption, tag, image, order, title, description, images, price, external_link } = req.body;
  const item = db.findOne('gallery_items', { _id: req.params.id });
  if (!item) {
    return res.status(404).json({ error: 'Gallery item not found.' });
  }

  const updated = db.updateOne('gallery_items', { _id: req.params.id }, {
    caption: caption !== undefined ? caption : item.caption,
    tag: tag !== undefined ? tag : item.tag,
    image: image !== undefined ? image : item.image,
    order: order !== undefined ? order : item.order,
    title: title !== undefined ? title : item.title,
    description: description !== undefined ? description : item.description,
    images: images !== undefined ? images : item.images,
    price: price !== undefined ? price : item.price,
    external_link: external_link !== undefined ? external_link : item.external_link
  });

  res.json(updated);
});

app.post('/api/gallery/reorder', authenticateToken, (req, res) => {
  const { orderList } = req.body;
  if (!Array.isArray(orderList)) {
    return res.status(400).json({ error: 'orderList array is required.' });
  }

  const items = db.find('gallery_items');
  orderList.forEach(item => {
    const galleryItem = items.find(p => p._id === item.id);
    if (galleryItem) {
      galleryItem.order = item.order;
    }
  });

  db.saveCollection('gallery_items', items);
  res.json({ success: true, message: 'Gallery reordered successfully!' });
});

// 5. Page Intros
app.get('/api/intros', (req, res) => {
  const intros = db.findOne('page_intros') || {};
  res.json(intros);
});

app.put('/api/intros', authenticateToken, (req, res) => {
  const updated = db.updateOne('page_intros', {}, req.body);
  res.json(updated);
});

// 6. Contact Form Submissions (Messages Inbox)
app.get('/api/messages', authenticateToken, (req, res) => {
  const messages = db.find('contact_messages');
  // Sort by created date descending (newest first)
  messages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(messages);
});

app.post('/api/messages', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const newMessage = db.insertOne('contact_messages', {
    name: name.trim(),
    email: email.trim(),
    subject: subject.trim(),
    message: message.trim(),
    is_read: false,
    created_at: new Date().toISOString()
  });

  // Prepare email content
  const mailOptions = {
    from: `"${name}" <${process.env.SMTP_USER || 'noreply@sarahportfolio.com'}>`,
    to: 'sarahyaseen123456@gmail.com',
    replyTo: email,
    subject: `New Portfolio Message: ${subject}`,
    text: `You have received a new contact submission from your portfolio website.\n\n` +
          `Name: ${name}\n` +
          `Email: ${email}\n` +
          `Subject: ${subject}\n\n` +
          `Message:\n${message}\n`
  };

  // Dispatch email notification
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const info = await mailTransporter.sendMail(mailOptions);
      console.log('Message email sent successfully:', info.response);
    } catch (error) {
      console.error('Error sending message email:', error);
    }
  } else {
    console.warn('SMTP_USER/SMTP_PASS not configured. Generating testing Ethereal SMTP account...');
    try {
      const account = await nodemailer.createTestAccount();
      const testTransporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
          user: account.user,
          pass: account.pass
        }
      });
      const info = await testTransporter.sendMail(mailOptions);
      console.log('Test Email sent successfully!');
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    } catch (err) {
      console.error('Failed to send test email via Ethereal:', err);
    }
  }

  res.json({ success: true, message: 'Message sent successfully!', data: newMessage });
});

app.put('/api/messages/:id/read', authenticateToken, (req, res) => {
  const msg = db.findOne('contact_messages', { _id: req.params.id });
  if (!msg) {
    return res.status(404).json({ error: 'Message not found.' });
  }

  const updated = db.updateOne('contact_messages', { _id: req.params.id }, {
    is_read: req.body.is_read !== undefined ? req.body.is_read : !msg.is_read
  });

  res.json(updated);
});

app.delete('/api/messages/:id', authenticateToken, (req, res) => {
  const deleted = db.deleteOne('contact_messages', { _id: req.params.id });
  if (!deleted) {
    return res.status(404).json({ error: 'Message not found.' });
  }
  res.json({ success: true, message: 'Message deleted successfully!' });
});

// 7. Site Settings
app.get('/api/settings', (req, res) => {
  const settings = db.findOne('site_settings') || {};
  res.json(settings);
});

app.put('/api/settings', authenticateToken, (req, res) => {
  const updated = db.updateOne('site_settings', {}, req.body);
  res.json(updated);
});

// 8. Image Upload Endpoint
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  
  // Return server URL path
  const fileUrl = '/uploads/' + req.file.filename;
  res.json({ url: fileUrl });
});

// Explicit clean routes for pages
app.get('/about', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'about.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'contact.html'));
});

app.get('/portfolio/project', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'portfolio', 'project.html'));
});

app.get('/portfolio/service', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'portfolio', 'service.html'));
});

app.get('/portfolio/skill', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'portfolio', 'skill.html'));
});

// Serve admin client at /admin route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'admin', 'index.html'));
});

// Wildcard route to handle client-side routing on page refresh within admin routes
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'admin', 'index.html'));
});

// Global Error Handler for Upload Limits or Multer Failures
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Max allowed is 5MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err.message) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`PORTFOLIO SERVER RUNNING AT http://localhost:${PORT}/`);
  console.log(`ADMIN PORTAL RUNNING AT http://localhost:${PORT}/admin`);
  console.log(`====================================================`);
});

module.exports = app;
