const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// DỮ LIỆU ĐƯỢC LƯU TRỮ TRÊN BỘ NHỚ RAM MÁY CHỦ - AN TOÀN TUÂN THỦ QUY CHẾ GIẢ LẬP
let systemState = {
    securityLevel: "AN TOÀN TRÒ CHƠI",
    tickerMessage: "⚡ HỆ THỐNG LIÊN THÔNG GIẢ LẬP: Yêu cầu các đơn vị nghiêm túc thực hiện số hóa thủ tục hành chính trong môi trường Roleplay năm 2026. Kiểm tra nghiêm ngặt dữ liệu định danh cư dân ảo trước khi phê duyệt con dấu điện tử.",
    systemLogs: [
        { time: new Date().toLocaleTimeString('vi-VN') + " - 19/06/2026", text: "Hệ thống máy chủ tối cao giả lập khởi động thành công trên môi trường Web Service." }
    ],
    announcements: [
        { id: "NEWS-1001", type: "QUYẾT ĐỊNH GIẢ LẬP", title: "Vận hành Cổng thông tin điện tử liên thông Quốc Gia thuộc không gian trò chơi ảo", content: "Chính thức chuyển dịch số hóa thủ tục hành chính ảo, phục vụ công tác nâng cao trải nghiệm định danh cư dân đóng vai trò.", timestamp: "19/06/2026, 08:00:00" }
    ],
    criminalWantedList: [
        { name: "Nguyen Van A", crime: "Vi phạm quy chế tương tác cộng đồng giả lập", bounty: "50.000.000 Tiền Trò Chơi", date: "19/06/2026" }
    ],
    authorizedPersonnel: {
        "admin": { username: "admin", password: "123", displayName: "Trần Minh Quang", role: "QUẢN TRỊ VIÊN TỐI CAO LÃNH ĐẠO", agency: "TRUNG ƯƠNG" },
        "ca_tinh": { username: "ca_tinh", password: "123", displayName: "Nguyễn Văn Đại", role: "CÁN BỘ CÔNG AN TỈNH GIẢ LẬP", agency: "CÔNG AN" },
        "ca_phuong": { username: "ca_phuong", password: "123", displayName: "Lê Hoàng Nam", role: "TRƯỞNG CÔNG AN PHƯỜNG GIẢ LẬP", agency: "CÔNG AN" },
        "ubnd_phuong": { username: "ubnd_phuong", password: "123", displayName: "Phạm Minh Hải", role: "CHỦ TỊCH UBND PHƯỜNG GIẢ LẬP", agency: "UBND PHƯỜNG" },
        "sgt": { username: "sgt", password: "123", displayName: "Nguyễn Thanh Sơn", role: "ĐIỀU PHỐI VIÊN GIAO THÔNG GIẢ LẬP", agency: "SỞ GIAO THÔNG THÀNH PHỐ" },
        "bv_tinh": { username: "bv_tinh", password: "123", displayName: "Trần Thị Lan", role: "QUẢN LÝ Y TẾ KHÔNG GIAN ẢO", agency: "BỆNH VIỆN" }
    },
    applications: {},
    archivedApplications: {}
};

function addLog(text) {
    const timeNow = new Date().toLocaleTimeString('vi-VN') + " - " + new Date().toLocaleDateString('vi-VN');
    systemState.systemLogs.unshift({ time: timeNow, text: text });
    if (systemState.systemLogs.length > 100) systemState.systemLogs.pop();
}

// ROUTER CHÍNH GIAO DIỆN
app.get('/', (req, res) => {
    res.render('index', { state: systemState });
});

// ROUTER ĐỒNG BỘ TRẠNG THÁI CLIENT
app.get('/api/state', (req, res) => {
    res.json(systemState);
});

// API THỦ TỤC HÀNH CHÍNH GIẢ LẬP
app.post('/api/apply', (req, res) => {
    const { name, docType, agency, details } = req.body;
    if (!name || !docType || !details) {
        return res.json({ success: false, message: "Vui lòng nhập đầy đủ thông tin hồ sơ giả lập." });
    }
    const appId = "HS-" + Date.now().toString().slice(-6);
    systemState.applications[appId] = {
        id: appId,
        name: name,
        docType: docType,
        agency: agency,
        details: details,
        status: "ĐANG CHỜ TIẾP NHẬN",
        logs: [`[${new Date().toLocaleTimeString('vi-VN')}] Cư dân gửi hồ sơ trực tuyến lên hệ thống trò chơi.`]
    };
    addLog(`CƯ DÂN nộp hồ sơ giả lập: ${docType} (Mã số: ${appId}) - Tự động phân luồng: ${agency}.`);
    res.json({ success: true, appId: appId });
});

app.post('/api/track', (req, res) => {
    const { appId } = req.body;
    const appData = systemState.applications[appId] || systemState.archivedApplications[appId];
    if (!appData) return res.json({ success: false, message: "Mã hồ sơ giả lập không tồn tại trên hệ thống trò chơi liên thông." });
    res.json({ success: true, application: appData });
});

