const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 3000;

// XỬ LÝ ĐƯỜNG DẪN CONFIG BẢO MẬT TUYỆT ĐỐI CHO RENDER/GITHUB
const ROOT_DIR = path.resolve(__dirname);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CẤU HÌNH ĐỌC ASSET TĨNH CÔNG CỘNG (PUBLIC) - FIX LỖI 100%
app.use(express.static(path.join(ROOT_DIR, 'public')));

// CẤU HÌNH ENGINE VIEW EJS ĐƯỜNG DẪN TUYỆT ĐỐI
app.set('view engine', 'ejs');
app.set('views', path.join(ROOT_DIR, 'views'));

// CORE STATE MATRIX - KHO DỮ LIỆU LIÊN THÔNG QUỐC GIA TOÀN DIỆN
let systemState = {
    securityLevel: "AN TOÀN",
    tickerMessage: "⚡ CHÍNH PHỦ SỐ HÓA 2026: Yêu cầu các đơn vị nghiêm túc số hóa thủ tục hành chính liên thông. Kiểm tra nghiêm ngặt dữ liệu định danh trước khi phê duyệt ấn ký.",
    systemLogs: [
        { time: new Date().toLocaleTimeString('vi-VN') + " - 27/06/2026", text: "Trục lõi quốc gia Siêu Đa Nhiệm v4.0 khởi động thành công với luồng Socket siêu tốc." }
    ],
    announcements: [
        { id: "NEWS-4001", type: "QUYẾT ĐỊNH", title: "Vận hành trục liên thông hành chính số hóa quốc gia thế hệ mới", content: "Kích hoạt Trợ lý ảo Tuệ Đức v4 có khả năng tra cứu DB trực tiếp và ma trận phân luồng hồ sơ liên ngành.", timestamp: "27/06/2026, 18:00:00" }
    ],
    criminalWantedList: [
        { name: "Nguyen_Van_A", crime: "Tổ chức đua xe trái phép và chống người thi hành công vụ", bounty: "20,000,000 VND", date: "25/06/2026" }
    ],
    applications: {
        "HS-1001": {
            id: "HS-1001", sender: "Nguyen_Manh_Hoang", agency: "CÔNG AN", docType: "CĂN CƯỚC CÔNG DÂN",
            content: "Xin cấp lại thẻ căn cước công dân gắn chíp điện tử do bị thất lạc trong quá trình di chuyển công tác.",
            status: "Đang Chờ Tiếp Nhận", stamp: "stamp-pending", handler: "Chưa phân phối", handlerTitle: "Trực ban liên thông",
            logs: [{ sender: "Hệ thống", msg: "Hồ sơ số hóa khởi tạo thành công.", time: new Date().toLocaleTimeString('vi-VN') }],
            satisfaction: null, priority: "BÌNH THƯỜNG"
        }
    },
    archivedApplications: {},
    shiftReports: [
        { id: "RP-801", date: "27/06/2026", officer: "Thiếu Tá Lê Minh Tuấn", agency: "CÔNG AN", content: "Tình hình ca trực ổn định, hoàn tất kiểm tra lý lịch 12 cư dân, không phát hiện bạo động.", status: "ĐÃ PHÊ DUYỆT", feedback: "Lãnh đạo đã ghi nhận." }
    ],
    authorizedPersonnel: {
        "admin": { username: "admin", password: "123", displayName: "Văn Phòng Trung Ương Điều Hành", role: "ADMIN", agency: "HỆ THỐNG", positiveRatings: 0, negativeRatings: 0 },
        "canbo1": { username: "canbo1", password: "123", displayName: "Thiếu Tá Lê Minh Tuấn", role: "CHUYÊN VIÊN", agency: "CÔNG AN", positiveRatings: 5, negativeRatings: 1 },
        "lanhdao1": { username: "lanhdao1", password: "123", displayName: "Đại Tá Nguyễn Hoàng", role: "LÃNH ĐẠO", agency: "CÔNG AN", positiveRatings: 8, negativeRatings: 0 },
        "thanhtra1": { username: "thanhtra1", password: "123", displayName: "Thanh Tra Viên Trần Lực", role: "THANH TRA", agency: "THANH TRA", positiveRatings: 2, negativeRatings: 0 }
    }
};

