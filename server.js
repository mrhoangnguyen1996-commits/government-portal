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

// CƠ SỞ DỮ LIỆU STATE MATRIX TOÀN QUỐC BẢO MẬT v5.6
let systemState = {
    securityLevel: "AN TOÀN",
    tickerMessage: "⚡ HỆ THỐNG LIÊN THÔNG QUỐC GIA CHÍNH PHỦ SỐ: Yêu cầu các bộ phận xử lý hồ sơ cư dân đúng quy trình kịch bản. Chú ý theo dõi bảng báo cáo ca trực và luân chuyển đơn thư vượt thẩm quyền kịp thời.",
    stats: {
        totalTraffic: 1420,
        pendingCount: 1,
        approvedCount: 12,
        rejectedCount: 3,
        archivedCount: 45
    },
    systemLogs: [
        { time: new Date().toLocaleTimeString('vi-VN') + " - 28/06/2026", text: "Trục cơ sở dữ liệu số hóa quốc gia v5.6 khởi chạy hoàn tất." }
    ],
    announcements: [
        { id: "AN-101", type: "QUYẾT ĐỊNH", title: "Áp dụng Luật số hóa hồ sơ kịch bản và phân tầng quyền tư pháp 2026", content: "Đồng bộ hóa phôi con dấu điện tử, tách biệt cổng cấp phôi độc lập và nâng cấp Trợ lý AI Tuệ Đức đọc trạng thái lõi.", timestamp: "28/06/2026, 08:00:00" }
    ],
    criminalWantedList: [
        { name: "Nguyen_Van_A", crime: "Tổ chức đua xe kịch bản và chống người thi hành công vụ", bounty: "20,000,000 VND", date: "25/06/2026" }
    ],
    applications: {
        "HS-1001": {
            id: "HS-1001", sender: "Nguyen_Manh_Hoang", agency: "BỘ CÔNG AN", docType: "CĂN CƯỚC CÔNG DÂN",
            content: "Xin cấp lại thẻ căn cước công dân gắn chíp điện tử do bị thất lạc trong quá trình làm việc kịch bản.",
            status: "Đang Chờ Tiếp Nhận", stamp: "stamp-pending", handler: "Chưa phân phối", handlerTitle: "Trực ban liên thông",
            logs: [{ sender: "Hệ thống", msg: "Khởi tạo thành công hồ sơ trên cổng liên thông quốc gia.", time: new Date().toLocaleTimeString('vi-VN') }],
            satisfaction: null, priority: "BÌNH THƯỜNG"
        }
    },
    archivedApplications: {},
    shiftReports: [
        { id: "RP-99", date: "28/06/2026", officer: "Thiếu Tá Lê Minh Tuấn", agency: "BỘ CÔNG AN", taskStatus: "HOÀN THÀNH XUẤT SẮC", content: "Hoàn tất tuần tra quảng trường kịch bản, xử lý 4 biên bản giao thông, quân số trực ban đầy đủ.", status: "ĐÃ PHÊ DUYỆT", feedback: "Rất tốt." }
    ],
    authorizedPersonnel: {
        "admin": { username: "admin", password: "123", displayName: "Văn Phòng Trung Ương Điều Hành", role: "ADMIN", agency: "VĂN PHÒNG CHÍNH PHỦ", positiveRatings: 10, negativeRatings: 0 },
        "canbo1": { username: "canbo1", password: "123", displayName: "Thiếu Tá Lê Minh Tuấn", role: "CHUYÊN VIÊN", agency: "BỘ CÔNG AN", positiveRatings: 5, negativeRatings: 1 },
        "lanhdao1": { username: "lanhdao1", password: "123", displayName: "Đại Tá Nguyễn Hoàng", role: "LÃNH ĐẠO", agency: "BỘ CÔNG AN", positiveRatings: 18, negativeRatings: 0 },
        "thanhtra1": { username: "thanhtra1", password: "123", displayName: "Thanh Tra Viên Trần Lực", role: "THANH TRA", agency: "THANH TRA CHÍNH PHỦ", positiveRatings: 4, negativeRatings: 0 }
    }
};

// CỐ ĐỊNH SỐ CĂN CƯỚC (CCCDNUMBER) TRÊN SERVER ĐỂ KHÔNG BỊ NHẢY SỐ KHI LOÀI LẠI
let citizenIdentityRegistry = {
    "nguyen_manh_hoang": { name: "Nguyễn Mạnh Hoàng", dob: "18/05/1996", gender: "Nam", pob: "Lâm Đồng, Việt Nam", job: "Chuyên Viên Thẩm Định Cung Ứng Vật Tư Cao Cấp", licenses: ["Bằng Lái Xe Ô Tô Hạng B2", "Giấy Phép Sử Dụng Công Cụ Hỗ Trợ"], status: "Dân Cư Hợp Pháp - Lý Lịch Trong Sạch", cccdNumber: "068019964582" }
};

