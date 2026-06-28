const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.resolve(__dirname);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(ROOT_DIR, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(ROOT_DIR, 'views'));

// STATE CORE SYSTEM v7.0 GLOBAL MATRIX
let systemState = {
    securityLevel: "AN TOÀN",
    tickerMessage: "⚡ HỆ THỐNG QUỐC VỤ SỐ LIÊN THÔNG V7.0: Đã cấu trúc lại toàn diện bàn làm việc bộ ngành và tích hợp bảng phân tích biểu đồ thống kê đa lớp tại phòng Giám sát.",
    systemLogs: [
        { time: new Date().toLocaleTimeString('vi-VN') + " - Trung tâm dữ liệu", text: "Kích hoạt trục ma trận liên thông v7.0 tối ưu đa thiết bị Mobile/PC." }
    ],
    announcements: [
        { id: "AN-701", type: "QUYẾT ĐỊNH", title: "Khai triển trục hạ tầng số hóa và phôi con dấu điện tử v7.0", content: "Chính thức vá lỗi đồng bộ luồng thẩm định đơn thư và nâng cấp hệ thống cảnh báo đa điểm.", timestamp: new Date().toLocaleString('vi-VN') }
    ],
    criminalWantedList: [
        { name: "Nguyen_Van_A", crime: "Tổ chức đua xe kịch bản và chống người thi hành công vụ", bounty: "20,000,000 VND", date: "25/06/2026" }
    ],
    applications: {
        "HS-1001": {
            id: "HS-1001", sender: "Nguyen_Manh_Hoang", agency: "CÔNG AN", docType: "CĂN CƯỚC CÔNG DÂN",
            content: "Xin cấp lại thẻ căn cước công dân gắn chíp điện tử do bị thất lạc trong quá trình làm việc kịch bản.",
            status: "Đang Chờ Tiếp Nhận", stamp: "stamp-pending", handler: "Chưa phân phối", handlerTitle: "Trực ban liên thông",
            logs: [{ sender: "Hệ thống", msg: "Khởi tạo thành công hồ sơ trên cổng liên thông.", time: new Date().toLocaleTimeString('vi-VN') }],
            satisfaction: null, priority: "BÌNH THƯỜNG", isLocked: false
        }
    },
    archivedApplications: {},
    shiftReports: [],
    authorizedPersonnel: {
        "admin": { username: "admin", password: "123", displayName: "Tổng Cục Trưởng Giám Sát", role: "ADMIN", agency: "HỆ THỐNG", positiveRatings: 0, negativeRatings: 0 },
        "canbo1": { username: "canbo1", password: "123", displayName: "Thiếu Tá Lê Minh Tuấn", role: "CHUYÊN VIÊN", agency: "CÔNG AN", positiveRatings: 4, negativeRatings: 0 },
        "lanhdao1": { username: "lanhdao1", password: "123", displayName: "Đại Tá Nguyễn Hoàng", role: "LÃNH ĐẠO", agency: "CÔNG AN", positiveRatings: 9, negativeRatings: 0 },
        "thanhtra1": { username: "thanhtra1", password: "123", displayName: "Thanh Tra Viên Trần Lực", role: "THANH TRA", agency: "THANH TRA", positiveRatings: 3, negativeRatings: 0 }
    }
};

let citizenIdentityRegistry = {
    "Nguyen_Manh_Hoang": { name: "Nguyễn Mạnh Hoàng", dob: "18/05/1996", gender: "Nam", pob: "Lâm Đồng, Việt Nam", job: "Chuyên Viên Thẩm Định Cung Ứng Vật Tư Cao Cấp", licenses: ["Bằng Lái Xe Ô Tô Hạng B2", "Giấy Phép Sử Dụng Công Cụ Hỗ Trợ"], status: "Dân Cư Hợp Pháp - Lý Lịch Trong Sạch" }
};

let criminalRecordsRegistry = {
    "Nguyen_Manh_Hoang": [{ id: "VP-501", type: "VI PHẠM GIAO THÔNG", lawClause: "Vượt đèn đỏ kịch bản mô phỏng", fine: "4,000,000 VND", status: "Đã Nộp Phạt", officer: "Thiếu Tá Lê Minh Tuấn", date: "10/05/2026" }]
};