let citizenIdentityRegistry = {
    "Nguyen_Manh_Hoang": { name: "Nguyễn Mạnh Hoàng", dob: "18/05/1996", gender: "Nam", pob: "Lâm Đồng, Việt Nam", job: "Chuyên Viên Thẩm Định Cung Ứng Vật Tư Cao Cấp", licenses: ["Bằng Lái Xe Ô Tô Hạng B2", "Giấy Phép Sử Dụng Công Cụ Hỗ Trợ"], status: "Dân Cư Hợp Pháp - Lý Lịch Trong Sạch" },
    "Tran_Minh_Quang": { name: "Trần Minh Quang", dob: "12/09/1990", gender: "Nam", pob: "Nha Trang, Khánh Hòa", job: "Giám Đốc Điều Hành Logistics Đường Bộ", licenses: ["Bằng Lái Xe Tải Hạng C"], status: "Dân Cư Hợp Pháp" }
};

let criminalRecordsRegistry = {
    "Nguyen_Manh_Hoang": [{ id: "VP-501", type: "VI PHẠM GIAO THÔNG", lawClause: "Điều 5 Nghị định 100/2019/NĐ-CP - Vượt đèn đỏ kịch bản", fine: "4,000,000 VND", status: "Đã Nộp Phạt", officer: "Thiếu Tá Lê Minh Tuấn", date: "10/05/2026" }]
};

function addLog(text) {
    const timeStr = new Date().toLocaleTimeString('vi-VN') + " - 27/06/2026";
    systemState.systemLogs.unshift({ time: timeStr, text });
}

function broadcastUpdate() {
    io.emit('stateUpdate', { systemState, citizenIdentityRegistry, criminalRecordsRegistry });
}

// AI ENGINE BOT V4 - QUÉT SÂU TRẠNG THÁI STATE REALTIME
function processBotAI(msg) {
    const text = msg.toUpperCase();
    
    if (text.includes("HS-") || text.includes("HỒ SƠ")) {
        const match = text.match(/HS-\d+/);
        if (match) {
            const appId = match[0];
            const app = systemState.applications[appId] || systemState.archivedApplications[appId];
            if (app) {
                return `[Hệ thống quét tự động] Hồ sơ số ${appId} thuộc lĩnh vực [${app.agency}] do cư dân @${app.sender} nộp hiện có trạng thái: "${app.status}". Đơn vị phụ trách: ${app.handler}.`;
            }
        }
    }
    
    for (let username in citizenIdentityRegistry) {
        if (text.includes(username.toUpperCase()) || text.includes(citizenIdentityRegistry[username].name.toUpperCase())) {
            const citizen = citizenIdentityRegistry[username];
            const v = criminalRecordsRegistry[username] || [];
            return `[Quét dữ liệu dân cư] Cư dân: ${citizen.name} | Ngày sinh: ${citizen.dob} | Trạng thái tư pháp: ${citizen.status}. Phát hiện ${v.length} biên bản vi phạm pháp luật trong kho dữ liệu số hóa.`;
        }
    }

    if (text.includes("CĂN CƯỚC")) return "Thủ tục Căn Cước Công Dân yêu cầu chuẩn cấu trúc kịch bản Họ_Tên, nộp về Bộ Công An tiếp nhận.";
    if (text.includes("VŨ KHÍ") || text.includes("CÔNG CỤ")) return "Giấy phép công cụ hỗ trợ do Bộ Chỉ Huy Quân Sự hoặc Bộ Công An phê chuẩn nghiêm ngặt cho đối tượng lý lịch trong sạch.";
    if (text.includes("AN NINH") || text.includes("BÁO ĐỘNG")) return `Mức độ cảnh báo an ninh toàn quốc hiện tại: [${systemState.securityLevel}].`;

    return "Tôi là Tuệ Đức v4 - Trợ lý trí tuệ nhân tạo lõi. Tôi đã đồng bộ với DB quốc gia. Hãy hỏi về mã hồ sơ, tên cư dân hoặc thủ tục hành chính trực tuyến.";
}

