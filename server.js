const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình Middleware và View Engine
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Hệ thống Cơ sở dữ liệu tạm thời (Runtime Memory DB)
let systemState = {
    securityLevel: "AN TOÀN",
    announcements: [
        { id: "NEWS-1001", type: "QUYẾT ĐỊNH", title: "Vận hành Cổng thông tin điện tử liên thông Quốc Gia", content: "Chính thức chuyển dịch số hóa thủ tục hành chính, đồng bộ dữ liệu dân cư.", timestamp: "15/06/2026, 08:00:00" }
    ],
    criminalWantedList: [
        { name: "Nguyen_Van_A", crime: "Tổ chức đua xe trái phép và chống người thi hành công vụ", bounty: "20,000,000 VND", date: "14/06/2026" }
    ],
    applications: {
        "HS-1001": {
            id: "HS-1001", sender: "Nguyen_Manh_Hoang", agency: "CÔNG AN",
            content: "Xin cấp lại thẻ căn cước công dân gắn chíp điện tử định danh.",
            status: "Đang Chờ Tiếp Nhận", stamp: "stamp-pending", handler: "Chưa phân phối",
            logs: [{ sender: "Hệ thống", msg: "Hồ sơ số hóa khởi tạo thành công trên cổng liên thông.", time: "13:02:11" }],
            satisfaction: null
        }
    },
    authorizedPersonnel: {
        "admin": { username: "admin", password: "123", displayName: "Văn Phòng Tổng Thống", role: "ADMIN", agency: "VĂN PHÒNG CHỦ TỊCH", positiveRatings: 0, negativeRatings: 0 },
        "canbo_ca": { username: "canbo1", password: "123", displayName: "Thiếu Tá Lê Minh Tuấn", role: "CÁN BỘ", agency: "CÔNG AN", positiveRatings: 0, negativeRatings: 0 },
        "lanhdao_ca": { username: "lanhdao1", password: "123", displayName: "Đại Tá Nguyễn Mạnh Hoàng", role: "LÃNH ĐẠO", agency: "CÔNG AN", positiveRatings: 0, negativeRatings: 0 }
    }
};

// Cơ sở dữ liệu thông tin cư dân đầy đủ phục vụ cán bộ nhập liệu
const citizenIdentityRegistry = {
    "Nguyen_Manh_Hoang": {
        name: "Nguyễn Mạnh Hoàng", dob: "18/05/1996", gender: "Nam",
        pob: "Lâm Đồng, Việt Nam", job: "Chuyên Viên Thẩm Định Cung Ứng Vật Tư Cao Cấp",
        licenses: ["Bằng Lái Xe Ô Tô Hạng B2", "Giấy Phép Sử Dụng Công Cụ Hỗ Trợ"],
        status: "Dân Cư Hợp Pháp - Lý Lịch Trong Sạch"
    },
    "Tran_Minh_Quang": {
        name: "Trần Minh Quang", dob: "12/09/1990", gender: "Nam",
        pob: "Nha Trang, Khánh Hòa", job: "Giám Đốc Điều Hành Logistics Đường Bộ",
        licenses: ["Bằng Lái Xe Tải Hạng C"], status: "Dân Cư Hợp Pháp"
    }
};

// --- ROUTING API ---
app.get('/', (req, res) => {
    res.render('index', { state: systemState, registry: citizenIdentityRegistry });
});

// Đồng bộ API lấy trạng thái mới nhất
app.get('/api/state', (req, res) => {
    res.json({ systemState, citizenIdentityRegistry });
});

// Công dân nộp đơn
app.post('/api/applications/submit', (req, res) => {
    const { sender, agency, content } = req.body;
    const id = `HS-${Object.keys(systemState.applications).length + 1001}`;
    const timeNow = new Date().toLocaleTimeString('vi-VN');

    systemState.applications[id] = {
        id, sender, agency, content,
        status: "Đang Chờ Tiếp Nhận", stamp: "stamp-pending", handler: "Hệ thống trực ban",
        logs: [{ sender: "Hệ thống", msg: `Đơn thư trực tuyến chuyển tới cơ quan [${agency}].`, time: timeNow }],
        satisfaction: null
    };
    res.json({ success: true, id });
});

// Tương tác Chat & Xử lý hồ sơ
app.post('/api/applications/action', (req, res) => {
    const { id, action, msg, officerName, status, stamp, targetAgency } = req.body;
    const app = systemState.applications[id];
    if (!app) return res.status(404).json({ error: "Không tìm thấy hồ sơ" });

    const timeNow = new Date().toLocaleTimeString('vi-VN');

    if (action === 'chat') {
        app.logs.push({ sender: officerName, msg, time: timeNow });
    } else if (action === 'status') {
        app.status = status;
        app.stamp = stamp;
        app.handler = officerName;
        app.logs.push({ sender: "Hệ thống", msg: `Hồ sơ thay đổi trạng thái thành [${status}] bởi ${officerName}.`, time: timeNow });
    } else if (action === 'forward') {
        app.logs.push({ sender: "Hệ thống", msg: `${officerName} chuyển giao hồ sơ từ [${app.agency}] sang [${targetAgency}].`, time: timeNow });
        app.agency = targetAgency;
        app.status = "Đã Chuyển Cấp";
        app.stamp = "stamp-forwarded";
    } else if (action === 'satisfaction') {
        app.satisfaction = status;
        // Cộng điểm hiệu suất cho cán bộ xử lý
        Object.values(systemState.authorizedPersonnel).forEach(u => {
            if (u.displayName === app.handler) {
                if (status === 'HÀI LÒNG') u.positiveRatings++;
                else u.negativeRatings++;
            }
        });
    }
    res.json({ success: true });
});

// Đăng văn bản/Truy nã (Chỉ Lãnh đạo/Admin)
app.post('/api/national/publish', (req, res) => {
    const { type, title, content, ticker, author } = req.body;
    const timeNow = new Date().toLocaleString('vi-VN');

    if (type === 'TRUY NÃ') {
        systemState.criminalWantedList.unshift({ name: title, crime: content, bounty: "Theo quy chuẩn khung hình sự", date: timeNow.split(' ')[1] });
    } else {
        systemState.announcements.unshift({ id: `NEWS-${Date.now().toString().slice(-4)}`, type, title, content, timestamp: timeNow });
    }
    res.json({ success: true });
});

app.post('/api/national/delete-announcement', (req, res) => {
    const { id } = req.body;
    systemState.announcements = systemState.announcements.filter(a => a.id !== id);
    res.json({ success: true });
});

app.post('/api/national/security', (req, res) => {
    systemState.securityLevel = req.body.level;
    res.json({ success: true });
});

app.post('/api/officer/provision', (req, res) => {
    const { username, password, displayName, role, agency } = req.body;
    systemState.authorizedPersonnel[username] = { username, password, displayName, role, agency, positiveRatings: 0, negativeRatings: 0 };
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`Web Service dang vận hành ổn định trên Port: ${PORT}`));