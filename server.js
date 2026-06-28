const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 3000;

// CHỐ SỬA LỖI QUAN TRỌNG: ĐỊNH VỊ ĐƯỜNG DẪN GỐC AN TOÀN CHO RENDER/GITHUB
const ROOT_DIR = path.resolve(__dirname);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// KHẮC PHỤC LỖI THIẾU ASSET: CẤU HÌNH ĐỌC THƯ MỤC TĨNH PUBLIC
app.use(express.static(path.join(ROOT_DIR, 'public')));

// CẤU HÌNH ĐƯỜNG DẪN VIEW ENGINE EJS CHUẨN TUYỆT ĐỐI
app.set('view engine', 'ejs');
app.set('views', path.join(ROOT_DIR, 'views'));

// KHO DỮ LIỆU LIÊN THÔNG QUỐC GIA (REALTIME STATE CORE)
let systemState = {
    securityLevel: "AN TOÀN",
    tickerMessage: "⚡ CHÍNH PHỦ SỐ HÓA 2026: Hệ thống liên thông vận hành trực tuyến. Khóa luồng đàm thoại khi công dân bấm HÀI LÒNG để tiến hành phê duyệt niêm phong lưu kho.",
    systemLogs: [
        { time: new Date().toLocaleTimeString('vi-VN') + " - 28/06/2026", text: "Hệ thống trục lõi v6.1 sửa lỗi định tuyến tĩnh khởi động thành công." }
    ],
    announcements: [
        { id: "NEWS-601", type: "QUYẾT ĐỊNH", title: "Áp dụng cơ chế đóng băng đơn thư hành chính trực tuyến", content: "Hệ thống tự động khóa luồng khi công dân bấm hài lòng để cán bộ tiến hành nộp trình tấu cấp trên phê duyệt.", timestamp: "28/06/2026, 08:00:00" }
    ],
    criminalWantedList: [
        { name: "Nguyen_Van_A", crime: "Tổ chức đua xe trái phép kịch bản và chống người thi hành công vụ", bounty: "20,000,000 VND", date: "25/06/2026" }
    ],
    applications: {
        "HS-1001": {
            id: "HS-1001", sender: "Nguyen_Manh_Hoang", agency: "CÔNG AN", docType: "CĂN CƯỚC CÔNG DÂN GẮN CHÍP",
            content: "Xin cấp lại thẻ căn cước công dân gắn chíp điện tử định danh cá nhân do bị thất lạc khi di chuyển kịch bản.",
            status: "Đang Chờ Tiếp Nhận", stamp: "stamp-pending", handler: "Chưa phân phối", handlerTitle: "Trực ban liên thông",
            logs: [{ sender: "Hệ thống", msg: "Hồ sơ số hóa khởi tạo thành công.", time: new Date().toLocaleTimeString('vi-VN') }],
            satisfaction: null, priority: "BÌNH THƯỜNG", isLocked: false
        }
    },
    archivedApplications: {},
    shiftReports: [
        { id: "RP-77", date: "28/06/2026", officer: "Thiếu Tá Lê Minh Tuấn", agency: "CÔNG AN", taskStatus: "HOÀN THÀNH XUẤT SẮC CA TRỰC", content: "Tình hình ca trực ổn định, xử lý lưu kho bảo mật an toàn 2 hồ sơ công dân kịch bản.", status: "ĐÃ PHÊ DUYỆT", feedback: "Lãnh đạo đã phê duyệt lưu trữ." }
    ],
    authorizedPersonnel: {
        "admin": { username: "admin", password: "123", displayName: "Văn Phòng Trung Ương Điều Hành", role: "ADMIN", agency: "HỆ THỐNG", positiveRatings: 2, negativeRatings: 0 },
        "canbo1": { username: "canbo1", password: "123", displayName: "Thiếu Tá Lê Minh Tuấn", role: "CHUYÊN VIÊN", agency: "CÔNG AN", positiveRatings: 15, negativeRatings: 1 },
        "lanhdao1": { username: "lanhdao1", password: "123", displayName: "Đại Tá Nguyễn Hoàng", role: "LÃNH ĐẠO", agency: "CÔNG AN", positiveRatings: 24, negativeRatings: 0 },
        "thanhtra1": { username: "thanhtra1", password: "123", displayName: "Thanh Tra Viên Trần Lực", role: "THANH TRA", agency: "THANH TRA", positiveRatings: 7, negativeRatings: 0 }
    }
};

