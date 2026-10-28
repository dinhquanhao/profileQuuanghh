import { firebaseConfig } from './firebase-config.js';

export async function getFirebaseClient() {
    if (!firebaseConfig?.apiKey || !firebaseConfig?.projectId || !firebaseConfig?.appId) return null;
    const [app, firestore, auth] = await Promise.all([
        import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'),
        import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js')
    ]);
    const instance = app.getApps().length ? app.getApp() : app.initializeApp(firebaseConfig);
    return { db: firestore.getFirestore(instance), auth: auth.getAuth(instance), firestore, authApi: auth };
}