let criminalRecordsRegistry = {
    "nguyen_manh_hoang": [{ id: "VP-501", type: "VI PHẠM GIAO THÔNG", lawClause: "Điều 5 Nghị định 100/2019/NĐ-CP - Vượt đèn đỏ kịch bản", fine: "4,000,000 VND", status: "Đã Nộp Phạt", officer: "Thiếu Tá Lê Minh Tuấn", date: "10/05/2026" }]
};

function addLog(text) {
    const timeStr = new Date().toLocaleTimeString('vi-VN') + " - 28/06/2026";
    systemState.systemLogs.unshift({ time: timeStr, text });
}

function updateStats() {
    systemState.stats.pendingCount = Object.keys(systemState.applications).filter(k => systemState.applications[k].status === "Đang Chờ Tiếp Nhận" || systemState.applications[k].status === "Trình Duyệt Sắc Lệnh").length;
    systemState.stats.archivedCount = Object.keys(systemState.archivedApplications).length;
}

function broadcastUpdate() {
    updateStats();
    io.emit('stateUpdate', { systemState, citizenIdentityRegistry, criminalRecordsRegistry });
}

function processBotAI(msg) {
    const text = msg.toUpperCase().trim();
    systemState.stats.totalTraffic += 1;

    if (text.includes("HS-") || text.includes("HỒ SƠ")) {
        const match = text.match(/HS-\d+/);
        if (match) {
            const appId = match[0];
            const app = systemState.applications[appId] || systemState.archivedApplications[appId];
            if (app) {
                return `🤖 [Tuệ Đức AI Hub]: Đã quét thấy lõi hồ sơ mang mã hiệu ${appId}. Đơn vị thụ lý: [${app.agency}]. Trạng thái hiện tại trên trục: "${app.status}". Công dân gửi đơn: @${app.sender}.`;
            }
        }
        return "🤖 [Tuệ Đức AI Hub]: Bạn đang tìm kiếm tiến độ đơn thư? Hãy nhập chính xác mã định danh hồ sơ dạng như `HS-1001` để tôi truy quét dữ liệu liên thông.";
    }
    
    // Tìm kiếm thông minh không phân biệt hoa thường cho Bot AI
    for (let username in citizenIdentityRegistry) {
        if (text.includes(username.toUpperCase()) || text.includes(citizenIdentityRegistry[username].name.toUpperCase())) {
            const citizen = citizenIdentityRegistry[username];
            const v = criminalRecordsRegistry[username] || [];
            return `🤖 [Hồ sơ Cư dân]: Tra cứu tự động tìm thấy cư dân ${citizen.name} | Số định danh CCCD: ${citizen.cccdNumber} | Trạng thái tư pháp kịch bản: ${citizen.status}. Số lần vi phạm hành chính: ${v.length} lần.`;
        }
    }

    if (text.includes("CHÀO") || text.includes("BOT") || text.includes("TUỆ ĐỨC")) {
        return "🤖 Kính chào công dân và các cán bộ chuyên viên! Tôi là Tuệ Đức v5.6 - Trợ lý số hóa của Chính phủ số. Tôi nắm toàn bộ trục dữ liệu liên thông. Hãy nhập mã hồ sơ hoặc tên tài khoản công dân để tôi bóc tách thông tin.";
    }
    return "🤖 [Trợ Lý Tuệ Đức]: Hệ thống chưa nhận dạng được nghiệp vụ tương ứng. Bạn có thể hỏi về mã số đơn thư `HS-XXXX` hoặc nhập tên tài khoản cư dân cần thẩm định lý lịch.";
}

app.get('/', (req, res) => {
    res.render('index', { state: systemState, registry: citizenIdentityRegistry, violations: criminalRecordsRegistry });
});

app.post('/api/bot/chat', (req, res) => {
    res.json({ reply: processBotAI(req.body.message) });
});