function addLog(text) {
    const timeStr = new Date().toLocaleTimeString('vi-VN');
    systemState.systemLogs.unshift({ time: timeStr, text });
}

function broadcastUpdate() {
    io.emit('stateUpdate', { systemState, citizenIdentityRegistry, criminalRecordsRegistry });
}

// SIÊU BOT AI TUỆ ĐỨC v7.0 - ĐA NHIỆM CHUYÊN SÂU
function processBotAI(msg) {
    const text = msg.toUpperCase();
    if (text.includes("HS-") || text.includes("HỒ SƠ")) {
        const match = text.match(/HS-\d+/);
        if (match) {
            const appId = match[0];
            const app = systemState.applications[appId] || systemState.archivedApplications[appId];
            if (app) {
                return `🤖 [TRÍ TUỆ NHÂN TẠO] Quét thành công hồ sơ mật [${appId}]:\n• Loại thủ tục: ${app.docType}\n• Trạng thái lõi: [${app.status}]\n• Cơ quan phụ trách: ${app.agency}\n• Thụ lý chuyên viên: ${app.handler}\n• Trạng thái Lock: ${app.isLocked ? "ĐÃ KHÓA CỨNG (Chờ Lãnh Đạo đóng kho)" : "ĐANG MỞ"}.`;
            }
        }
    }
    for (let username in citizenIdentityRegistry) {
        if (text.includes(username.toUpperCase()) || text.includes(citizenIdentityRegistry[username].name.toUpperCase())) {
            const citizen = citizenIdentityRegistry[username];
            const v = criminalRecordsRegistry[username] || [];
            return `👤 [CƠ SỞ DỮ LIỆU ĐỊNH DANH] Cư dân: ${citizen.name} (@${username}):\n• Nghề nghiệp: ${citizen.job}\n• Giấy phép tích hợp: ${citizen.licenses.length} phôi điện tử.\n• Điểm kỷ luật tư pháp: Vi phạm ${v.length} lần. Đánh giá: ${v.length > 0 ? "⚠️ CẦN GIÁM SÁT CAO" : "✅ LÝ LỊCH TRONG SẠCH"}.`;
        }
    }
    if (text.includes("CĂN CƯỚC")) return "🤖 Hệ thống CCD gắn chíp điện tử yêu cầu đồng bộ phôi ảnh nền xanh, nộp đơn tại mục [Nộp Đơn Trực Tuyến] gửi BỘ CÔNG AN thẩm duyệt.";
    if (text.includes("KHIẾU NẠI")) return "🤖 Theo điều lệ kịch bản tư pháp v7.0, khi công dân kích hoạt khiếu nại, hồ sơ lập tức khóa quyền chuyên viên cũ và tự động luân chuyển sang phòng ban THANH TRA CHÍNH PHỦ.";
    return "🤖 Tôi là Siêu trợ lý số hóa Tuệ Đức v7.0. Tôi nắm giữ toàn bộ trạng thái hệ thống kịch bản. Hãy cung cấp mã số hồ sơ hoặc tên định danh để tôi quét ma trận dữ liệu.";
}

app.get('/', (req, res) => {
    res.render('index', { state: systemState, registry: citizenIdentityRegistry, violations: criminalRecordsRegistry });
});

app.post('/api/bot/chat', (req, res) => {
    res.json({ reply: processBotAI(req.body.message) });
});

