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

// KHO DỮ LIỆU SỐ HÓA TRÊN RAM SERVER - REALTIME ĐỒNG BỘ
let systemState = {
    securityLevel: "AN TOÀN",
    tickerMessage: "⚡ HỆ THỐNG LIÊN THÔNG QUỐC GIA: Yêu cầu các đơn vị nghiêm túc thực hiện số hóa thủ tục hành chính năm 2026. Kiểm tra lý lịch cư dân nghiêm ngặt trước khi phê duyệt con dấu.",
    systemLogs: [
        { time: new Date().toLocaleTimeString('vi-VN') + " - 20/06/2026", text: "Hệ thống máy chủ tối cao khởi động thành công cấu trúc Realtime Core." }
    ],
    announcements: [
        { id: "NEWS-1001", type: "QUYẾT ĐỊNH", title: "Số hóa quy trình tư pháp và cấp phát văn bằng liên thông toàn quốc", content: "Chuyển dịch toàn bộ luồng xử lý hồ sơ hành chính cư dân sang hệ thống đám mây giả lập.", timestamp: "20/06/2026, 08:00:00" }
    ],
    criminalWantedList: [
        { name: "Nguyen_Van_A", crime: "Tổ chức tàng trữ công cụ quân dụng trái phép sai kịch bản nhập vai", bounty: "50,000,000 VND", date: "20/06/2026" }
    ],
    applications: {
        "HS-1001": {
            id: "HS-1001", sender: "Nguyen_Manh_Hoang", agency: "CÔNG AN", docType: "CĂN CƯỚC CÔNG DÂN",
            content: "Yêu cầu cấp lại thẻ căn cước công dân gắn chíp điện tử định danh do bị thất lạc.",
            status: "Đang Chờ Tiếp Nhận", stamp: "stamp-pending", handler: "Chưa phân phối", handlerTitle: "Trực ban liên thông",
            logs: [{ sender: "Hệ thống", msg: "Hồ sơ số hóa khởi tạo thành công trên cổng liên thông.", time: new Date().toLocaleTimeString('vi-VN') }],
            satisfaction: null
        }
    },
    archivedApplications: {
        "HS-1000": {
            id: "HS-1000", sender: "Tran_Minh_Quang", agency: "CÔNG AN", docType: "BẰNG LÁI XE TẢI HẠNG C",
            content: "Đơn xin cấp đổi giấy phép lái xe tải quân sự phục vụ hậu cần logistics đường bộ.",
            status: "Đã Phê Duyệt", stamp: "stamp-approved", handler: "Thiếu Tá Lê Minh Tuấn", handlerTitle: "CÁN BỘ",
            logs: [{ sender: "Hệ thống", msg: "Hồ sơ hoàn tất thẩm định, niêm phong lưu kho bảo mật.", time: "08:12:30" }],
            satisfaction: "HÀI LÒNG"
        }
    },
    authorizedPersonnel: {
        "admin": { username: "admin", password: "123", displayName: "Văn Phòng Điều Hành Tối Cao", role: "ADMIN", agency: "HỆ THỐNG", positiveRatings: 0, negativeRatings: 0, processedCount: 0 },
        "canbo1": { username: "canbo1", password: "123", displayName: "Thiếu Tá Lê Minh Tuấn", role: "CÁN BỘ", agency: "CÔNG AN", positiveRatings: 8, negativeRatings: 1, processedCount: 15 },
        "lanhdao1": { username: "lanhdao1", password: "123", displayName: "Đại Tá Nguyễn Hoàng", role: "LÃNH ĐẠO", agency: "CÔNG AN", positiveRatings: 12, negativeRatings: 0, processedCount: 24 },
        "thanhtra1": { username: "thanhtra1", password: "123", displayName: "Thanh Tra Viên Trần Lực", role: "THANH TRA", agency: "THANH TRA", positiveRatings: 4, negativeRatings: 0, processedCount: 8 }
    }
};

let citizenIdentityRegistry = {
    "Nguyen_Manh_Hoang": {
        name: "Nguyễn Mạnh Hoàng", dob: "18/05/1996", gender: "Nam",
        pob: "Lâm Đồng, Việt Nam", job: "Chuyên Viên Thẩm Định Cung Ứng Vật Tư",
        licenses: ["Bằng Lái Xe Ô Tô Hạng B2", "Giấy Phép Sử Dụng Công Cụ Hỗ Trợ Vũ Khí"],
        status: "Dân Cư Hợp Pháp - Lý Lịch Trong Sạch"
    },
    "Tran_Minh_Quang": {
        name: "Trần Minh Quang", dob: "12/09/1990", gender: "Nam",
        pob: "Nha Trang, Khánh Hòa", job: "Giám Đốc Điều Hành Logistics Đường Bộ",
        licenses: ["Bằng Lái Xe Tải Hạng C"], status: "Dân Cư Hợp Pháp"
    }
};

