const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Hệ thống Cơ sở dữ liệu, Nhật ký hệ thống và Kho lưu trữ quốc gia (Archive)
let systemState = {
    securityLevel: "AN TOÀN",
    tickerMessage: "⚡ HỆ THỐNG LIÊN THÔNG QUỐC GIA: Yêu cầu các đơn vị nghiêm túc thực hiện số hóa thủ tục hành chính năm 2026. Kiểm tra nghiêm ngặt dữ liệu định danh cư dân trước khi phê duyệt con dấu điện tử. Cảnh giác cao độ với các đối tượng thuộc diện truy nã đặc biệt khẩn cấp.",
    systemLogs: [
        { time: "15/06/2026, 13:30:00", text: "Hệ thống máy chủ tối cao khởi động thành công trên Web Service." }
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
            status: "Đang Chờ Tiếp Nhận", stamp: "stamp-pending", handler: "Chưa phân phối",
            logs: [{ sender: "Hệ thống", msg: "Hồ sơ số hóa khởi tạo thành công trên cổng liên thông.", time: "13:02:11" }],
            satisfaction: null
        }
    },
    archivedApplications: {}, // Kho lưu trữ quốc gia sau khi cán bộ Đóng hồ sơ
    authorizedPersonnel: {
        "admin": { username: "admin", password: "123", displayName: "Văn Phòng Tổng Thống", role: "ADMIN", agency: "VĂN PHÒNG CHỦ TỊCH", positiveRatings: 3, negativeRatings: 0 },
        "canbo1": { username: "canbo1", password: "123", displayName: "Thiếu Tá Lê Minh Tuấn", role: "CÁN BỘ", agency: "CÔNG AN", positiveRatings: 5, negativeRatings: 1 },
        "lanhdao1": { username: "lanhdao1", password: "123", displayName: "Đại Tá Nguyễn Mạnh Hoàng", role: "LÃNH ĐẠO", agency: "CÔNG AN", positiveRatings: 8, negativeRatings: 0 }
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

function addLog(text) {
    const timeStr = new Date().toLocaleString('vi-VN');
    systemState.systemLogs.unshift({ time: timeStr, text });
}

// --- ROUTING API ---
app.get('/', (req, res) => {
    res.render('index', { state: systemState, registry: citizenIdentityRegistry });
});

app.get('/api/state', (req, res) => {
    res.json({ systemState, citizenIdentityRegistry });
});

// Cán bộ nhập/số hóa toàn bộ thông tin cư dân mới lên hệ thống
app.post('/api/resident/register', (req, res) => {
    const { username, name, dob, gender, pob, job, licenses, status, officerName } = req.body;
    
    citizenIdentityRegistry[username] = {
        name, dob, gender, pob, job,
        licenses: licenses ? licenses.split(',').map(l => l.trim()) : [],
        status
    };
    
    addLog(`Cán bộ [${officerName}] thực hiện số hóa thông tin định danh cư dân mới: @${username} (${name}).`);
    res.json({ success: true });
});

// Nộp đơn thư trực tuyến
app.post('/api/applications/submit', (req, res) => {
    const { sender, agency, docType, content } = req.body;
    const id = `HS-${Object.keys(systemState.applications).length + Object.keys(systemState.archivedApplications).length + 1001}`;
    const timeNow = new Date().toLocaleTimeString('vi-VN');

    systemState.applications[id] = {
        id, sender, agency, docType, content,
        status: "Đang Chờ Tiếp Nhận", stamp: "stamp-pending", handler: "Trực ban liên thông",
        logs: [{ sender: "Hệ thống", msg: `Đơn thư [${docType}] đã được gửi trực tuyến thành công.`, time: timeNow }],
        satisfaction: null
    };
    addLog(`Công dân @${sender} nộp hồ sơ [${id}] - Loại giấy tờ: ${docType} gửi đến [${agency}].`);
    res.json({ success: true, id });
});

// Hành động nghiệp vụ xử lý đơn thư
app.post('/api/applications/action', (req, res) => {
    const { id, action, msg, officerName, status, stamp, targetAgency } = req.body;
    const app = systemState.applications[id];
    if (!app) return res.status(404).json({ error: "Không tìm thấy hồ sơ" });

    const timeNow = new Date().toLocaleTimeString('vi-VN');

    if (action === 'chat') {
        app.logs.push({ sender: officerName, msg, time: timeNow });
    } else if (action === 'status') {
        app.status = status;
        app.stamp = stamp;
        app.handler = officerName;
        app.logs.push({ sender: "Hệ thống", msg: `Hồ sơ thay đổi trạng thái thành [${status}] bởi ${officerName}.`, time: timeNow });
        addLog(`Hồ sơ ${id} được xử lý bởi ${officerName} sang trạng thái: ${status}.`);
    } else if (action === 'forward') {
        app.logs.push({ sender: "Hệ thống", msg: `${officerName} điều chuyển hồ sơ liên ngành sang [${targetAgency}].`, time: timeNow });
        addLog(`Hồ sơ ${id} được ${officerName} điều chuyển liên ngành sang [${targetAgency}].`);
        app.agency = targetAgency;
        app.status = "Đã Chuyển Cấp";
        app.stamp = "stamp-forwarded";
    } else if (action === 'to_leader') {
        app.status = "Chờ Lãnh Đạo Duyệt";
        app.stamp = "stamp-leader";
        app.logs.push({ sender: "Hệ thống", msg: `Cán bộ ${officerName} đã trình hồ sơ này lên Ban Lãnh Đạo đơn vị để ký niêm phong đóng dấu.`, time: timeNow });
        addLog(`Cán bộ ${officerName} chuyển tiếp hồ sơ ${id} xin chữ ký Ban Lãnh Đạo.`);
    } else if (action === 'archive') {
        // Chức năng mới: Đóng hồ sơ chuyển cho Ban lãnh đạo & Admin xem, lưu trữ bảo mật
        app.status = "Đã Đóng & Lưu Kho";
        app.logs.push({ sender: "Hệ thống", msg: `Cán bộ ${officerName} chính thức Đóng hồ sơ này, chuyển tiếp dữ liệu vào Kho lưu trữ tối cao.`, time: timeNow });
        
        systemState.archivedApplications[id] = app;
        delete systemState.applications[id]; // Xóa khỏi danh sách xử lý thường nhật của dân cư
        
        addLog(`Cán bộ ${officerName} đã ĐỒNG HỒ SƠ số [${id}], chuyển về kho dữ liệu Trung ương của Lãnh đạo và Admin.`);
    } else if (action === 'satisfaction') {
        app.satisfaction = status;
        Object.values(systemState.authorizedPersonnel).forEach(u => {
            if (u.displayName === app.handler) {
                if (status === 'HÀI LÒNG') u.positiveRatings++;
                else u.negativeRatings++;
            }
        });
        addLog(`Công dân đánh giá [${status}] chất lượng phục vụ tại hồ sơ ${id}.`);
    }
    res.json({ success: true });
});

// Ban hành ấn bản quốc gia
app.post('/api/national/publish', (req, res) => {
    const { type, title, content, author } = req.body;
    const timeNow = new Date().toLocaleString('vi-VN');

    if (type === 'TRUY NÃ') {
        systemState.criminalWantedList.unshift({ name: title, crime: content, bounty: "Theo quy chuẩn hình sự tối cao", date: timeNow.split(' ')[1] });
        addLog(`LÃNH ĐẠO ĐƠN VỊ (${author}) phát lệnh truy nã khẩn cấp đối tượng: @${title}.`);
    } else {
        systemState.announcements.unshift({ id: `NEWS-${Date.now().toString().slice(-4)}`, type, title, content, timestamp: timeNow });
        addLog(`LÃNH ĐẠO ĐƠN VỊ (${author}) ban hành chỉ thị mới: ${title}.`);
    }
    res.json({ success: true });
});

app.post('/api/national/ticker', (req, res) => {
    systemState.tickerMessage = req.body.message;
    addLog(`Cập nhật dòng chữ thông báo LED chạy động toàn quốc.`);
    res.json({ success: true });
});

app.post('/api/national/delete-announcement', (req, res) => {
    systemState.announcements = systemState.announcements.filter(a => a.id !== req.body.id);
    res.json({ success: true });
});

app.post('/api/national/security', (req, res) => {
    systemState.securityLevel = req.body.level;
    addLog(`Thay đổi mức độ an ninh hệ thống sang trạng thái quốc gia: [${req.body.level}].`);
    res.json({ success: true });
});

app.post('/api/officer/provision', (req, res) => {
    const { username, password, displayName, role, agency } = req.body;
    systemState.authorizedPersonnel[username] = { username, password, displayName, role, agency, positiveRatings: 0, negativeRatings: 0 };
    addLog(`ADMIN bổ nhiệm nhân sự mới: ${displayName} giữ vị trí ${role} thuộc [${agency}].`);
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`Hệ thống Web Service chạy mượt mà trên cổng: ${PORT}`));