// ROUTE THAO TÁC NGHIỆP VỤ HỒ SƠ - SỬA LỖI ĐỒNG BỘ ĐIỀU HÀNH
app.post('/api/applications/action', (req, res) => {
    const { id, action, msg, officerName, officerRole, status, stamp, targetAgency } = req.body;
    let app = systemState.applications[id] || systemState.archivedApplications[id];
    if (!app) return res.status(404).json({ error: "Không tìm thấy hồ sơ hành chính trên trục liên thông." });
    const timeNow = new Date().toLocaleTimeString('vi-VN');

    if (action === 'chat') {
        app.logs.push({ sender: officerName, msg, time: timeNow });
        io.emit('newChatMessage', { fileId: id });
    } else if (action === 'claim_packet') {
        app.status = "Đã Tiếp Nhận Xử Lý"; 
        app.stamp = "stamp-forwarded"; 
        app.handler = officerName; 
        app.handlerTitle = officerRole;
        app.logs.push({ sender: "Hệ thống số hóa", msg: `Cán bộ nghiệp vụ ${officerName} đã ký số tiếp nhận phụ trách hồ sơ này.`, time: timeNow });
        addLog(`Hồ sơ ${id} đã được phân phối thụ lý cho cán bộ ${officerName}.`);
    } else if (action === 'status') {
        app.status = status; 
        app.stamp = stamp;
        if(status === 'Đã Phê Duyệt') systemState.stats.approvedCount++;
        if(status === 'Bị Bác Bỏ') systemState.stats.rejectedCount++;
        app.logs.push({ sender: "Hội đồng thẩm định", msg: `Cán bộ quyền hạn ${officerName} thay đổi trạng thái hồ sơ sang: [${status}].`, time: timeNow });
        addLog(`Hồ sơ mang mã số ${id} thay đổi trạng thái xử lý sang: ${status} bởi ${officerName}.`);
    } else if (action === 'forward') { 
        app.logs.push({ sender: "Hệ thống điều phối", msg: `Hồ sơ vượt thẩm quyền, cán bộ ${officerName} ký chuyển ngành liên thông sang đơn vị bộ phận: [${targetAgency}].`, time: timeNow });
        app.agency = targetAgency; 
        app.status = "Đang Chờ Tiếp Nhận"; 
        app.stamp = "stamp-pending";
        addLog(`Hồ sơ ${id} được điều chuyển phân luồng nghiệp vụ sang cơ quan ban ngành [${targetAgency}].`);
    } else if (action === 'archive') {
        app.status = "Đã Đóng & Lưu Kho Mật"; 
        app.stamp = "stamp-archived";
        systemState.archivedApplications[id] = app; 
        delete systemState.applications[id];
        addLog(`Niêm phong vĩnh viễn hồ sơ ${id} chuyển lưu kho dữ liệu mật quốc gia.`);
    } else if (action === 'satisfaction') {
        app.satisfaction = status;
        if (status === 'KHIẾU NẠI CẤP CAO') {
            app.status = "Đang Khiếu Nại Cấp Cao"; 
            app.stamp = "stamp-rejected"; 
            app.agency = "THANH TRA CHÍNH PHỦ";
            app.logs.push({ sender: "Hệ thống tự động", msg: "🚨 CÔNG DÂN CHÍNH THỨC PHÁT LỆNH KHIẾU NẠI KHẨN CẤP VỀ QUY TRÌNH HÀNH CHÍNH LÊN THANH TRA CHÍNH PHỦ.", time: timeNow });
        } else {
            Object.values(systemState.authorizedPersonnel).forEach(u => { if (u.displayName === app.handler) { if (status === 'HÀI LÒNG') u.positiveRatings++; else u.negativeRatings++; } });
        }
    }
    broadcastUpdate();
    res.json({ success: true });
});

// ROUTE ĐĂNG KÝ CƯ DÂN MỚI - TỰ ĐỘNG CẤP MÃ SỐ ĐỊNH DANH CCCD CỐ ĐỊNH TRÊN SERVER
app.post('/api/resident/register', (req, res) => {
    const { username, name, dob, gender, pob, job, licenses, status } = req.body;
    const cleanKey = username.toLowerCase().trim();
    
    // Tạo số định danh ngẫu nhiên cố định từ server nếu chưa có tài khoản cư dân cũ
    const randomCccd = "0680" + Math.floor(10000000 + Math.random() * 90000000);
    
    citizenIdentityRegistry[cleanKey] = { 
        name, dob, gender, pob, job, 
        licenses: licenses ? licenses.split(',').map(l => l.trim()) : [], 
        status,
        cccdNumber: citizenIdentityRegistry[cleanKey] ? citizenIdentityRegistry[cleanKey].cccdNumber : randomCccd
    };
    
    addLog(`Đồng bộ dữ liệu số hóa định danh công dân mới thành công: @${username} (Phôi căn cước: ${citizenIdentityRegistry[cleanKey].cccdNumber}).`);
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/resident/add-license', (req, res) => {
    const { username, licenseName, issueAgency, signOfficer, duration } = req.body;
    const cleanKey = username.toLowerCase().trim();
    if (citizenIdentityRegistry[cleanKey]) {
        const phoiData = `Văn bằng: ${licenseName} | Đơn vị cấp: ${issueAgency} | Ấn ký: ${signOfficer} | Thời hạn kịch bản: ${duration}`;
        citizenIdentityRegistry[cleanKey].licenses.push(phoiData);
        addLog(`Cán bộ cấp phôi giấy tờ nghiệp vụ nâng cao cho cư dân @${username}: [${licenseName}].`);
        broadcastUpdate();
        res.json({ success: true });
    } else { res.status(404).json({ error: "Không tồn tại tài khoản công dân." }); }
});