let citizenIdentityRegistry = {
    "Nguyen_Manh_Hoang": { name: "Nguyễn Mạnh Hoàng", dob: "18/05/1996", gender: "Nam", pob: "Lâm Đồng, Việt Nam", job: "Chuyên Viên Thẩm Định Cung Ứng Vật Tư Cao Cấp", licenses: ["Bằng Lái Xe Ô Tô Hạng B2", "Giấy Phép Sử Dụng Công Cụ Hỗ Trợ"], status: "Dân Cư Hợp Pháp - Lý Lịch Trong Sạch" }
};

let criminalRecordsRegistry = {
    "Nguyen_Manh_Hoang": [{ id: "VP-501", type: "VI PHẠM GIAO THÔNG", lawClause: "Điều 5 Nghị định 100/2019/NĐ-CP - Vượt đèn đỏ kịch bản", fine: "4,000,000 VND", status: "Đã Nộp Phạt", officer: "Thiếu Tá Lê Minh Tuấn", date: "10/05/2026" }]
};

function addLog(text) {
    const timeStr = new Date().toLocaleTimeString('vi-VN') + " - 28/06/2026";
    systemState.systemLogs.unshift({ time: timeStr, text });
}

function broadcastUpdate() {
    io.emit('stateUpdate', { systemState, citizenIdentityRegistry, criminalRecordsRegistry });
}

// AI ENGINE BOT TRA CỨU QUÉT STATE
function processBotAI(msg) {
    const text = msg.toUpperCase();
    if (text.includes("HS-") || text.includes("HỒ SƠ")) {
        const match = text.match(/HS-\d+/);
        if (match) {
            const appId = match[0];
            const app = systemState.applications[appId] || systemState.archivedApplications[appId];
            if (app) return `[Hệ thống AI] Hồ sơ ${appId} trạng thái: "${app.status}". Khóa đàm thoại: ${app.isLocked ? 'ĐÃ KHÓA VÌ DÂN HÀI LÒNG' : 'ĐANG MỞ'}.`;
        }
    }
    for (let key in citizenIdentityRegistry) {
        if (text.includes(key.toUpperCase()) || text.includes(citizenIdentityRegistry[key].name.toUpperCase())) {
            let c = citizenIdentityRegistry[key];
            return `[AI Quét] Cư dân ${c.name} | Chức vụ: ${c.job} | Trạng thái tư pháp: ${c.status}.`;
        }
    }
    return "Tôi là Tuệ Đức v6.1. Hệ thống trợ lý công vụ tự động quét dữ liệu và hỗ trợ công dân xử lý phôi hành chính.";
}

// CHỖ SỬA LỖI QUAN TRỌNG: ĐỊNH NGHĨA ROUTE GET PHƯƠNG THỨC GỐC ĐỂ TRANH LỖI CANNOT GET /
app.get('/', (req, res) => {
    res.render('index', { state: systemState, registry: citizenIdentityRegistry, violations: criminalRecordsRegistry });
});

app.post('/api/bot/chat', (req, res) => { res.json({ reply: processBotAI(req.body.message) }); });

