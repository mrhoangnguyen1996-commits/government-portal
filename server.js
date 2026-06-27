const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// KHO DỮ LIỆU ĐA CHIỀU QUỐC GIA LÕI (REALTIME STATE CORE)
let systemState = {
    securityLevel: "AN TOÀN",
    tickerMessage: "⚡ HỆ THỐNG LIÊN THÔNG QUỐC GIA: Yêu cầu các đơn vị nghiêm túc thực hiện số hóa thủ tục hành chính năm 2026. Kiểm tra nghiêm ngặt dữ liệu định danh cư dân trước khi phê duyệt con dấu điện tử.",
    systemLogs: [
        { time: new Date().toLocaleTimeString('vi-VN') + " - 27/06/2026", text: "Trục lõi tối cao v3.0 kích hoạt cơ chế đồng bộ hóa phi tập trung siêu tốc." }
    ],
    announcements: [
        { id: "NEWS-99", type: "QUYẾT ĐỊNH", title: "Triển khai trục tích hợp dữ liệu số hóa liên phòng ban quốc gia", content: "Chính thức áp dụng mô hình phân cấp 4 luồng tương tác, tối ưu hóa tốc độ phản hồi kịch bản.", timestamp: "27/06/2026, 18:00:00" }
    ],
    criminalWantedList: [
        { name: "Nguyen_Van_A", crime: "Tổ chức đua xe trái phép và chống người thi hành công vụ", bounty: "20,000,000 VND", date: "25/06/2026" }
    ],
    applications: {
        "HS-1001": {
            id: "HS-1001", sender: "Nguyen_Manh_Hoang", agency: "CÔNG AN", docType: "CĂN CƯỚC CÔNG DÂN",
            content: "Xin cấp lại thẻ căn cước công dân gắn chíp điện tử định danh cá nhân do bị thất lạc.",
            status: "Đang Chờ Tiếp Nhận", stamp: "stamp-pending", handler: "Chưa phân phối", handlerTitle: "Trực ban",
            logs: [{ sender: "Hệ thống", msg: "Hồ sơ khởi tạo trực tuyến.", time: new Date().toLocaleTimeString('vi-VN') }],
            satisfaction: null, priority: "BÌNH THƯỜNG", directive: ""
        }
    },
    archivedApplications: {},
    shiftReports: [
        { id: "RP-201", date: "27/06/2026", officer: "Thiếu Tá Lê Minh Tuấn", agency: "CÔNG AN", content: "Tình hình ca trực ổn định, hoàn tất số hóa 2 hồ sơ công dân, an ninh trật tự khu vực quảng trường đảm bảo.", status: "ĐÃ PHÊ DUYỆT", feedback: "Tốt, tiếp tục phát huy." }
    ],
    authorizedPersonnel: {
        "admin": { username: "admin", password: "123", displayName: "Văn Phòng Trung Ương Điều Hành", role: "ADMIN", agency: "HỆ THỐNG", positiveRatings: 0, negativeRatings: 0 },
        "canbo1": { username: "canbo1", password: "123", displayName: "Thiếu Tá Lê Minh Tuấn", role: "CHUYÊN VIÊN", agency: "CÔNG AN", positiveRatings: 5, negativeRatings: 1 },
        "lanhdao1": { username: "lanhdao1", password: "123", displayName: "Đại Tá Nguyễn Hoàng", role: "LÃNH ĐẠO", agency: "CÔNG AN", positiveRatings: 8, negativeRatings: 0 },
        "thanhtra1": { username: "thanhtra1", password: "123", displayName: "Thanh Tra Viên Trần Lực", role: "THANH TRA", agency: "THANH TRA", positiveRatings: 2, negativeRatings: 0 }
    }
};

let citizenIdentityRegistry = {
    "Nguyen_Manh_Hoang": { name: "Nguyễn Mạnh Hoàng", dob: "18/05/1996", gender: "Nam", pob: "Lâm Đồng, Việt Nam", job: "Chuyên Viên Thẩm Định Cung Ứng Vật Tư Cao Cấp", licenses: ["Bằng Lái Xe Ô Tô Hạng B2", "Giấy Phép Sử Dụng Công Cụ Hỗ Trợ"], status: "Dân Cư Hợp Pháp - Lý Lịch Trong Sạch" }
};

let criminalRecordsRegistry = {
    "Nguyen_Manh_Hoang": [{ id: "VP-501", type: "VI PHẠM GIAO THÔNG", lawClause: "Điều 5 Nghị định 100/2019/NĐ-CP - Vượt đèn đỏ", fine: "4,000,000 VND", status: "Đã Nộp Phạt", officer: "Thiếu Tá Lê Minh Tuấn", date: "10/05/2026" }]
};

function addLog(text) {
    const timeStr = new Date().toLocaleTimeString('vi-VN') + " - 27/06/2026";
    systemState.systemLogs.unshift({ time: timeStr, text });
}