let criminalRecordsRegistry = {
    "Nguyen_Manh_Hoang": [
        { id: "VP-501", type: "VI PHẠM GIAO THÔNG", lawClause: "Điều 5 Nghị định 100 - Vượt đèn đỏ kịch bản", fine: "4,000,000 VND", status: "Đã Nộp Phạt", officer: "Thiếu Tá Lê Minh Tuấn", date: "10/05/2026" }
    ]
};

function addLog(text) {
    const timeStr = new Date().toLocaleTimeString('vi-VN');
    systemState.systemLogs.unshift({ time: timeStr, text });
    if(systemState.systemLogs.length > 40) systemState.systemLogs.pop();
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

// LẬP BIÊN BẢN HOẶC UPDATE BIÊN BẢN VI PHẠM
app.post('/api/resident/violation', (req, res) => {
    const { username, type, lawClause, fine, status, officerName, editRecordId } = req.body;
    
    if(editRecordId) {
        if(criminalRecordsRegistry[username]) {
            let record = criminalRecordsRegistry[username].find(r => r.id === editRecordId);
            if(record) {
                record.status = status;
                addLog(`Cán bộ [${officerName}] cập nhật biên bản [${editRecordId}] của @${username} thành: [${status}].`);
            }
        }
    } else {
        const recordId = `VP-${Math.floor(100 + Math.random() * 900)}`;
        const dateNow = new Date().toLocaleDateString('vi-VN');
        if (!criminalRecordsRegistry[username]) { criminalRecordsRegistry[username] = []; }
        criminalRecordsRegistry[username].unshift({ id: recordId, type, lawClause, fine, status, officer: officerName, date: dateNow });
        addLog(`Cán bộ [${officerName}] ban hành quyết định xử phạt [${recordId}] đối với công dân: @${username}.`);
    }
    
    broadcastUpdate();
    res.json({ success: true });
});

// CHỨC NĂNG LƯU / CẬP NHẬT TÀI KHOẢN CÁN BỘ (HỖ TRỢ ĐỔI PASS/SỬA QUYỀN)
app.post('/api/officer/save', (req, res) => {
    const { username, password, displayName, role, agency, isEdit } = req.body;
    
    if (isEdit === 'true' && systemState.authorizedPersonnel[username]) {
        let oldData = systemState.authorizedPersonnel[username];
        systemState.authorizedPersonnel[username] = { 
            ...oldData, 
            password, 
            displayName, 
            role, 
            agency 
        };
        addLog(`ADMIN hiệu chỉnh tài khoản cán bộ: @${username}.`);
    } else {
        systemState.authorizedPersonnel[username] = { 
            username, password, displayName, role, agency, 
            positiveRatings: 0, negativeRatings: 0, processedCount: 0 
        };
        addLog(`ADMIN bổ nhiệm cán bộ quốc gia mới: ${displayName}.`);
    }
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/officer/delete', (req, res) => {
    const { username } = req.body;
    if (username === 'admin') return res.status(400).json({ error: "Không thể bãi nhiệm Admin tối cao" });
    if (systemState.authorizedPersonnel[username]) {
        delete systemState.authorizedPersonnel[username];
        addLog(`ADMIN xóa tài khoản cán bộ: @${username}.`);
        broadcastUpdate();
        res.json({ success: true });
    } else { res.status(404).json({ error: "Không tìm thấy" }); }
});

// THIẾT LẬP DÂN CƯ HOẶC CẬP NHẬT VĂN BẰNG
app.post('/api/resident/register', (req, res) => {
    const { username, name, dob, gender, pob, job, licenses, status, officerName, mode } = req.body;
    
    if(mode === "licenses_only") {
        if(citizenIdentityRegistry[username]) {
            citizenIdentityRegistry[username].licenses = licenses ? licenses.split(',').map(l => l.trim()) : [];
            addLog(`Cán bộ [${officerName}] cập nhật hệ thống văn bằng cho: @${username}.`);
        }
    } else {
        citizenIdentityRegistry[username] = {
            name, dob, gender, pob, job,
            licenses: citizenIdentityRegistry[username] ? citizenIdentityRegistry[username].licenses : [],
            status
        };
        addLog(`Cán bộ [${officerName}] số hóa / cập nhật định danh cư dân gốc: @${username}.`);
    }
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
        logs: [{ sender: "Hệ thống", msg: `Hồ sơ nộp trực tuyến thành công vào luồng xử lý của [${agency}].`, time: timeNow }],
        satisfaction: null
    };
    addLog(`Cư dân @${sender} gửi đơn yêu cầu giải quyết thủ tục [${id}].`);
    broadcastUpdate();
    io.emit('newApplicationAlert', { id, agency, docType });
    res.json({ success: true, id });
});