// ROUTER GET CHÍNH - KHẮC PHỤC LỖI CANNOT GET /
app.get('/', (req, res) => {
    res.render('index', { state: systemState, registry: citizenIdentityRegistry, violations: criminalRecordsRegistry });
});

app.post('/api/bot/chat', (req, res) => {
    res.json({ reply: processBotAI(req.body.message) });
});

app.post('/api/applications/action', (req, res) => {
    const { id, action, msg, officerName, officerRole, status, stamp, targetAgency } = req.body;
    let app = systemState.applications[id] || systemState.archivedApplications[id];
    if (!app) return res.status(404).json({ error: "Không tìm thấy hồ sơ." });
    const timeNow = new Date().toLocaleTimeString('vi-VN');

    if (action === 'chat') {
        app.logs.push({ sender: officerName, msg, time: timeNow });
        io.emit('newChatMessage', { fileId: id });
    } else if (action === 'claim_packet') {
        app.status = "Đã Tiếp Nhận Xử Lý"; app.stamp = "stamp-forwarded"; app.handler = officerName; app.handlerTitle = officerRole;
        app.logs.push({ sender: "Hệ thống", msg: `Cán bộ ${officerName} nhận quyền thụ lý xử lý hồ sơ.`, time: timeNow });
    } else if (action === 'status') {
        app.status = status; app.stamp = stamp;
        app.logs.push({ sender: "Thẩm định", msg: `Cán bộ ${officerName} duyệt thay đổi trạng thái sang: [${status}].`, time: timeNow });
    } else if (action === 'forward') {
        app.logs.push({ sender: "Hệ thống", msg: `Thủ trưởng ${officerName} ký lệnh điều chuyển hồ sơ liên ngành vượt thẩm quyền sang Bộ phận: [${targetAgency}].`, time: timeNow });
        app.agency = targetAgency; app.status = "Đang Chờ Tiếp Nhận"; app.stamp = "stamp-pending";
        addLog(`Hồ sơ ${id} được chuyển ngành từ đơn vị cũ sang cơ quan [${targetAgency}].`);
    } else if (action === 'archive') {
        app.status = "Đã Đóng & Lưu Kho"; app.stamp = "stamp-archived";
        systemState.archivedApplications[id] = app; delete systemState.applications[id];
    } else if (action === 'unarchive') {
        app.status = "Mở Lại Phục Hồi"; app.stamp = "stamp-pending";
        systemState.applications[id] = app; delete systemState.archivedApplications[id];
    } else if (action === 'satisfaction') {
        app.satisfaction = status;
        if (status === 'KHIẾU NẠI CẤP CAO') {
            app.status = "Đang Khiếu Nại Cấp Cao"; app.stamp = "stamp-rejected"; app.agency = "THANH TRA";
            app.logs.push({ sender: "Công Dân", msg: "🚨 CÔNG DÂN GỬI ĐƠN KHIẾU NẠI KHẨN CẤP LÊN CẤP THANH TRA CHÍNH PHỦ.", time: timeNow });
        }
    }
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/resident/violation', (req, res) => {
    const { username, type, lawClause, fine, status, officerName } = req.body;
    const recordId = `VP-${Math.floor(100 + Math.random() * 900)}`;
    if (!criminalRecordsRegistry[username]) criminalRecordsRegistry[username] = [];
    criminalRecordsRegistry[username].unshift({ id: recordId, type, lawClause, fine, status, officer: officerName, date: new Date().toLocaleDateString('vi-VN') });
    addLog(`Cán bộ [${officerName}] lập biên bản xử phạt hình sự kịch bản [${recordId}] cho cư dân @${username}.`);
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/resident/register', (req, res) => {
    const { username, name, dob, gender, pob, job, licenses, status, officerName } = req.body;
    citizenIdentityRegistry[username] = { name, dob, gender, pob, job, licenses: licenses ? licenses.split(',').map(l => l.trim()) : [], status };
    addLog(`Cán bộ [${officerName}] số hóa định danh thành công cư dân: @${username}.`);
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/resident/add-license', (req, res) => {
    const { username, license, officerName } = req.body;
    if (citizenIdentityRegistry[username]) {
        citizenIdentityRegistry[username].licenses.push(license);
        addLog(`Cán bộ [${officerName}] cấp phôi văn bằng chứng chỉ mới: [${license}] cho @${username}.`);
        broadcastUpdate();
        res.json({ success: true });
    } else { res.status(404).json({ error: "Không tìm thấy cư dân" }); }
});