function broadcastUpdate() {
    io.emit('stateUpdate', { systemState, citizenIdentityRegistry, criminalRecordsRegistry });
}

app.get('/', (req, res) => {
    res.render('index', { state: systemState, registry: citizenIdentityRegistry, violations: criminalRecordsRegistry });
});

// ROUTE XỬ LÝ VI PHẠM
app.post('/api/resident/violation', (req, res) => {
    const { username, type, lawClause, fine, status, officerName } = req.body;
    const recordId = `VP-${Math.floor(100 + Math.random() * 900)}`;
    if (!criminalRecordsRegistry[username]) criminalRecordsRegistry[username] = [];
    criminalRecordsRegistry[username].unshift({ id: recordId, type, lawClause, fine, status, officer: officerName, date: new Date().toLocaleDateString('vi-VN') });
    addLog(`Cán bộ [${officerName}] áp quyết định xử phạt [${recordId}] cho @${username}.`);
    broadcastUpdate();
    res.json({ success: true });
});

// ROUTE ĐĂNG KÝ CƯ DÂN
app.post('/api/resident/register', (req, res) => {
    const { username, name, dob, gender, pob, job, licenses, status, officerName } = req.body;
    citizenIdentityRegistry[username] = { name, dob, gender, pob, job, licenses: licenses ? licenses.split(',').map(l => l.trim()) : [], status };
    addLog(`Cán bộ [${officerName}] số hóa định danh thành công cư dân: @${username}.`);
    broadcastUpdate();
    res.json({ success: true });
});

// ROUTE NỘP HỒ SƠ 
app.post('/api/applications/submit', (req, res) => {
    const { sender, agency, docType, content, priority } = req.body;
    const id = `HS-${Date.now().toString().slice(-4)}`;
    systemState.applications[id] = {
        id, sender, agency, docType, content, priority: priority || "BÌNH THƯỜNG",
        status: "Đang Chờ Tiếp Nhận", stamp: "stamp-pending", handler: "Chưa phân phối", handlerTitle: "Trực ban",
        logs: [{ sender: "Hệ thống", msg: "Hồ sơ khởi tạo thành công liên thông ngành.", time: new Date().toLocaleTimeString('vi-VN') }],
        satisfaction: null, directive: ""
    };
    addLog(`Công dân @${sender} nộp đơn trực tuyến [${id}] gửi đến bộ phận [${agency}].`);
    broadcastUpdate();
    io.emit('newApplicationAlert', { id, agency, docType, priority });
    res.json({ success: true, id });
});

// ROUTE TƯƠNG TÁC ĐA CHIỀU CỦA HỒ SƠ
app.post('/api/applications/action', (req, res) => {
    const { id, action, msg, officerName, officerRole, status, stamp, directive } = req.body;
    let app = systemState.applications[id] || systemState.archivedApplications[id];
    if (!app) return res.status(404).json({ error: "Không tìm thấy hồ sơ." });
    const timeNow = new Date().toLocaleTimeString('vi-VN');

    if (action === 'chat') {
        app.logs.push({ sender: officerName, msg, time: timeNow });
        io.emit('newChatMessage', { fileId: id });
    } else if (action === 'claim_packet') {
        app.status = "Đã Tiếp Nhận Xử Lý"; app.stamp = "stamp-forwarded"; app.handler = officerName; app.handlerTitle = officerRole;
        app.logs.push({ sender: "Hệ thống", msg: `Cán bộ ${officerName} nhận thụ lý hồ sơ.`, time: timeNow });
    } else if (action === 'status') {
        app.status = status; app.stamp = stamp;
        app.logs.push({ sender: "Phê duyệt", msg: `Thay đổi trạng thái hồ sơ thành [${status}] bởi ${officerName}.`, time: timeNow });
    } else if (action === 'directive') {
        app.directive = directive;
        app.logs.push({ sender: `Chỉ thị từ ${officerRole}`, msg: `LÃNH ĐẠO CẤP CAO CHỈ THỊ: ${directive}`, time: timeNow });
        addLog(`Lãnh đạo [${officerName}] hạ chỉ thị xuống hồ sơ [${id}].`);
    } else if (action === 'investigate') {
        app.status = "Thanh Tra Đang Thẩm Tra"; app.stamp = "stamp-leader"; app.agency = "THANH TRA";
        app.logs.push({ sender: "Thanh Tra Chính Phủ", msg: `Thanh tra đóng băng hồ sơ do có dấu hiệu vi phạm quy trình hành chính.`, time: timeNow });
    } else if (action === 'archive') {
        app.status = "Đã Niêm Phong Lưu Kho"; app.stamp = "stamp-archived";
        systemState.archivedApplications[id] = app; delete systemState.applications[id];
    } else if (action === 'satisfaction') {
        app.satisfaction = status;
        if (status === 'KHIẾU NẠI CẤP CAO') {
            app.status = "Đang Khiếu Nại Cấp Cao"; app.stamp = "stamp-rejected"; app.agency = "THANH TRA";
            app.logs.push({ sender: "Công Dân", msg: "🚨 CÔNG DÂN GỬI ĐƠN KHIẾU NẠI KHẨN CẤP VỀ QUY TRÌNH XỬ LÝ.", time: timeNow });
        } else {
            Object.values(systemState.authorizedPersonnel).forEach(u => { if (u.displayName === app.handler) { if (status === 'HÀI LÒNG') u.positiveRatings++; else u.negativeRatings++; } });
        }
    }
    broadcastUpdate();
    res.json({ success: true });
});

