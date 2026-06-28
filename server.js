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

// MA TRẬN STATE HỆ THỐNG QUỐC GIA TOÀN DIỆN v6.5
let systemState = {
    securityLevel: "AN TOÀN",
    tickerMessage: "⚡ MA TRẬN QUỐC VỤ SỐ v6.5: Cổng tiếp nhận liên thông tối cao. Yêu cầu chuyên viên ca trực xử lý hồ sơ cư dân đúng kịch bản nhập vai, luân chuyển đơn vượt thẩm quyền kịp thời.",
    systemLogs: [
        { time: new Date().toLocaleTimeString('vi-VN') + " - 28/06/2026", text: "Lõi ma trận liên thông v6.5 cấu trúc siêu đa nhiệm chính thức kích hoạt vận hành." }
    ],
    announcements: [
        { id: "AN-101", type: "QUYẾT ĐỊNH", title: "Áp dụng Luật số hóa hồ sơ kịch bản và phân tầng quyền tư pháp 2026", content: "Đồng bộ hóa phôi con dấu điện tử, tách biệt cổng cấp phôi độc lập và nâng cấp Trợ lý AI Tuệ Đức đọc trạng thái lõi.", timestamp: "28/06/2026, 08:00:00" }
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
    shiftReports: [
        { id: "RP-99", date: "28/06/2026", officer: "Thiếu Tá Lê Minh Tuấn", agency: "CÔNG AN", taskStatus: "HOÀN THÀNH XUẤT SẮC", content: "Hoàn tất tuần tra quảng trường kịch bản, xử lý 4 biên bản giao thông, quân số trực ban đầy đủ.", status: "ĐÃ PHÊ DUYỆT", feedback: "Rất tốt." }
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
    "Nguyen_Manh_Hoang": [{ id: "VP-501", type: "VI PHẠM GIAO THÔNG", lawClause: "Điều 5 Nghị định 100/2019/NĐ-CP - Vượt đèn đỏ kịch bản", fine: "4,000,000 VND", status: "Đã Nộp Phạt", officer: "Thiếu Tá Lê Minh Tuấn", date: "10/05/2026" }]
};

function addLog(text) {
    const timeStr = new Date().toLocaleTimeString('vi-VN') + " - 28/06/2026";
    systemState.systemLogs.unshift({ time: timeStr, text });
}

function broadcastUpdate() {
    io.emit('stateUpdate', { systemState, citizenIdentityRegistry, criminalRecordsRegistry });
}

// BOT AI TUỆ ĐỨC v6.5 - CHÂN THỰC, TƯƠNG TÁC ĐA LUỒNG SÂU
function processBotAI(msg) {
    const text = msg.toUpperCase();
    if (text.includes("HS-") || text.includes("HỒ SƠ")) {
        const match = text.match(/HS-\d+/);
        if (match) {
            const appId = match[0];
            const app = systemState.applications[appId] || systemState.archivedApplications[appId];
            if (app) {
                return `🤖 [QUÉT KHẨN CẤP] Phát hiện hồ sơ hành chính ${appId} trên trục liên thông!\n• Đơn vị quản lý: [${app.agency}]\n• Trạng thái hiện tại: "${app.status}"\n• Cán bộ phụ trách: ${app.handler}\n• Khóa tương tác: ${app.isLocked ? "Đã khóa (Chờ Lãnh Đạo đóng đơn)" : "Mở (Cho phép chuyên viên xử lý)"}.`;
            }
        }
    }
    for (let username in citizenIdentityRegistry) {
        if (text.includes(username.toUpperCase()) || text.includes(citizenIdentityRegistry[username].name.toUpperCase())) {
            const citizen = citizenIdentityRegistry[username];
            const v = criminalRecordsRegistry[username] || [];
            return `👤 [HỒ SƠ CƯ DÂN TRÍ TUỆ NHÂN TẠO] Khớp lệnh định danh tài khoản @${username}:\n• Tên thật: ${citizen.name}\n• Trạng thái tư pháp: ${citizen.status}\n• Lịch sử vi phạm kịch bản: ${v.length} lần.\nHệ thống đánh giá cư dân: ${v.length > 2 ? "🚨 DIỆN THEO DÕI ĐẶC BIỆT" : "✅ LÝ LỊCH TRONG SẠCH"}.`;
        }
    }
    if (text.includes("XIN CHỦ TRƯƠNG") || text.includes("HỢP ĐỒNG")) return "🤖 [TƯ VẤN QUỐC VỤ Số]: Các văn bản xin chủ trương hoặc hợp đồng kinh tế của khách sạn Golden Sun / Golden Imperial yêu cầu lập đơn gửi trực tiếp sang phòng CHÍNH PHỦ số để thẩm duyệt điều khoản.";
    if (text.includes("CĂN CƯỚC") || text.includes("CCD")) return "🤖 [HƯỚNG DẪN]: Thủ tục đổi căn cước công dân gắn chip yêu cầu đính kèm phôi ảnh nền xanh và nộp trực tuyến về cơ quan BỘ CÔNG AN.";
    return "🤖 Tôi là Trợ lý ảo Tối cao Tuệ Đức v6.5. Tôi có khả năng truy quét toàn bộ cơ sở dữ liệu `systemState`. Hãy nhập mã hồ sơ (Ví dụ: HS-1001) hoặc tên tài khoản để tôi bóc tách ma trận ngay!";
}

app.get('/', (req, res) => {
    res.render('index', { state: systemState, registry: citizenIdentityRegistry, violations: criminalRecordsRegistry });
});

app.post('/api/bot/chat', (req, res) => {
    res.json({ reply: processBotAI(req.body.message) });
});

// THỰC THI LUỒNG BUSINESS LOGIC QUỐC VỤ HÀNH CHÍNH v6.5
app.post('/api/applications/action', (req, res) => {
    const { id, action, msg, officerName, officerRole, status, stamp, targetAgency } = req.body;
    let app = systemState.applications[id] || systemState.archivedApplications[id];
    if (!app) return res.status(404).json({ error: "Không tìm thấy hồ sơ trên hệ thống trục." });
    const timeNow = new Date().toLocaleTimeString('vi-VN');

    // NÚT THẮT QUY TRÌNH HÀI LÒNG / KHIẾU NẠI LOGIC REAL 100%
    if (app.isLocked && action !== 'archive' && action !== 'chat') {
        return res.status(403).json({ error: "Hồ sơ này đã được công dân bấm Hài Lòng và đã LOCK. Chuyên viên không thể thao tác đổi trạng thái thông thường, chỉ Lãnh đạo mới có quyền ký chuyển tiếp đóng và lưu kho mật." });
    }

    if (action === 'chat') {
        app.logs.push({ sender: officerName, msg, time: timeNow });
        io.emit('newChatMessage', { fileId: id });
    } else if (action === 'claim_packet') {
        app.status = "Đã Tiếp Nhận Xử Lý"; app.stamp = "stamp-forwarded"; app.handler = officerName; app.handlerTitle = officerRole;
        app.logs.push({ sender: "Hệ thống số hóa", msg: `Cán bộ nghiệp vụ ${officerName} đã ký số tiếp nhận phụ trách hồ sơ này.`, time: timeNow });
        addLog(`Hồ sơ ${id} đã được phân phối thụ lý cho cán bộ ${officerName}.`);
    } else if (action === 'status') {
        app.status = status; app.stamp = stamp;
        app.logs.push({ sender: "Hội đồng thẩm định", msg: `Cán bộ quyền hạn ${officerName} thay đổi trạng thái hồ sơ sang: [${status}].`, time: timeNow });
        addLog(`Hồ sơ mang mã số ${id} thay đổi trạng thái xử lý sang: ${status} bởi ${officerName}.`);
    } else if (action === 'forward') { 
        app.logs.push({ sender: "Hệ thống điều phối", msg: `Cán bộ hồ sơ phát hiện sai cơ quan tiếp nhận, thực hiện lệnh CHUYỂN TIẾP HỒ SƠ sang cơ quan phụ trách: [${targetAgency}].`, time: timeNow });
        app.agency = targetAgency; app.status = "Đang Chờ Tiếp Nhận"; app.stamp = "stamp-pending"; app.handler = "Chưa phân phối";
        addLog(`Hồ sơ ${id} được luân chuyển phòng ban sang đơn vị [${targetAgency}] do sai cơ quan tiếp nhận.`);
    } else if (action === 'archive') {
        app.status = "Đã Đóng & Lưu Kho Mật"; app.stamp = "stamp-archived"; app.isLocked = true;
        systemState.archivedApplications[id] = app; delete systemState.applications[id];
        addLog(`Lãnh đạo cấp cao duyệt sắc lệnh đóng vĩnh viễn hồ sơ ${id}, niêm phong lưu kho bảo mật dữ liệu hành chính quốc gia.`);
    } else if (action === 'satisfaction') {
        app.satisfaction = status;
        if (status === 'KHIẾU NẠI CẤP CAO') {
            app.status = "Đang Khiếu Nại Cấp Cao"; app.stamp = "stamp-rejected"; app.agency = "THANH TRA"; app.isLocked = false;
            app.logs.push({ sender: "Hệ thống tự động", msg: "🚨 CÔNG DÂN PHÁT LỆNH KHIẾU NẠI QUY TRÌNH HÀNH CHÍNH. Tự động chuyển tiếp hồ sơ về cơ quan THANH TRA CHÍNH PHỦ để thụ lý điều tra chuyên sâu.", time: timeNow });
            addLog(`Hồ sơ ${id} chuyển luồng khẩn cấp về Thanh Tra Chính Phủ do phát sinh đơn khiếu nại của cư dân.`);
        } else if (status === 'HÀI LÒNG') {
            app.isLocked = true; // KHÓA CỨNG HỒ SƠ VỚI CẤP CÁN BỘ TIẾP NHẬN
            app.status = "Hoàn Tất - Chờ Lãnh Đạo Đóng Đơn";
            app.logs.push({ sender: "Hệ thống tự động", msg: "✅ Công dân bấm HÀI LÒNG. Hệ thống tự động LOCK hồ sơ, cán bộ không thể tương tác, chờ chuyển tiếp cho cấp Lãnh đạo ký đóng hồ sơ lưu trữ.", time: timeNow });
            Object.values(systemState.authorizedPersonnel).forEach(u => { if (u.displayName === app.handler) u.positiveRatings++; });
            addLog(`Hồ sơ ${id} hoàn tất xuất sắc, công dân hài lòng, kích hoạt cơ chế khóa lõi.`);
        }
    }
    broadcastUpdate();
    res.json({ success: true });
});

// ROUTE TIỆN ÍCH LIÊN THÔNG VẬN HÀNH
app.post('/api/resident/add-license', (req, res) => {
    const { username, licenseName, issueAgency, signOfficer, duration } = req.body;
    if (citizenIdentityRegistry[username]) {
        citizenIdentityRegistry[username].licenses.push(`Văn bằng: ${licenseName} | Đơn vị cấp: ${issueAgency} | Ấn ký: ${signOfficer} | Thời hạn: ${duration}`);
        addLog(`Cấp phôi chứng thư nghiệp vụ mới cho cư dân @${username}: [${licenseName}].`);
        broadcastUpdate(); res.json({ success: true });
    } else { res.status(404).json({ error: "Không tìm thấy tài khoản cư dân." }); }
});

app.post('/api/officer/report', (req, res) => {
    const { officer, agency, taskStatus, content } = req.body;
    const id = `RP-${Math.floor(100 + Math.random() * 900)}`;
    systemState.shiftReports.unshift({ id, date: new Date().toLocaleDateString('vi-VN'), officer, agency, taskStatus, content, status: "CHỜ PHÊ DUYỆT", feedback: "" });
    addLog(`Cán bộ trực ban [${officer}] nộp báo cáo ca trực công vụ [${id}].`);
    broadcastUpdate(); res.json({ success: true });
});

app.post('/api/officer/report-action', (req, res) => {
    const { id, status, feedback } = req.body;
    let rp = systemState.shiftReports.find(r => r.id === id);
    if (rp) { rp.status = status; rp.feedback = feedback; addLog(`Quyết định phê duyệt nhật ký ca trực [${id}] sang trạng thái: [${status}].`); broadcastUpdate(); }
    res.json({ success: true });
});

app.post('/api/resident/violation', (req, res) => {
    const { username, type, lawClause, fine, status, officerName } = req.body;
    if (!criminalRecordsRegistry[username]) criminalRecordsRegistry[username] = [];
    criminalRecordsRegistry[username].unshift({ id: `VP-${Math.floor(100 + Math.random() * 900)}`, type, lawClause, fine, status, officer: officerName, date: new Date().toLocaleDateString('vi-VN') });
    addLog(`Ký ban hành quyết định xử phạt kỷ luật áp dụng cho cư dân @${username}.`);
    broadcastUpdate(); res.json({ success: true });
});

app.post('/api/resident/register', (req, res) => {
    const { username, name, dob, gender, pob, job, licenses, status } = req.body;
    citizenIdentityRegistry[username] = { name, dob, gender, pob, job, licenses: licenses ? licenses.split(',').map(l => l.trim()) : [], status };
    addLog(`Số hóa định danh cư dân gốc toàn quốc mới: @${username}.`);
    broadcastUpdate(); res.json({ success: true });
});

app.post('/api/applications/submit', (req, res) => {
    const { sender, agency, docType, content, priority } = req.body;
    const id = `HS-${Math.floor(1000 + Math.random() * 9000)}`;
    systemState.applications[id] = {
        id, sender, agency, docType, content, priority,
        status: "Đang Chờ Tiếp Nhận", stamp: "stamp-pending", handler: "Chưa phân phối", handlerTitle: "Hệ thống tự động",
        logs: [{ sender: "Hệ thống", msg: "Đơn thư trực tuyến truyền tải lên cổng liên thông thành công.", time: new Date().toLocaleTimeString('vi-VN') }],
        satisfaction: null, isLocked: false
    };
    addLog(`Cư dân @${sender} gửi thủ tục hành chính trực tuyến [${id}] đến ban ngành [${agency}].`);
    broadcastUpdate();
    io.emit('newApplicationAlert', { id, agency, docType, priority });
    res.json({ success: true, id });
});

app.post('/api/officer/save', (req, res) => {
    const { username, password, displayName, role, agency } = req.body;
    systemState.authorizedPersonnel[username] = { username, password, displayName, role, agency, positiveRatings: 0, negativeRatings: 0 };
    addLog(`Cấp phát/Chỉnh sửa chứng thư đặc quyền cán bộ nghiệp vụ quốc gia: @${username}.`);
    broadcastUpdate(); res.json({ success: true });
});

app.post('/api/officer/delete', (req, res) => {
    if (req.body.username !== 'admin') { delete systemState.authorizedPersonnel[req.body.username]; broadcastUpdate(); }
    res.json({ success: true });
});

app.post('/api/national/publish', (req, res) => {
    const { type, title, content } = req.body;
    systemState.announcements.unshift({ id: `AN-${Math.floor(100 + Math.random() * 900)}`, type, title, content, timestamp: new Date().toLocaleString('vi-VN') });
    addLog(`Ban hành chỉ thị tối cao quốc gia diện rộng: [${title}].`);
    broadcastUpdate(); res.json({ success: true });
});

app.post('/api/national/ticker', (req, res) => { systemState.tickerMessage = req.body.message; broadcastUpdate(); res.json({ success: true }); });
app.post('/api/national/security', (req, res) => { systemState.securityLevel = req.body.level; addLog(`Cập nhật mức độ báo động an ninh quốc gia: [${req.body.level}].`); broadcastUpdate(); res.json({ success: true }); });

io.on('connection', (socket) => {
    socket.emit('initData', { systemState, citizenIdentityRegistry, criminalRecordsRegistry });
});

server.listen(PORT, () => console.log(`[REALTIME MATRIX CORE v6.5] ACTIVE ON PORT ${PORT}`));
