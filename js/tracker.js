import { trackingEnabled } from './firebase-config.js';
import { getFirebaseClient } from './firebase-client.js';

async function trackVisitor() {
    // Tracking is opt-in, and respects the browser's privacy preference.
    if (!trackingEnabled || navigator.doNotTrack === '1') return;
    try {
        const client = await getFirebaseClient();
        if (!client) return;
        await client.firestore.addDoc(client.firestore.collection(client.db, 'visitors'), {
            page: window.location.pathname,
            time: client.firestore.serverTimestamp()
        });
    } catch {
        console.warn('Không thể ghi nhận lượt truy cập.');
    }
}

trackVisitor();