// ROUTE BÁO CÁO CA TRỰC LIÊN PHÒNG BAN
app.post('/api/officer/report', (req, res) => {
    const { officer, agency, content } = req.body;
    const id = `RP-${Math.floor(100 + Math.random() * 900)}`;
    systemState.shiftReports.unshift({ id, date: new Date().toLocaleDateString('vi-VN'), officer, agency, content, status: "ĐỜI CHỜ PHÊ DUYỆT", feedback: "" });
    addLog(`Cán bộ [${officer}] gửi báo cáo ca trực [${id}] liên ngành.`);
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/officer/report-action', (req, res) => {
    const { id, action, feedback } = req.body;
    let rp = systemState.shiftReports.find(r => r.id === id);
    if(rp) {
        rp.status = action;
        rp.feedback = feedback;
        addLog(`Ban điều hành phê duyệt báo cáo ca trực [${id}] trạng thái: ${action}.`);
        broadcastUpdate();
    }
    res.json({ success: true });
});

// ROUTE QUẢN TRỊ ADMIN / LÃNH ĐẠO
app.post('/api/officer/save', (req, res) => {
    const { username, password, displayName, role, agency, isEdit } = req.body;
    systemState.authorizedPersonnel[username] = { username, password, displayName, role, agency, positiveRatings: 0, negativeRatings: 0 };
    addLog(`Cấp tài khoản / Điều chỉnh quyền cho cán bộ: @${username}.`);
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/officer/delete', (req, res) => {
    const { username } = req.body;
    if (username !== 'admin') { delete systemState.authorizedPersonnel[username]; broadcastUpdate(); }
    res.json({ success: true });
});

app.post('/api/national/publish', (req, res) => {
    const { type, title, content, author } = req.body;
    if (type === 'TRUY NÃ') {
        systemState.criminalWantedList.unshift({ name: title, crime: content, bounty: "Theo khung hình sự kịch bản", date: new Date().toLocaleDateString('vi-VN') });
    } else {
        systemState.announcements.unshift({ id: `NEWS-${Date.now().toString().slice(-4)}`, type, title, content, timestamp: new Date().toLocaleString('vi-VN') });
    }
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/national/ticker', (req, res) => { systemState.tickerMessage = req.body.message; broadcastUpdate(); res.json({ success: true }); });
app.post('/api/national/security', (req, res) => { systemState.securityLevel = req.body.level; broadcastUpdate(); res.json({ success: true }); });

// TRỢ LÝ THÔNG MINH ĐỌC TRẠNG THÁI STATE KHÔNG SỬ DỤNG RESOURCE NGOÀI
app.post('/api/bot/chat', (req, res) => {
    const { message } = req.body;
    const text = message.toUpperCase();
    let reply = "Tôi chưa ghi nhận yêu cầu này trên kho dữ liệu số hóa liên thông. Vui lòng nhập đúng tên tài khoản kịch bản để tôi tra cứu cứu dữ liệu định danh lõi.";
    
    if (text.includes("CĂN CƯỚC") || text.includes("CCCD")) {
        reply = "Quy trình số hóa Căn Cước Công Dân yêu cầu cung cấp đầy đủ thông tin: Họ tên, Ngày sinh, Nguyên quán và gửi trực tiếp về BỘ CÔNG AN trực ban duyệt.";
    } else if (text.includes("BÁO CÁO")) {
        reply = "Chức năng 'Báo cáo ca trực' nằm tại Bàn làm việc của cán bộ, giúp lưu nhật ký hoạt động tuần tra và chuyển thẳng lên Lãnh đạo tối cao phê duyệt.";
    } else {
        for (let key in citizenIdentityRegistry) {
            if (text.includes(key.toUpperCase()) || text.includes(citizenIdentityRegistry[key].name.toUpperCase())) {
                let citizen = citizenIdentityRegistry[key];
                reply = `[Hệ thống quét định danh] Tìm thấy công dân ${citizen.name} | Ngày sinh: ${citizen.dob} | Trạng thái tư pháp quốc gia: ${citizen.status}.`;
                break;
            }
        }
    }
    res.json({ reply });
});

io.on('connection', (socket) => {
    socket.emit('initData', { systemState, citizenIdentityRegistry, criminalRecordsRegistry });
});

server.listen(PORT, () => console.log(`[CORE PRO] ENGINE MULTI-THREAD RUNNING ON PORT ${PORT}`));
