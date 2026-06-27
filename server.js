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
app.use(express.static(path.join(__dirname, 'public')));

// KHO DỮ LIỆU SỐ HÓA TOÀN QUỐC BẢO MẬT TỐI CAO
let systemState = {
    securityLevel: "AN TOÀN",
    tickerMessage: "⚡ HỆ THỐNG LIÊN THÔNG QUỐC GIA: Yêu cầu các đơn vị nghiêm túc thực hiện số hóa thủ tục hành chính năm 2026. Kiểm tra nghiêm ngặt dữ liệu định danh cư dân trước khi phê duyệt con dấu điện tử.",
    systemLogs: [
        { time: new Date().toLocaleTimeString('vi-VN') + " - 27/06/2026", text: "Hệ thống trục lõi Quốc Gia v2.0 khởi động thành công trên Cloud Web Service." }
    ],
    announcements: [
        { id: "NEWS-1001", type: "QUYẾT ĐỊNH", title: "Vận hành Cổng thông tin điện tử liên thông Quốc Gia Quốc Vụ v2.0", content: "Chính thức chuyển dịch số hóa thủ tục hành chính toàn diện, đồng bộ dữ liệu cư dân, kích hoạt Trợ lý ảo Tuệ Đức Quốc Vụ giải đáp dịch vụ công trực tuyến.", timestamp: "27/06/2026, 08:00:00" }
    ],
    criminalWantedList: [
        { name: "Nguyen_Van_A", crime: "Tổ chức đua xe trái phép và chống người thi hành công vụ", bounty: "20,000,000 VND", date: "25/06/2026" }
    ],
    applications: {
        "HS-1001": {
            id: "HS-1001", sender: "Nguyen_Manh_Hoang", agency: "CÔNG AN", docType: "CĂN CƯỚC CÔNG DÂN",
            content: "Xin cấp lại thẻ căn cước công dân gắn chíp điện tử định danh cá nhân do bị thất lạc trong quá trình công tác.",
            status: "Đang Chờ Tiếp Nhận", stamp: "stamp-pending", handler: "Chưa phân phối", handlerTitle: "Trực ban liên thông",
            logs: [{ sender: "Hệ thống", msg: "Hồ sơ số hóa khởi tạo thành công trên cổng liên thông quốc gia.", time: new Date().toLocaleTimeString('vi-VN') }],
            satisfaction: null, priority: "BÌNH THƯỜNG"
        }
    },
    archivedApplications: {},
    authorizedPersonnel: {
        "admin": { username: "admin", password: "123", displayName: "Văn Phòng Trung Ương Điều Hành", role: "ADMIN", agency: "HỆ THỐNG", positiveRatings: 0, negativeRatings: 0 },
        "canbo1": { username: "canbo1", password: "123", displayName: "Thiếu Tá Lê Minh Tuấn", role: "CHUYÊN VIÊN", agency: "CÔNG AN", positiveRatings: 5, negativeRatings: 1 },
        "lanhdao1": { username: "lanhdao1", password: "123", displayName: "Đại Tá Nguyễn Hoàng", role: "LÃNH ĐẠO", agency: "CÔNG AN", positiveRatings: 8, negativeRatings: 0 },
        "thanhtra1": { username: "thanhtra1", password: "123", displayName: "Thanh Tra Viên Trần Lực", role: "THANH TRA", agency: "THANH TRA", positiveRatings: 2, negativeRatings: 0 },
        "chinhphu1": { username: "chinhphu1", password: "123", displayName: "Phó Thủ Tướng Nguyễn Minh Hoàng", role: "LÃNH ĐẠO", agency: "CHÍNH PHỦ", positiveRatings: 12, negativeRatings: 0 }
    }
};