// LUỒNG TƯƠNG TÁC VÒNG ĐỜI HỒ SƠ 2 CHIỀU
app.post('/api/applications/action', (req, res) => {
    const { id, action, msg, officerName, officerRole, status, stamp, targetAgency } = req.body;
    let app = systemState.applications[id] || systemState.archivedApplications[id];
    if (!app) return res.status(404).json({ error: "Không tìm thấy hồ sơ." });
    const timeNow = new Date().toLocaleTimeString('vi-VN');

    if (app.isLocked && action === 'chat' && officerName.includes("Công Dân")) {
        return res.status(400).json({ error: "Hồ sơ đã được đóng băng đàm thoại." });
    }

    if (action === 'chat') {
        app.logs.push({ sender: officerName, msg, time: timeNow });
        io.emit('newChatMessage', { fileId: id });
    } else if (action === 'claim_packet') {
        app.status = "Đã Tiếp Nhận Xử Lý"; app.stamp = "stamp-forwarded"; app.handler = officerName; app.handlerTitle = officerRole;
        app.logs.push({ sender: "Hệ thống", msg: `Cán bộ ${officerName} nhận quyền phụ trách hồ sơ kịch bản.`, time: timeNow });
    } else if (action === 'status') {
        app.status = status; app.stamp = stamp;
        app.logs.push({ sender: "Thẩm định viên", msg: `Cập nhật trạng thái luồng hồ sơ sang: [${status}].`, time: timeNow });
    } else if (action === 'forward') {
        app.logs.push({ sender: "Hệ thống liên ngành", msg: `${officerName} luân chuyển hồ sơ sang cơ quan bộ phận: [${targetAgency}].`, time: timeNow });
        app.agency = targetAgency; app.status = "Đang Chờ Tiếp Nhận"; app.stamp = "stamp-pending";
        addLog(`Hồ sơ ${id} luân chuyển sang bộ phận [${targetAgency}].`);
    } else if (action === 'archive') {
        app.status = "Đã Niêm Phong Lưu Kho Tối Cao"; app.stamp = "stamp-archived";
        systemState.archivedApplications[id] = app; delete systemState.applications[id];
        addLog(`Hồ sơ ${id} chính thức chuyển vào Kho bảo mật quốc gia.`);
    } else if (action === 'satisfaction') {
        app.satisfaction = status;
        if (status === 'HÀI LÒNG') {
            app.isLocked = true; // KHÓA VĨNH VIỄN LUỒNG ĐÀM THOẠI CỦA DÂN CƯ TRÊN FILE NÀY
            app.logs.push({ sender: "Hệ thống tự động", msg: "🔒 Công dân chấm điểm HÀI LÒNG. Luồng đàm thoại của cư dân trên hồ sơ này chính thức khóa.", time: timeNow });
        } else if (status === 'KHIẾU NẠI CẤP CAO') {
            app.status = "Đang Khiếu Nại Khẩn Cấp"; app.stamp = "stamp-rejected"; app.agency = "THANH TRA";
            app.logs.push({ sender: "Thanh tra hệ thống", msg: "🚨 Công dân gửi đơn KHIẾU NẠI KHẨN CẤP quy trình lên Thanh Tra Chính Phủ.", time: timeNow });
        }
    }
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/resident/add-license', (req, res) => {
    const { username, licenseName, issueAgency, signOfficer, duration } = req.body;
    if (citizenIdentityRegistry[username]) {
        const phoi = `Giấy tờ: ${licenseName} | Cơ quan: ${issueAgency} | Ấn ký: ${signOfficer} | Thời hạn kịch bản: ${duration}`;
        citizenIdentityRegistry[username].licenses.push(phoi);
        addLog(`Cán bộ [${signOfficer}] cấp phôi giấy phép [${licenseName}] cho cư dân @${username}.`);
        broadcastUpdate(); res.json({ success: true });
    } else { res.status(404).json({ error: "Không tìm thấy cư dân" }); }
});

app.post('/api/officer/report', (req, res) => {
    const { officer, agency, taskStatus, content } = req.body;
    const id = `RP-${Math.floor(100 + Math.random() * 900)}`;
    systemState.shiftReports.unshift({ id, date: new Date().toLocaleDateString('vi-VN'), officer, agency, taskStatus, content, status: "CHỜ PHÊ DUYỆT", feedback: "" });
    addLog(`Cán bộ [${officer}] gửi báo cáo ca trực hàng ngày [${id}] - Tình trạng: [${taskStatus}].`);
    broadcastUpdate(); res.json({ success: true });
});

app.post('/api/officer/report-action', (req, res) => {
    const { id, status, feedback } = req.body;
    let rp = systemState.shiftReports.find(r => r.id === id);
    if (rp) { rp.status = status; rp.feedback = feedback; broadcastUpdate(); }
    res.json({ success: true });
});

app.post('/api/resident/violation', (req, res) => {
    const { username, type, lawClause, fine, status, officerName } = req.body;
    if (!criminalRecordsRegistry[username]) criminalRecordsRegistry[username] = [];
    criminalRecordsRegistry[username].unshift({ id: `VP-${Math.floor(100 + Math.random() * 900)}`, type, lawClause, fine, status, officer: officerName, date: new Date().toLocaleDateString('vi-VN') });
    broadcastUpdate(); res.json({ success: true });
});

app.post('/api/resident/register', (req, res) => {
    const { username, name, dob, gender, pob, job, licenses, status } = req.body;
    citizenIdentityRegistry[username] = { name, dob, gender, pob, job, licenses: licenses ? licenses.split(',').map(l => l.trim()) : [], status };
    broadcastUpdate(); res.json({ success: true });
});

app.post('/api/officer/save', (req, res) => {
    const { username, password, displayName, role, agency } = req.body;
    systemState.authorizedPersonnel[username] = { username, password, displayName, role, agency, positiveRatings: 0, negativeRatings: 0 };
    broadcastUpdate(); res.json({ success: true });
});

app.post('/api/officer/delete', (req, res) => {
    if (req.body.username !== 'admin') { delete systemState.authorizedPersonnel[req.body.username]; broadcastUpdate(); }
    res.json({ success: true });
});

app.post('/api/national/ticker', (req, res) => { systemState.tickerMessage = req.body.message; broadcastUpdate(); res.json({ success: true }); });
app.post('/api/national/security', (req, res) => { systemState.securityLevel = req.body.level; broadcastUpdate(); res.json({ success: true }); });

server.listen(PORT, () => console.log(`[CORE] SERVER LISTENING ON PORT: ${PORT}`));
