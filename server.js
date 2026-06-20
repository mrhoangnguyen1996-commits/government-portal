const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// KHO DỮ LIỆU SỐ HÓA TRÊN RAM SERVER
let systemState = {
    securityLevel: "AN TOÀN",
    tickerMessage: "⚡ HỆ THỐNG LIÊN THÔNG QUỐC GIA: Yêu cầu các đơn vị nghiêm túc thực hiện số hóa thủ tục hành chính năm 2026. Kiểm tra nghiêm ngặt dữ liệu định danh cư dân trước khi phê duyệt con dấu điện tử.",
    systemLogs: [
        { time: new Date().toLocaleTimeString('vi-VN') + " - 15/06/2026", text: "Hệ thống máy chủ tối cao khởi động thành công trên Web Service." }
    ],
    announcements: [
        { id: "NEWS-1001", type: "QUYẾT ĐỊNH", title: "Vận hành Cổng thông tin điện tử liên thông Quốc Gia", content: "Chính thức chuyển dịch số hóa thủ tục hành chính, đồng bộ dữ liệu dân cư.", timestamp: "15/06/2026, 08:00:00" }
    ],
    criminalWantedList: [
        { name: "Nguyen_Van_A", crime: "Tổ chức đua xe trái phép và chống người thi hành công vụ", bounty: "20,000,000 VND", date: "14/06/2026" }
    ],
    applications: {
        "HS-1001": {
            id: "HS-1001", sender: "Nguyen_Manh_Hoang", agency: "CÔNG AN", docType: "CĂN CƯỚC CÔNG DÂN",
            content: "Xin cấp lại thẻ căn cước công dân gắn chíp điện tử định danh do bị mất.",
            status: "Đang Chờ Tiếp Nhận", stamp: "stamp-pending", handler: "Chưa phân phối", handlerTitle: "Trực ban liên thông",
            logs: [{ sender: "Hệ thống", msg: "Hồ sơ số hóa khởi tạo thành công trên cổng liên thông.", time: new Date().toLocaleTimeString('vi-VN') }],
            satisfaction: null
        }
    },
    archivedApplications: {
        "HS-1000": {
            id: "HS-1000", sender: "Tran_Minh_Quang", agency: "CÔNG AN", docType: "BẰNG LÁI XE TẢI HẠNG C",
            content: "Yêu cầu cấp đổi bằng lái xe tải quân dụng phục vụ hậu cần.",
            status: "Đã Phê Duyệt", stamp: "stamp-approved", handler: "Thiếu Tá Lê Minh Tuấn", handlerTitle: "CÁN BỘ",
            logs: [{ sender: "Hệ thống", msg: "Hồ sơ hoàn tất, lưu kho quốc gia.", time: "08:12:30" }],
            satisfaction: "HÀI LÒNG"
        }
    },
    authorizedPersonnel: {
        "admin": { username: "admin", password: "123", displayName: "Văn Phòng Điều Hành", role: "ADMIN", agency: "HỆ THỐNG", positiveRatings: 0, negativeRatings: 0 },
        "canbo1": { username: "canbo1", password: "123", displayName: "Thiếu Tá Lê Minh Tuấn", role: "CÁN BỘ", agency: "CÔNG AN", positiveRatings: 5, negativeRatings: 1 },
        "lanhdao1": { username: "lanhdao1", password: "123", displayName: "Đại Tá Nguyễn Hoàng", role: "LÃNH ĐẠO", agency: "CÔNG AN", positiveRatings: 8, negativeRatings: 0 },
        "thanhtra1": { username: "thanhtra1", password: "123", displayName: "Thanh Tra Viên Trần Lực", role: "THANH TRA", agency: "THANH TRA", positiveRatings: 2, negativeRatings: 0 },
        "chinhphu1": { username: "chinhphu1", password: "123", displayName: "Phó Thủ Tướng Nguyễn Minh Hoàng", role: "LÃNH ĐẠO", agency: "CHÍNH PHỦ", positiveRatings: 12, negativeRatings: 0 }
    }
};