// APIs LUỒNG TƯ PHÁP CHUYÊN NGHIỆP THỜI GIAN THỰC
app.post('/api/applications/action', (req, res) => {
    const { id, action, msg, officerName, officerRole, status, stamp, targetAgency } = req.body;
    let app = systemState.applications[id] || systemState.archivedApplications[id];
    if (!app) return res.status(404).json({ error: "Hồ sơ không tồn tại." });
    const timeNow = new Date().toLocaleTimeString('vi-VN');

    // QUY TRÌNH LOGIC PHÂN QUYỀN VÀ TRẠNG THÁI HOÀN TOÀN THỰC TẾ
    if (app.isLocked && action !== 'archive' && action !== 'chat') {
        return res.status(403).json({ error: "Hồ sơ đã khóa do công dân chọn HÀI LÒNG. Cán bộ tiếp nhận không có quyền đổi trạng thái, yêu cầu Lãnh đạo đóng hồ sơ!" });
    }

    if (action === 'chat') {
        app.logs.push({ sender: officerName, msg, time: timeNow });
    } else if (action === 'claim_packet') {
        app.status = "Đã Tiếp Nhận Xử Lý"; app.stamp = "stamp-forwarded"; app.handler = officerName; app.handlerTitle = officerRole;
        app.logs.push({ sender: "Hệ thống", msg: `Cán bộ ${officerName} đã tiếp nhận thẩm định đơn thư khẩn.`, time: timeNow });
        addLog(`Cán bộ ${officerName} ký số tiếp nhận xử lý hồ sơ ${id}.`);
    } else if (action === 'status') {
        app.status = status; app.stamp = stamp;
        app.logs.push({ sender: "Hội đồng bộ ngành", msg: `Cập nhật trạng thái hồ sơ: [${status}]. Người ký: ${officerName}.`, time: timeNow });
        addLog(`Hồ sơ ${id} thay đổi trạng thái sang [${status}] bởi ${officerName}.`);
    } else if (action === 'forward') {
        app.logs.push({ sender: "Điều phối liên thông", msg: `Phát hiện hồ sơ sai cơ quan phụ trách. Cán bộ ${officerName} thực hiện lệnh chuyển tiếp liên ngành sang: [${targetAgency}].`, time: timeNow });
        app.agency = targetAgency; app.status = "Đang Chờ Tiếp Nhận"; app.stamp = "stamp-pending"; app.handler = "Chưa phân phối";
        addLog(`Luân chuyển hồ sơ ${id} sang cơ quan ban ngành [${targetAgency}].`);
    } else if (action === 'archive') {
        app.status = "Đã Đóng & Lưu Kho Mật"; app.stamp = "stamp-archived"; app.isLocked = true;
        systemState.archivedApplications[id] = app; delete systemState.applications[id];
        addLog(`Lãnh đạo phê duyệt niêm phong đóng kho hồ sơ hành chính ${id}.`);
    } else if (action === 'satisfaction') {
        app.satisfaction = status;
        if (status === 'KHIẾU NẠI CẤP CAO') {
            app.status = "Đang Khiếu Nại Cấp Cao"; app.stamp = "stamp-rejected"; app.agency = "THANH TRA"; app.isLocked = false;
            app.logs.push({ sender: "Hệ thống tự động", msg: "🚨 CÔNG DÂN PHÁT LỆNH KHIẾU NẠI. Hồ sơ tự động luân chuyển khẩn cấp về cơ quan THANH TRA CHÍNH PHỦ giải quyết xử lý.", time: timeNow });
            addLog(`Hồ sơ ${id} phát sinh khiếu nại, chuyển luồng về cơ quan Thanh Tra.`);
        } else if (status === 'HÀI LÒNG') {
            app.isLocked = true;
            app.status = "Hoàn Tất - Chờ Lãnh Đạo Đóng Đơn";
            app.logs.push({ sender: "Hệ thống tự động", msg: "✅ Công dân đánh giá HÀI LÒNG. Hồ sơ lập tức khóa (LOCK), chờ cấp Lãnh đạo đơn vị ký phê duyệt đóng vĩnh viễn.", time: timeNow });
            Object.values(systemState.authorizedPersonnel).forEach(u => { if (u.displayName === app.handler) u.positiveRatings++; });
            addLog(`Hồ sơ ${id} được công dân bấm hài lòng và khóa cứng.`);
        }
    }
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/resident/add-license', (req, res) => {
    const { username, licenseName, issueAgency, signOfficer, duration } = req.body;
    if (citizenIdentityRegistry[username]) {
        citizenIdentityRegistry[username].licenses.push(`Văn bằng: ${licenseName} | Nơi cấp: ${issueAgency} | Ấn ký: ${signOfficer} | Thời hạn: ${duration}`);
        addLog(`Cấp phát phôi văn bằng chứng thư số cho cư dân @${username}.`);
        broadcastUpdate(); res.json({ success: true });
    } else { res.status(404).json({ error: "Không tìm thấy tài khoản cư dân." }); }
});

app.post('/api/officer/report', (req, res) => {
    const { officer, agency, taskStatus, content } = req.body;
    const id = `RP-${Math.floor(100 + Math.random() * 900)}`;
    systemState.shiftReports.unshift({ id, date: new Date().toLocaleDateString('vi-VN'), officer, agency, taskStatus, content, status: "CHỜ PHÊ DUYỆT", feedback: "" });
    addLog(`Cán bộ trực ban ${officer} nộp báo cáo ca công vụ ${id}.`);
    broadcastUpdate(); res.json({ success: true });
});