let citizenIdentityRegistry = {
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

let criminalRecordsRegistry = {
    "Nguyen_Manh_Hoang": [
        { id: "VP-501", type: "VI PHẠM GIAO THÔNG", lawClause: "Điều 5 Nghị định 100/2019/NĐ-CP - Vượt đèn đỏ kịch bản nhập vai", fine: "4,000,000 VND", status: "Đã Nộp Phạt", officer: "Thiếu Tá Lê Minh Tuấn", date: "10/05/2026" }
    ]
};

// TRI THỨC VÀ LOGIC KHỞI TẠO CỦA BOT AI TUỆ ĐỨC
const BOT_KNOWLEDGE = {
    intro: "Xin chào công dân! Tôi là Tuệ Đức Quốc Vụ - Trợ lý số hóa hành chính tự động của Chính phủ. Tôi có thể tra cứu thủ tục, kiểm tra lý lịch, hướng dẫn nộp hồ sơ trực tuyến khẩn cấp.",
    procedures: {
        "CĂN CƯỚC": "Thủ tục cấp đổi Căn Cước Công Dân yêu cầu: Tên tài khoản chuẩn cấu trúc Họ_Tên, ảnh kịch bản rõ ràng, nộp về BỘ CÔNG AN thẩm định xử lý.",
        "GIẤY PHÉP VŨ KHÍ": "Giấy phép sử dụng công cụ hỗ trợ và vũ khí kịch bản yêu cầu lý lịch trong sạch, do BỘ CHỈ HUY QUÂN SỰ hoặc BỘ CÔNG AN phê duyệt nghiêm ngặt.",
        "KHIẾU NẠI": "Nếu hồ sơ của bạn bị bác bỏ oan sai, hãy nhấn nút '🚨 KHIẾU NẠI 🚨' tại cổng tra cứu để gửi thẳng hồ sơ sang THANH TRA CHÍNH PHỦ tiến hành điều tra đóng băng biên bản."
    }
};

function addLog(text) {
    const timeStr = new Date().toLocaleTimeString('vi-VN') + " - 27/06/2026";
    systemState.systemLogs.unshift({ time: timeStr, text });
}

function broadcastUpdate() {
    io.emit('stateUpdate', {
        systemState,
        citizenIdentityRegistry,
        criminalRecordsRegistry
    });
}

// XỬ LÝ TRẢ LỜI CỦA AI BOT THÔNG MINH
function processBotResponse(msg) {
    const text = msg.toUpperCase();
    if (text.includes("CHÀO") || text.includes("HELLO") || text.includes("BOT")) {
        return BOT_KNOWLEDGE.intro;
    }
    if (text.includes("CĂN CƯỚC") || text.includes("CCCD") || text.includes("CMND")) {
        return BOT_KNOWLEDGE.procedures["CĂN CƯỚC"];
    }
    if (text.includes("SÚNG") || text.includes("VŨ KHÍ") || text.includes("CÔNG CỤ HỖ TRỢ")) {
        return BOT_KNOWLEDGE.procedures["GIẤY PHÉP VŨ KHÍ"];
    }
    if (text.includes("KHIẾU NẠI") || text.includes("OAN") || text.includes("BÁC BỎ")) {
        return BOT_KNOWLEDGE.procedures["KHIẾU NẠI"];
    }
    
    // Tìm kiếm cư dân động thông qua dữ liệu nhập liệu
    for (let username in citizenIdentityRegistry) {
        if (text.includes(username.toUpperCase()) || text.includes(citizenIdentityRegistry[username].name.toUpperCase())) {
            let data = citizenIdentityRegistry[username];
            return `[Hệ thống Tìm kiếm] Phát hiện hồ sơ công dân: ${data.name} | Sinh ngày: ${data.dob} | Trạng thái tư pháp: ${data.status}.`;
        }
    }
    return "Yêu cầu chưa rõ ràng. Hãy nhập các từ khóa cốt lõi như: 'Căn Cước', 'Vũ Khí', 'Khiếu Nại' hoặc tên tài khoản công dân cần tra cứu lý lịch lõi.";
}

app.get('/', (req, res) => {
    res.render('index', { state: systemState, registry: citizenIdentityRegistry, violations: criminalRecordsRegistry });
});

// API THAO TÁC CƠ SỞ DỮ LIỆU LIÊN THÔNG VỚI REALTIME BROADCAST
app.post('/api/resident/violation', (req, res) => {
    const { username, type, lawClause, fine, status, officerName } = req.body;
    const recordId = `VP-${Math.floor(100 + Math.random() * 900)}`;
    const dateNow = new Date().toLocaleDateString('vi-VN');

    if (!criminalRecordsRegistry[username]) criminalRecordsRegistry[username] = [];
    criminalRecordsRegistry[username].unshift({ id: recordId, type, lawClause, fine, status, officer: officerName, date: dateNow });

    addLog(`Cán bộ [${officerName}] quyết định xử phạt vi phạm [${recordId}] đối với công dân: @${username}. Khung phạt: ${fine}.`);
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/officer/save', (req, res) => {
    const { username, password, displayName, role, agency, isEdit } = req.body;
    if (isEdit && systemState.authorizedPersonnel[username]) {
        let old = systemState.authorizedPersonnel[username];
        systemState.authorizedPersonnel[username] = { ...old, password, displayName, role, agency };
        addLog(`Cấp quản trị cập nhật phân quyền tài khoản: ${username} - [${agency}] - Chức danh: [${role}].`);
    } else {
        systemState.authorizedPersonnel[username] = { username, password, displayName, role, agency, positiveRatings: 0, negativeRatings: 0 };
        addLog(`Phê duyệt sắc lệnh bổ nhiệm nhân sự mới: ${displayName} giữ chức [${role}] tại bộ ban ngành [${agency}].`);
    }
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/officer/delete', (req, res) => {
    const { username } = req.body;
    if (username === 'admin') return res.status(400).json({ error: "Không thể xóa tài khoản hệ thống điều hành tối cao" });
    if (systemState.authorizedPersonnel[username]) {
        const name = systemState.authorizedPersonnel[username].displayName;
        delete systemState.authorizedPersonnel[username];
        addLog(`Tước quyền công vụ, bãi nhiệm khẩn cấp nhân sự: ${username} (${name}).`);
        broadcastUpdate();
        res.json({ success: true });
    } else { res.status(404).json({ error: "Không tìm thấy cán bộ" }); }
});

app.post('/api/resident/register', (req, res) => {
    const { username, name, dob, gender, pob, job, licenses, status, officerName } = req.body;
    citizenIdentityRegistry[username] = {
        name, dob, gender, pob, job,
        licenses: licenses ? licenses.split(',').map(l => l.trim()) : [],
        status
    };
    addLog(`Cán bộ [${officerName}] hoàn tất số hóa định danh công dân mới: @${username} (${name}).`);
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/applications/submit', (req, res) => {
    const { sender, agency, docType, content, priority } = req.body;
    const id = `HS-${Object.keys(systemState.applications).length + Object.keys(systemState.archivedApplications).length + 1001}`;
    const timeNow = new Date().toLocaleTimeString('vi-VN');

    systemState.applications[id] = {
        id, sender, agency, docType, content, priority: priority || "BÌNH THƯỜNG",
        status: "Đang Chờ Tiếp Nhận", stamp: "stamp-pending", handler: "Chưa phân phối", handlerTitle: "Hệ thống tự động",
        logs: [{ sender: "Hệ thống", msg: `Hồ sơ số hóa [${docType}] gửi đến [${agency}] thành công. Mức độ khẩn: ${priority}`, time: timeNow }],
        satisfaction: null
    };
    addLog(`Công dân @${sender} khởi tạo thành công hồ sơ trực tuyến [${id}] lĩnh vực quản lý [${agency}].`);
    broadcastUpdate();
    io.emit('newApplicationAlert', { id, agency, docType, priority });
    res.json({ success: true, id });
});

app.post('/api/applications/action', (req, res) => {
    const { id, action, msg, officerName, officerRole, status, stamp, targetAgency } = req.body;
    let app = systemState.applications[id] || systemState.archivedApplications[id];
    if (!app) return res.status(404).json({ error: "Không tìm thấy dữ liệu mã hồ sơ hành chính này." });

    const timeNow = new Date().toLocaleTimeString('vi-VN');

    if (action === 'chat') {
        app.logs.push({ sender: officerName, msg, time: timeNow });
        io.emit('newChatMessage', { fileId: id });
    } else if (action === 'claim_packet') {
        app.status = "Đã Tiếp Nhận Xử Lý"; app.stamp = "stamp-forwarded"; app.handler = officerName; app.handlerTitle = officerRole;
        app.logs.push({ sender: "Hệ thống liên thông", msg: `Hồ sơ đã phân bổ trực tiếp cho Chuyên viên: ${officerName}.`, time: timeNow });
        addLog(`Hồ sơ ${id} được tiếp nhận thụ lý xử lý bởi Chuyên viên ${officerName}.`);
    } else if (action === 'status') {
        app.status = status; app.stamp = stamp; app.handler = officerName; app.handlerTitle = officerRole;
        app.logs.push({ sender: "Hội đồng thẩm định", msg: `Cán bộ thẩm quyền ${officerName} ký đóng dấu phê duyệt kết quả: [${status}].`, time: timeNow });
        addLog(`Hồ sơ số ${id} chính thức thay đổi trạng thái sang: [${status}] ký duyệt bởi ${officerName}.`);
    } else if (action === 'investigate') {
        app.status = "Thanh Tra Đang Thẩm Tra"; app.stamp = "stamp-leader"; app.agency = "THANH TRA";
        app.logs.push({ sender: "Thanh Tra Chính Phủ", msg: `Thanh tra viên tối cao ${officerName} phát lệnh cưỡng chế đóng băng dữ liệu để thẩm tra sai phạm điều hành.`, time: timeNow });
        addLog(`Thanh Tra Chính Phủ can thiệp lệnh đặc quyền điều tra độc lập hồ sơ mang mã số chuyên biệt: ${id}.`);
    } else if (action === 'forward') {
        app.logs.push({ sender: "Hệ thống điều hành", msg: `${officerName} ký lệnh điều chuyển hồ sơ liên ngành sang cơ quan quản lý bộ phận: [${targetAgency}].`, time: timeNow });
        app.agency = targetAgency; app.status = "Đang Chờ Tiếp Nhận"; app.stamp = "stamp-pending";
        addLog(`Hồ sơ trực tuyến ${id} được điều hướng luân chuyển nghiệp vụ liên bộ ban ngành sang [${targetAgency}].`);
    } else if (action === 'to_leader') {
        app.status = "Chờ Lãnh Đạo Duyệt Ấn Ký"; app.stamp = "stamp-leader";
        app.logs.push({ sender: "Hệ thống hành chính", msg: `Chuyên viên viên ${officerName} trình hồ sơ gốc lên cấp Thượng cấp / Lãnh đạo tối cao duyệt ký đóng dấu phôi.`, time: timeNow });
        addLog(`Cán bộ chuyên môn trình tấu hồ sơ ${id} lên cấp Lãnh Đạo đơn vị ban ban ngành phê chuẩn.`);
    } else if (action === 'archive') {
        app.status = "Đã Khóa & Lưu Kho Quốc Gia"; app.stamp = "stamp-archived";
        app.logs.push({ sender: "Kho lưu trữ tối cao", msg: `Hồ sơ đóng con dấu niêm phong vĩnh viễn chuyển dữ liệu vào Kho mật bởi lãnh đạo hoặc thanh tra viên: ${officerName}.`, time: timeNow });
        systemState.archivedApplications[id] = app; delete systemState.applications[id];
        addLog(`Hồ sơ mang số định danh ${id} đã được đóng mã niêm phong chuyển thành công vào Kho Lưu Trữ Quốc Gia.`);
    } else if (action === 'unarchive') {
        app.status = "Mở Lại Xử Lý Tái Thẩm"; app.stamp = "stamp-pending";
        app.logs.push({ sender: "Văn Phòng Trung Ương Điều Hành", msg: `Sắc lệnh Khôi phục khẩn cấp hồ sơ từ kho lưu trữ số hóa phục vụ công tác điều tra lại.`, time: timeNow });
        systemState.applications[id] = app; delete systemState.archivedApplications[id];
        addLog(`Hồ sơ đặc biệt ${id} đã được phục hồi TRẢ LẠI luồng xử lý từ Kho lưu trữ bảo mật.`);
    } else if (action === 'satisfaction') {
        app.satisfaction = status;
        if (status === 'KHIẾU NẠI CẤP CAO') {
            app.status = "Đang Khiếu Nại Cấp Cao"; app.stamp = "stamp-rejected"; app.agency = "THANH TRA";
            app.logs.push({ sender: "Công Dân Phản Hồi", msg: "CÔNG DÂN GỬI ĐƠN KHIẾU NẠI KHẨN CẤP VỀ SỰ CỐ QUY TRÌNH.", time: timeNow });
            addLog(`Công dân @${app.sender} chính thức nộp đơn KHIẾU NẠI KHẨN CẤP VỚI CẤP THẦM QUYỀN đối với mã hồ sơ ${id}.`);
        } else {
            Object.values(systemState.authorizedPersonnel).forEach(u => { if (u.displayName === app.handler) { if (status === 'HÀI LÒNG') u.positiveRatings++; else u.negativeRatings++; } });
            addLog(`Công dân chấm điểm chất lượng phục vụ tại hồ sơ mang mã số hành chính ${id}: [${status}].`);
        }
    }
    broadcastUpdate();
    res.json({ success: true });
});

// ROUTE TƯƠNG TÁC CHAT VỚI AI BOT 
app.post('/api/bot/chat', (req, res) => {
    const { message } = req.body;
    const botReply = processBotResponse(message);
    res.json({ reply: botReply });
});

app.post('/api/national/publish', (req, res) => {
    const { type, title, content, author } = req.body;
    const timeNow = new Date().toLocaleTimeString('vi-VN') + " - 27/06/2026";
    if (type === 'TRUY NÃ') {
        systemState.criminalWantedList.unshift({ name: title, crime: content, bounty: "Theo quyết định hình sự giả lập", date: new Date().toLocaleDateString('vi-VN') });
        addLog(`LÃNH ĐẠO ĐƠN VỊ TỐI CAO (${author}) phát lệnh truy nã khẩn cấp đối tượng quốc gia nguy hiểm: @${title}.`);
    } else {
        systemState.announcements.unshift({ id: `NEWS-${Date.now().toString().slice(-4)}`, type, title, content, timestamp: timeNow });
        addLog(`CẤP QUẢN LÝ BAN HÀNH SẮC LỆNH MỚI: ${title} ký duyệt bởi ${author}.`);
    }
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/national/ticker', (req, res) => { systemState.tickerMessage = req.body.message; broadcastUpdate(); res.json({ success: true }); });
app.post('/api/national/delete-announcement', (req, res) => { systemState.announcements = systemState.announcements.filter(a => a.id !== req.body.id); broadcastUpdate(); res.json({ success: true }); });
app.post('/api/national/security', (req, res) => { systemState.securityLevel = req.body.level; addLog(`Thay đổi mức độ cảnh báo an ninh toàn hệ thống trục lõi sang: [${req.body.level}].`); broadcastUpdate(); res.json({ success: true }); });

io.on('connection', (socket) => {
    socket.emit('initData', { systemState, citizenIdentityRegistry, criminalRecordsRegistry });
});

server.listen(PORT, () => console.log(`[CORE] HỆ THỐNG QUỐC GIA CHẠY MƯỢT MÀ TRÊN CỔNG ĐIỀU PHỐI CHÍNH: ${PORT}`));
