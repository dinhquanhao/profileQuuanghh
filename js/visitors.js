import { getFirebaseClient } from './firebase-client.js';

const status = document.getElementById('visitorStatus');
const table = document.getElementById('visitorTable');
const login = document.getElementById('visitorLogin');
const logout = document.getElementById('visitorLogout');

export function renderVisitors(documents) {
    table.replaceChildren();
    documents.forEach(snapshot => {
        const visitor = snapshot.data();
        const row = document.createElement('tr');
        const time = visitor.time?.toDate ? visitor.time.toDate().toLocaleString('vi-VN') : visitor.time;
        for (const value of [visitor.page, time]) {
            const cell = document.createElement('td');
            cell.textContent = value == null ? '—' : String(value);
            row.appendChild(cell);
        }
        table.appendChild(row);
    });
}

async function initializeVisitors() {
    try {
        const client = await getFirebaseClient();
        if (!client) {
            status.textContent = 'Chưa cấu hình Firebase. Xem hướng dẫn trong README.';
            return;
        }
        login.hidden = false;
        login.addEventListener('submit', async event => {
            event.preventDefault();
            const password = login.elements.password;
            try {
                await client.authApi.signInWithEmailAndPassword(client.auth, login.elements.email.value, password.value);
            } catch {
                status.textContent = 'Đăng nhập thất bại. Kiểm tra tài khoản và cấu hình Firebase.';
            } finally {
                password.value = '';
            }
        });
        logout.addEventListener('click', () => client.authApi.signOut(client.auth).catch(() => {
            status.textContent = 'Không thể đăng xuất. Vui lòng thử lại.';
        }));
        let generation = 0;
        client.authApi.onAuthStateChanged(client.auth, async user => {
            const current = ++generation;
            table.replaceChildren();
            login.hidden = Boolean(user);
            logout.hidden = !user;
            if (!user) {
                status.textContent = 'Đăng nhập bằng tài khoản quản trị để xem lượt truy cập.';
                return;
            }
            status.textContent = 'Đang tải…';
            try {
                const query = client.firestore.query(client.firestore.collection(client.db, 'visitors'),
                    client.firestore.orderBy('time', 'desc'), client.firestore.limit(100));
                const results = await client.firestore.getDocs(query);
                if (current !== generation) return;
                renderVisitors(results.docs);
                status.textContent = results.empty ? 'Chưa có lượt truy cập.' : 'Hiển thị tối đa 100 lượt gần nhất.';
            } catch {
                if (current === generation) status.textContent = 'Không thể tải dữ liệu. Kiểm tra quyền quản trị trong Firestore Rules và kết nối mạng.';
            }
        });
    } catch {
        status.textContent = 'Không thể kết nối Firebase. Kiểm tra cấu hình và kết nối mạng.';
    }
}

initializeVisitors();