app.post('/api/officer/report-action', (req, res) => {
    const { id, status, feedback } = req.body;
    let rp = systemState.shiftReports.find(r => r.id === id);
    if (rp) { rp.status = status; rp.feedback = feedback; addLog(`Phê duyệt nhật ký ca trực công vụ [${id}] sang trạng thái: [${status}].`); broadcastUpdate(); }
    res.json({ success: true });
});

app.post('/api/resident/violation', (req, res) => {
    const { username, type, lawClause, fine, status, officerName } = req.body;
    if (!criminalRecordsRegistry[username]) criminalRecordsRegistry[username] = [];
    criminalRecordsRegistry[username].unshift({ id: `VP-${Math.floor(100 + Math.random() * 900)}`, type, lawClause, fine, status, officer: officerName, date: new Date().toLocaleDateString('vi-VN') });
    addLog(`Lập biên bản kỷ luật tư pháp áp dụng cho cư dân @${username}.`);
    broadcastUpdate(); res.json({ success: true });
});

app.post('/api/resident/register', (req, res) => {
    const { username, name, dob, gender, pob, job, licenses, status } = req.body;
    citizenIdentityRegistry[username] = { name, dob, gender, pob, job, licenses: licenses ? licenses.split(',').map(l => l.trim()) : [], status };
    addLog(`Đồng bộ hóa dữ liệu định danh cư dân gốc mới: @${username}.`);
    broadcastUpdate(); res.json({ success: true });
});

app.post('/api/applications/submit', (req, res) => {
    const { sender, agency, docType, content, priority } = req.body;
    const id = `HS-${Math.floor(1000 + Math.random() * 9000)}`;
    systemState.applications[id] = {
        id, sender, agency, docType, content, priority,
        status: "Đang Chờ Tiếp Nhận", stamp: "stamp-pending", handler: "Chưa phân phối", handlerTitle: "Hệ thống tự động",
        logs: [{ sender: "Hệ thống", msg: "Khởi tạo thành công hồ sơ trực tuyến.", time: new Date().toLocaleTimeString('vi-VN') }],
        satisfaction: null, isLocked: false
    };
    addLog(`Cư dân @${sender} nộp thủ tục hành chính trực tuyến mới [${id}].`);
    broadcastUpdate();
    io.emit('newApplicationAlert', { id, agency, docType, priority });
    res.json({ success: true, id });
});

app.post('/api/officer/save', (req, res) => {
    const { username, password, displayName, role, agency } = req.body;
    systemState.authorizedPersonnel[username] = { username, password, displayName, role, agency, positiveRatings: 0, negativeRatings: 0 };
    addLog(`Điều chỉnh quyền hạn nhân sự chứng thư cán bộ: @${username}.`);
    broadcastUpdate(); res.json({ success: true });
});

app.post('/api/officer/delete', (req, res) => {
    if (req.body.username !== 'admin') { delete systemState.authorizedPersonnel[req.body.username]; broadcastUpdate(); }
    res.json({ success: true });
});

app.post('/api/national/publish', (req, res) => {
    const { type, title, content } = req.body;
    systemState.announcements.unshift({ id: `AN-${Math.floor(100 + Math.random() * 900)}`, type, title, content, timestamp: new Date().toLocaleString('vi-VN') });
    addLog(`Ban hành sắc lệnh chỉ thị quốc gia diện rộng: [${title}].`);
    broadcastUpdate(); res.json({ success: true });
});

app.post('/api/national/ticker', (req, res) => { systemState.tickerMessage = req.body.message; broadcastUpdate(); res.json({ success: true }); });
app.post('/api/national/security', (req, res) => { systemState.securityLevel = req.body.level; addLog(`Cập nhật mức độ báo động an ninh quốc gia: [${req.body.level}].`); broadcastUpdate(); res.json({ success: true }); });

io.on('connection', (socket) => {
    socket.emit('initData', { systemState, citizenIdentityRegistry, criminalRecordsRegistry });
});

server.listen(PORT, () => console.log(`[CORE CENTRAL MATRIX v7.0] ONLINE ON PORT ${PORT}`));