app.post('/api/officer/report', (req, res) => {
    const { officer, agency, content } = req.body;
    const id = `RP-${Math.floor(100 + Math.random() * 900)}`;
    systemState.shiftReports.unshift({ id, date: new Date().toLocaleDateString('vi-VN'), officer, agency, content, status: "CHỜ PHÊ DUYỆT", feedback: "" });
    addLog(`Cán bộ [${officer}] nộp báo cáo quân số / tình hình ca trực mang mã số [${id}].`);
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/officer/report-action', (req, res) => {
    const { id, status, feedback } = req.body;
    let rp = systemState.shiftReports.find(r => r.id === id);
    if (rp) { rp.status = status; rp.feedback = feedback; broadcastUpdate(); }
    res.json({ success: true });
});

app.post('/api/applications/submit', (req, res) => {
    const { sender, agency, docType, content, priority } = req.body;
    const id = `HS-${Math.floor(1000 + Math.random() * 9000)}`;
    systemState.applications[id] = {
        id, sender, agency, docType, content, priority,
        status: "Đang Chờ Tiếp Nhận", stamp: "stamp-pending", handler: "Chưa phân phối", handlerTitle: "Hệ thống tự động",
        logs: [{ sender: "Hệ thống", msg: `Khởi tạo đơn thư trực tuyến mức độ [${priority}].`, time: new Date().toLocaleTimeString('vi-VN') }],
        satisfaction: null
    };
    addLog(`Cư dân @${sender} nộp đơn xin phê duyệt phôi [${docType}] gửi đến [${agency}].`);
    broadcastUpdate();
    io.emit('newApplicationAlert', { id, agency, docType, priority });
    res.json({ success: true, id });
});

app.post('/api/officer/save', (req, res) => {
    const { username, password, displayName, role, agency, isEdit } = req.body;
    systemState.authorizedPersonnel[username] = { username, password, displayName, role, agency, positiveRatings: 0, negativeRatings: 0 };
    addLog(`ADMIN bổ nhiệm / chỉnh sửa chứng thư nhân sự cán bộ nghiệp vụ: @${username}.`);
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/officer/delete', (req, res) => {
    if (req.body.username !== 'admin') { delete systemState.authorizedPersonnel[req.body.username]; broadcastUpdate(); }
    res.json({ success: true });
});

app.post('/api/national/publish', (req, res) => {
    const { type, title, content, author } = req.body;
    if (type === 'TRUY NÃ') {
        systemState.criminalWantedList.unshift({ name: title, crime: content, bounty: "Theo quy định hình sự kịch bản", date: new Date().toLocaleDateString('vi-VN') });
    } else {
        systemState.announcements.unshift({ id: `NEWS-${Date.now().toString().slice(-4)}`, type, title, content, timestamp: new Date().toLocaleString('vi-VN') });
    }
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/national/ticker', (req, res) => { systemState.tickerMessage = req.body.message; broadcastUpdate(); res.json({ success: true }); });
app.post('/api/national/security', (req, res) => { systemState.securityLevel = req.body.level; addLog(`Thay đổi mức độ cảnh báo an ninh toàn hệ thống sang: [${req.body.level}].`); broadcastUpdate(); res.json({ success: true }); });

io.on('connection', (socket) => {
    socket.emit('initData', { systemState, citizenIdentityRegistry, criminalRecordsRegistry });
});

server.listen(PORT, () => console.log(`[REALTIME CORE] SERVER RUNNING ON PORT: ${PORT}`));