app.post('/api/officer/report', (req, res) => {
    const { officer, agency, taskStatus, content } = req.body;
    const id = `RP-${Math.floor(100 + Math.random() * 900)}`;
    systemState.shiftReports.unshift({ id, date: new Date().toLocaleDateString('vi-VN'), officer, agency, taskStatus, content, status: "CHỜ PHÊ DUYỆT", feedback: "" });
    addLog(`Cán bộ trực ban [${officer}] nộp báo cáo tình trạng công việc hàng ngày [${id}]: [${taskStatus}].`);
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/officer/report-action', (req, res) => {
    const { id, status, feedback } = req.body;
    let rp = systemState.shiftReports.find(r => r.id === id);
    if (rp) { rp.status = status; rp.feedback = feedback; broadcastUpdate(); }
    res.json({ success: true });
});

app.post('/api/resident/violation', (req, res) => {
    const { username, type, lawClause, fine, status, officerName } = req.body;
    const cleanKey = username.toLowerCase().trim();
    if (!criminalRecordsRegistry[cleanKey]) criminalRecordsRegistry[cleanKey] = [];
    const recordId = `VP-${Math.floor(100 + Math.random() * 900)}`;
    criminalRecordsRegistry[cleanKey].unshift({ id: recordId, type, lawClause, fine, status, officer: officerName, date: new Date().toLocaleDateString('vi-VN') });
    addLog(`Lập biên bản xử lý kỷ luật vi phạm [${recordId}] áp dụng cho công dân @${username}.`);
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/applications/submit', (req, res) => {
    const { sender, agency, docType, content, priority } = req.body;
    const id = `HS-${Math.floor(1000 + Math.random() * 9000)}`;
    systemState.applications[id] = {
        id, sender, agency, docType, content, priority,
        status: "Đang Chờ Tiếp Nhận", stamp: "stamp-pending", handler: "Chưa phân phối", handlerTitle: "Hệ thống tự động",
        logs: [{ sender: "Hệ thống", msg: "Đơn thư số hóa truyền tải lên trục liên thông thành công.", time: new Date().toLocaleTimeString('vi-VN') }],
        satisfaction: null
    };
    addLog(`Công dân @${sender} nộp thủ tục hành chính trực tuyến [${id}] sang đơn vị [${agency}].`);
    broadcastUpdate();
    io.emit('newApplicationAlert', { id, agency, docType, priority });
    res.json({ success: true, id });
});

app.post('/api/national/publish', (req, res) => {
    const { type, title, content, author } = req.body;
    const timeNow = new Date().toLocaleString('vi-VN');
    if(type === "TRUY NÃ") {
        systemState.criminalWantedList.unshift({ name: title, crime: content, bounty: "50,000,000 VND", date: timeNow });
        addLog(`Cấp quản lý ${author} đã phát lệnh truy nã khẩn cấp đối với bị can: @${title}.`);
    } else {
        const id = `AN-${Math.floor(100 + Math.random() * 900)}`;
        systemState.announcements.unshift({ id, type, title, content, timestamp: timeNow });
        addLog(`Cán bộ cấp cao ${author} đã ban hành ấn bản sắc lệnh quốc gia mới: [${title}].`);
    }
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/national/delete-announcement', (req, res) => {
    const { id } = req.body;
    systemState.announcements = systemState.announcements.filter(a => a.id !== id);
    addLog(`Yêu cầu gỡ bỏ ấn bản số hóa mang định danh ${id} hoàn tất.`);
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/officer/save', (req, res) => {
    const { username, password, displayName, role, agency } = req.body;
    systemState.authorizedPersonnel[username] = { username, password, displayName, role, agency, positiveRatings: 0, negativeRatings: 0 };
    addLog(`Cấp điều chỉnh chứng thư quyền hạn nhân sự quốc gia: @${username} (${displayName}).`);
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/officer/delete', (req, res) => {
    if (req.body.username !== 'admin') { delete systemState.authorizedPersonnel[req.body.username]; broadcastUpdate(); }
    res.json({ success: true });
});

app.post('/api/national/ticker', (req, res) => { systemState.tickerMessage = req.body.message; broadcastUpdate(); res.json({ success: true }); });
app.post('/api/national/security', (req, res) => { systemState.securityLevel = req.body.level; broadcastUpdate(); res.json({ success: true }); });

io.on('connection', (socket) => {
    socket.emit('initData', { systemState, citizenIdentityRegistry, criminalRecordsRegistry });
});

server.listen(PORT, () => console.log(`[REALTIME CORE LOGIC V5.6] RUNNING SUCESSFULLY ON PORT ${PORT}`));
