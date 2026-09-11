import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  increment,
  query,
  orderBy
} from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Firestore from config
let db = null;
let firebaseConfig = null;

try {
  const configPath = path.join(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    console.log(`[Firestore] Initialized with project ${firebaseConfig.projectId} and database ${firebaseConfig.firestoreDatabaseId}`);
  } else {
    console.warn('[Firestore] firebase-applet-config.json not found.');
  }
} catch (err) {
  console.error('[Firestore] Initialization error:', err);
}

// -----------------------------------------------------------------------------
// REST API FOR BOOK REVIEWS (FIRESTORE)
// -----------------------------------------------------------------------------

// GET all reviews
app.get('/api/reviews', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }

    const reviewsColl = collection(db, 'reviews');
    let snapshot;
    try {
      const q = query(reviewsColl, orderBy('timestamp', 'desc'));
      snapshot = await getDocs(q);
    } catch (queryErr) {
      // Fallback without ordering in case index is not built
      snapshot = await getDocs(reviewsColl);
    }

    const reviews = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      reviews.push({
        id: docSnap.id,
        ...data
      });
    });

    // Sort descending by timestamp in-memory if needed
    reviews.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    return res.json(reviews);
  } catch (error) {
    console.error('[API /api/reviews GET] Error fetching reviews:', error);
    return res.status(500).json({ error: 'Failed to retrieve reviews from database' });
  }
});

// POST a new review
app.post('/api/reviews', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }

    const {
      bookTitle,
      reviewerName,
      reviewerAffiliation,
      rating,
      title,
      content,
      avatarColor
    } = req.body;

    // Validate required fields
    if (!bookTitle || !reviewerName || !rating || !title || !content) {
      return res.status(400).json({ error: 'Missing required review fields' });
    }

    const parsedRating = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));

    // Determine book category
    let bookCategory = 'general';
    const lowerTitle = String(bookTitle).toLowerCase();
    if (lowerTitle.includes('arjun') || lowerTitle.includes('navrang')) {
      bookCategory = 'arjun';
    } else if (lowerTitle.includes('files') || lowerTitle.includes('case')) {
      bookCategory = 'files';
    }

    const validColors = ['gold', 'blue', 'crimson', 'green'];
    const chosenColor = validColors.includes(avatarColor) ? avatarColor : 'gold';

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const newReview = {
      bookCategory,
      bookTitle: String(bookTitle).trim().slice(0, 150),
      reviewerName: String(reviewerName).trim().slice(0, 80),
      reviewerAffiliation: String(reviewerAffiliation || 'Archive Chronicler').trim().slice(0, 80),
      avatarColor: chosenColor,
      rating: parsedRating,
      date: formattedDate,
      timestamp: Date.now(),
      title: String(title).trim().slice(0, 150),
      content: String(content).trim().slice(0, 3000),
      helpfulCount: 0,
      verified: true
    };

    const docRef = await addDoc(collection(db, 'reviews'), newReview);

    return res.status(201).json({
      id: docRef.id,
      ...newReview
    });
  } catch (error) {
    console.error('[API /api/reviews POST] Error creating review:', error);
    return res.status(500).json({ error: 'Failed to record review in database' });
  }
});

// POST increment helpful count
app.post('/api/reviews/:id/helpful', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }

    const { id } = req.params;
    const docRef = doc(db, 'reviews', id);
    await updateDoc(docRef, {
      helpfulCount: increment(1)
    });

    return res.json({ success: true, id });
  } catch (error) {
    console.error(`[API /api/reviews/${req.params.id}/helpful] Error:`, error);
    return res.status(500).json({ error: 'Failed to increment endorsement count' });
  }
});

// DELETE a review
app.delete('/api/reviews/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }

    const { id } = req.params;
    await deleteDoc(doc(db, 'reviews', id));
    return res.json({ success: true, id });
  } catch (error) {
    console.error(`[API /api/reviews/${req.params.id} DELETE] Error:`, error);
    return res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: db ? 'connected' : 'disconnected',
    project: firebaseConfig?.projectId || null
  });
});

// Serve static assets from project root
app.use(express.static(__dirname));

// Serve index.html for root or fallback routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`The Restricted Section server running on http://0.0.0.0:${PORT}`);
});