let citizenIdentityRegistry = {
    "Nguyen_Manh_Hoang": {
        name: "Nguyễn Mạnh Hoàng", dob: "18/05/1996", gender: "Nam",
        pob: "Lâm Đồng, Việt Nam", job: "Chuyên Viên Thẩm Định Cung Ứng Vật Tư Cao Cấp",
        licenses: ["Thẻ Căn Cước Công Dân Gắn Chíp", "Bằng Lái Xe Ô Tô Hạng B2", "Giấy Phép Sử Dụng Công Cụ Hỗ Trợ"],
        status: "Dân Cư Hợp Pháp - Lý Lịch Trong Sạch"
    },
    "Tran_Minh_Quang": {
        name: "Trần Minh Quang", dob: "12/09/1990", gender: "Nam",
        pob: "Nha Trang, Khánh Hòa", job: "Giám Đốc Điều Hành Logistics Đường Bộ",
        licenses: ["Thẻ Căn Cước Công Dân Gắn Chíp", "Bằng Lái Xe Tải Hạng C"], status: "Dân Cư Hợp Pháp"
    }
};

let criminalRecordsRegistry = {
    "Nguyen_Manh_Hoang": [
        { id: "VP-501", type: "VI PHẠM GIAO THÔNG", lawClause: "Điều 5 Nghị định 100/2019/NĐ-CP - Vượt đèn đỏ kịch bản", fine: "4,000,000 VND", status: "Đã Nộp Phạt", officer: "Thiếu Tá Lê Minh Tuấn", date: "10/05/2026" }
    ]
};

function addLog(text) {
    const timeStr = new Date().toLocaleTimeString('vi-VN') + " - 20/06/2026";
    systemState.systemLogs.unshift({ time: timeStr, text });
}

function broadcastUpdate() {
    io.emit('stateUpdate', { systemState, citizenIdentityRegistry, criminalRecordsRegistry });
}

app.get('/', (req, res) => {
    res.render('index', { state: systemState, registry: citizenIdentityRegistry, violations: criminalRecordsRegistry });
});

app.get('/api/state', (req, res) => {
    res.json({ systemState, citizenIdentityRegistry, criminalRecordsRegistry });
});

// Xử lý nộp phạt hoặc cập nhật vi phạm trực tiếp
app.post('/api/resident/violation', (req, res) => {
    const { username, type, lawClause, fine, status, officerName } = req.body;
    const recordId = `VP-${Math.floor(100 + Math.random() * 900)}`;
    const dateNow = new Date().toLocaleDateString('vi-VN');

    if (!criminalRecordsRegistry[username]) { criminalRecordsRegistry[username] = []; }
    criminalRecordsRegistry[username].unshift({ id: recordId, type, lawClause, fine, status, officer: officerName, date: dateNow });

    addLog(`Cán bộ [${officerName}] lập biên bản vi phạm [${recordId}] cho cư dân: @${username}.`);
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/officer/save', (req, res) => {
    const { username, password, displayName, role, agency, isEdit } = req.body;
    if (isEdit && systemState.authorizedPersonnel[username]) {
        let old = systemState.authorizedPersonnel[username];
        systemState.authorizedPersonnel[username] = { ...old, password, displayName, role, agency };
        addLog(`ADMIN sửa quyền tài khoản: ${username}.`);
    } else {
        systemState.authorizedPersonnel[username] = { username, password, displayName, role, agency, positiveRatings: 0, negativeRatings: 0 };
        addLog(`ADMIN bổ nhiệm cán bộ mới: ${displayName}.`);
    }
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/officer/delete', (req, res) => {
    const { username } = req.body;
    if (username === 'admin') return res.status(400).json({ error: "Không thể xóa Admin" });
    if (systemState.authorizedPersonnel[username]) {
        delete systemState.authorizedPersonnel[username];
        addLog(`ADMIN xóa tài khoản nhân sự: ${username}.`);
        broadcastUpdate();
        res.json({ success: true });
    } else { res.status(404).json({ error: "Không tìm thấy" }); }
});