app.post('/api/applications/action', (req, res) => {
    const { id, action, msg, officerName, officerRole, status, stamp, targetAgency } = req.body;
    let app = systemState.applications[id] || systemState.archivedApplications[id];
    if (!app) return res.status(404).json({ error: "Không tìm thấy hồ sơ." });

    const timeNow = new Date().toLocaleTimeString('vi-VN');

    if(officerName && systemState.authorizedPersonnel[officerName]) {
        systemState.authorizedPersonnel[officerName].processedCount++;
    }

    if (action === 'chat') {
        app.logs.push({ sender: officerName, msg, time: timeNow });
        io.emit('newChatMessage', { fileId: id });
        return res.json({ success: true });
    } 
    
    if (action === 'claim_packet') {
        app.status = "Đã Tiếp Nhận Xử Lý"; app.stamp = "stamp-forwarded"; app.handler = officerName; app.handlerTitle = officerRole;
        app.logs.push({ sender: "Hệ thống", msg: `Hồ sơ đã được tiếp nhận kiểm tra bởi Cán bộ: ${officerName}.`, time: timeNow });
        addLog(`Hồ sơ ${id} được tiếp nhận làm việc bởi cán bộ ${officerName}.`);
    } else if (action === 'status') {
        app.status = status; app.stamp = stamp;
        app.logs.push({ sender: "Hệ thống", msg: `Cán bộ cập nhật kết quả: [${status}].`, time: timeNow });
        addLog(`Hồ sơ ${id} ban hành kết quả: ${status}.`);
    } else if (action === 'forward_agency') {
        app.agency = targetAgency; app.status = "Đang Chờ Tiếp Nhận"; app.stamp = "stamp-pending";
        app.logs.push({ sender: "Hệ thống", msg: `Đơn vị điều chuyển hồ sơ sang bộ ngành quản lý mới: [${targetAgency}].`, time: timeNow });
        addLog(`Hồ sơ ${id} được chuyển sang cơ quan [${targetAgency}].`);
    } else if (action === 'to_leader') {
        app.status = "Chờ Lãnh Đạo Duyệt"; app.stamp = "stamp-leader";
        app.logs.push({ sender: "Hệ thống", msg: `Trình hồ sơ lên Lãnh Đạo Tối Cao ký duyệt chỉ thị chỉ huy.`, time: timeNow });
        addLog(`Hồ sơ ${id} được trình lên cấp chỉ huy lãnh đạo.`);
    } else if (action === 'archive') {
        app.status = "Đã Đóng & Lưu Kho"; app.stamp = "stamp-archived";
        app.logs.push({ sender: "Hệ thống", msg: `Hồ sơ khép lại, khóa mã số đưa vào kho dữ liệu quốc gia bảo mật.`, time: timeNow });
        systemState.archivedApplications[id] = app; delete systemState.applications[id];
        addLog(`Hồ sơ ${id} đóng dấu niêm phong chuyển vào kho lưu trữ quốc gia.`);
    } else if (action === 'unarchive') {
        app.status = "Mở Lại Xử Lý Lại"; app.stamp = "stamp-pending";
        app.logs.push({ sender: "Văn Phòng Điều Hành", msg: `Mở niêm phong trả hồ sơ về ban ngành kịch bản.`, time: timeNow });
        systemState.applications[id] = app; delete systemState.archivedApplications[id];
        addLog(`Hồ sơ ${id} được khôi phục từ kho dữ liệu.`);
    } else if (action === 'satisfaction') {
        app.satisfaction = status;
        if (status === 'KHIẾU NẠI CẤP CAO') {
            app.status = "Đang Khiếu Nại Cấp Cao"; app.stamp = "stamp-rejected"; app.agency = "THANH TRA";
            app.logs.push({ sender: "Công Dân", msg: "CÔNG DÂN KHỞI SỰ ĐƠN KHIẾU NẠI KHẨN CẤP LÊN THANH TRA.", time: timeNow });
            addLog(`Công dân nộp đơn khiếu nại đối với hồ sơ mang mã số ${id}.`);
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
        addLog(`Lãnh đạo phát lệnh TRUY NÃ bị can hình sự toàn quốc: @${title}.`);
    } else {
        systemState.announcements.unshift({ id: `NEWS-${Date.now().toString().slice(-4)}`, type, title, content, timestamp: timeNow });
        addLog(`Lãnh đạo phê chuẩn ban hành sắc lệnh mới: ${title}.`);
    }
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/national/ticker', (req, res) => { systemState.tickerMessage = req.body.message; broadcastUpdate(); res.json({ success: true }); });
app.post('/api/national/delete-announcement', (req, res) => { systemState.announcements = systemState.announcements.filter(a => a.id !== req.body.id); broadcastUpdate(); res.json({ success: true }); });
app.post('/api/national/security', (req, res) => { systemState.securityLevel = req.body.level; addLog(`Cảnh báo an ninh toàn hệ thống chuyển dịch: [${req.body.level}].`); broadcastUpdate(); res.json({ success: true }); });

io.on('connection', (socket) => {
    socket.emit('initData', { systemState, citizenIdentityRegistry, criminalRecordsRegistry });
});

server.listen(PORT, () => console.log(`SYSTEM SIMULATOR ACTIVE REALTIME PORT: ${PORT}`));