app.post('/api/chat', (req, res) => {
    const { appId, message, sender } = req.body;
    const appData = systemState.applications[appId] || systemState.archivedApplications[appId];
    if (!appData) return res.json({ success: false });
    
    appData.logs.push(`[${new Date().toLocaleTimeString('vi-VN')}] ${sender}: ${message}`);
    res.json({ success: true, application: appData });
});

app.post('/api/action', (req, res) => {
    const { appId, action, officer, agency } = req.body;
    const appData = systemState.applications[appId];
    if (!appData) return res.json({ success: false, message: "Hồ sơ không ở trạng thái xử lý trực tuyến hoặc không tồn tại." });

    if (action === 'RECEIVE') {
        appData.status = "ĐANG XỬ LÝ";
        appData.logs.push(`[${new Date().toLocaleTimeString('vi-VN')}] Điều phối viên ${officer} (${agency}) đã tiếp nhận và đang thẩm định dữ liệu số hóa trò chơi.`);
        addLog(`CÁN BỘ GIẢ LẬP (${officer}) tiếp nhận hồ sơ mã số ${appId}.`);
    } else if (action === 'APPROVE') {
        appData.status = "ĐÃ PHÊ DUYỆT";
        appData.approvedBy = officer;
        appData.stamp = `CON DẤU ĐIỆN TỬ GIẢ LẬP ROLEPLAY - PHÊ DUYỆT BỞI ĐƠN VỊ TÁC NGHIỆP TRÒ CHƠI ${agency.toUpperCase()}`;
        appData.logs.push(`[${new Date().toLocaleTimeString('vi-VN')}] QUYẾT ĐỊNH BAN HÀNH GIẢ LẬP: Hồ sơ chính thức được thông qua và đóng dấu điện tử ảo thành công.`);
        addLog(`HỆ THỐNG đóng dấu phê duyệt giả lập thành công hồ sơ ${appId} bởi ${officer}.`);
        
        systemState.archivedApplications[appId] = appData;
        delete systemState.applications[appId];
    } else if (action === 'REJECT') {
        appData.status = "BỊ TỪ CHỐI";
        appData.logs.push(`[${new Date().toLocaleTimeString('vi-VN')}] TỪ CHỐI: Hồ sơ không đủ điều kiện tương thích quy chế đóng vai trò hoặc thông tin sai lệch.`);
        addLog(`CÁN BỘ GIẢ LẬP (${officer}) từ chối phê duyệt hồ sơ mã số ${appId}.`);
        
        systemState.archivedApplications[appId] = appData;
        delete systemState.applications[appId];
    }
    res.json({ success: true });
});

app.post('/api/national/publish', (req, res) => {
    const { type, title, content, author } = req.body;
    const timeNow = new Date().toLocaleTimeString('vi-VN') + " - 19/06/2026";

    if (type === 'TRUY NÃ') {
        systemState.criminalWantedList.unshift({ name: title, crime: content, bounty: "Theo quy định trò chơi đóng vai", date: new Date().toLocaleDateString('vi-VN') });
        addLog(`HỆ THỐNG GIẢ LẬP phát lệnh truy nã ảo đối tượng vi phạm: @${title}.`);
    } else {
        systemState.announcements.unshift({ id: `NEWS-${Date.now().toString().slice(-4)}`, type, title, content, timestamp: timeNow });
        addLog(`LÃNH ĐẠO TRÒ CHƠI (${author}) ban hành thông cáo giả lập mới: ${title}.`);
    }
    res.json({ success: true });
});

app.post('/api/national/ticker', (req, res) => {
    systemState.tickerMessage = req.body.message;
    res.json({ success: true });
});

app.post('/api/national/delete-announcement', (req, res) => {
    systemState.announcements = systemState.announcements.filter(a => a.id !== req.body.id);
    res.json({ success: true });
});

// ==========================================================================
// API HỖ TRỢ XUNG NHỊP ĐỒNG BỘ THỜI GIAN THỰC Ở FRONT-END NGẦM MÀ KHÔNG GÂY TẢI LẠI TRANG
// ==========================================================================
app.get('/api/national/pulse-check', (req, res) => {
    let totalLogsCount = 0;
    Object.keys(systemState.applications).forEach(id => {
        if (systemState.applications[id].logs) totalLogsCount += systemState.applications[id].logs.length;
    });
    Object.keys(systemState.archivedApplications).forEach(id => {
        if (systemState.archivedApplications[id].logs) totalLogsCount += systemState.archivedApplications[id].logs.length;
    });
    res.json({
        success: true,
        securityLevel: systemState.securityLevel,
        totalApplications: Object.keys(systemState.applications).length,
        totalLogs: totalLogsCount
    });
});

app.listen(PORT, () => {
    console.log(`[ROBLOX-RP-SERVER] Đang chạy ổn định tại port: ${PORT}`);
});