app.post('/api/resident/register', (req, res) => {
    const { username, name, dob, gender, pob, job, licenses, status, officerName } = req.body;
    citizenIdentityRegistry[username] = {
        name, dob, gender, pob, job,
        licenses: licenses ? licenses.split(',').map(l => l.trim()) : [],
        status
    };
    addLog(`Cán bộ [${officerName}] cấp phát/sửa đổi giấy tờ cư dân: @${username}.`);
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/applications/submit', (req, res) => {
    const { sender, agency, docType, content } = req.body;
    const id = `HS-${Object.keys(systemState.applications).length + Object.keys(systemState.archivedApplications).length + 1001}`;
    const timeNow = new Date().toLocaleTimeString('vi-VN');

    systemState.applications[id] = {
        id, sender, agency, docType, content,
        status: "Đang Chờ Tiếp Nhận", stamp: "stamp-pending", handler: "Chưa phân phối", handlerTitle: "Hệ thống tự động",
        logs: [{ sender: "Hệ thống", msg: `Đơn thư gửi đến [${agency}] thành công.`, time: timeNow }],
        satisfaction: null
    };
    addLog(`Công dân @${sender} nộp đơn hồ sơ trực tuyến [${id}].`);
    broadcastUpdate();
    io.emit('newApplicationAlert', { id, agency, docType });
    res.json({ success: true, id });
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
        app.logs.push({ sender: "Hệ thống", msg: `Hồ sơ tiếp nhận bởi Cán bộ: ${officerName}.`, time: timeNow });
        addLog(`Hồ sơ ${id} được xử lý bởi ${officerName}.`);
    } else if (action === 'status') {
        app.status = status; app.stamp = stamp; app.handler = officerName; app.handlerTitle = officerRole;
        app.logs.push({ sender: "Hệ thống", msg: `Cán bộ ${officerName} phê duyệt kết quả: [${status}].`, time: timeNow });
        addLog(`Hồ sơ ${id} cập nhật trạng thái: ${status}.`);
    } else if (action === 'archive') {
        app.status = "Đã Đóng & Lưu Kho"; app.stamp = "stamp-archived";
        app.logs.push({ sender: "Hệ thống", msg: `Hồ sơ đóng dấu niêm phong chuyển lưu kho bởi ${officerName}.`, time: timeNow });
        systemState.archivedApplications[id] = app; delete systemState.applications[id];
        addLog(`Hồ sơ ${id} đã được khóa chuyển vào Kho Lưu Trữ Quốc Gia.`);
    } else if (action === 'unarchive') {
        app.status = "Mở Lại Xử Lý Lại"; app.stamp = "stamp-pending";
        app.logs.push({ sender: "Văn Phòng Điều Hành", msg: `Sắc lệnh khôi phục hồ sơ lưu kho.`, time: timeNow });
        systemState.applications[id] = app; delete systemState.archivedApplications[id];
        addLog(`Hồ sơ ${id} được TRẢ LẠI kho để xử lý tiếp.`);
    } else if (action === 'satisfaction') {
        app.satisfaction = status;
        if (status === 'KHIẾU NẠI CẤP CAO') {
            app.status = "Đang Khiếu Nại Cấp Cao"; app.stamp = "stamp-rejected"; app.agency = "THANH TRA";
            app.logs.push({ sender: "Công Dân", msg: "CÔNG DÂN KHỞI ĐỘNG KHIẾU NẠI KHẨN CẤP.", time: timeNow });
            addLog(`Công dân @${app.sender} khiếu nại đơn ${id}.`);
        } else {
            Object.values(systemState.authorizedPersonnel).forEach(u => { if (u.displayName === app.handler) { if (status === 'HÀI LÒNG') u.positiveRatings++; else u.negativeRatings++; } });
        }
    }
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/national/publish', (req, res) => {
    const { type, title, content, author } = req.body;
    const timeNow = new Date().toLocaleTimeString('vi-VN') + " - 20/06/2026";
    if (type === 'TRUY NÃ') {
        systemState.criminalWantedList.unshift({ name: title, crime: content, bounty: "Theo khung hình sự", date: new Date().toLocaleDateString('vi-VN') });
        addLog(`Lãnh đạo phát lệnh truy nã đối tượng: @${title}.`);
    } else {
        systemState.announcements.unshift({ id: `NEWS-${Date.now().toString().slice(-4)}`, type, title, content, timestamp: timeNow });
        addLog(`Lãnh đạo phát hành sắc lệnh: ${title}.`);
    }
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/national/ticker', (req, res) => { systemState.tickerMessage = req.body.message; broadcastUpdate(); res.json({ success: true }); });
app.post('/api/national/delete-announcement', (req, res) => { systemState.announcements = systemState.announcements.filter(a => a.id !== req.body.id); broadcastUpdate(); res.json({ success: true }); });
app.post('/api/national/security', (req, res) => { systemState.securityLevel = req.body.level; addLog(`Cảnh báo an ninh quốc gia: [${req.body.level}].`); broadcastUpdate(); res.json({ success: true }); });

io.on('connection', (socket) => {
    socket.emit('initData', { systemState, citizenIdentityRegistry, criminalRecordsRegistry });
});

server.listen(PORT, () => console.log(`SERVER CORE REALTIME ONLINE PORT: ${PORT}`));
