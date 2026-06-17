const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Dữ liệu được lưu trữ bền vững tại Server - Không mất khi F5 tải lại trang
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
    archivedApplications: {}, // Kho lưu trữ quốc gia bảo mật
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
    const timeStr = new Date().toLocaleTimeString('vi-VN') + " - 15/06/2026";
    systemState.systemLogs.unshift({ time: timeStr, text });
}

app.get('/', (req, res) => {
    res.render('index', { state: systemState, registry: citizenIdentityRegistry });
});

app.get('/api/state', (req, res) => {
    res.json({ systemState, citizenIdentityRegistry });
});

// Đồng bộ lưu/sửa thông tin cán bộ
app.post('/api/officer/save', (req, res) => {
    const { username, password, displayName, role, agency, isEdit } = req.body;
    
    if (isEdit && systemState.authorizedPersonnel[username]) {
        let old = systemState.authorizedPersonnel[username];
        systemState.authorizedPersonnel[username] = { ...old, password, displayName, role, agency };
        addLog(`ADMIN cập nhật phân quyền tài khoản: ${username} (${displayName}) - [${agency}] - [${role}].`);
    } else {
        systemState.authorizedPersonnel[username] = { username, password, displayName, role, agency, positiveRatings: 0, negativeRatings: 0 };
        addLog(`ADMIN cấp chứng thư bổ nhiệm cán bộ mới: ${displayName} [${role}] thuộc [${agency}].`);
    }
    res.json({ success: true });
});

app.post('/api/officer/delete', (req, res) => {
    const { username } = req.body;
    if (username === 'admin') return res.status(400).json({ error: "Không thể xóa Admin hệ thống" });
    
    if (systemState.authorizedPersonnel[username]) {
        const name = systemState.authorizedPersonnel[username].displayName;
        delete systemState.authorizedPersonnel[username];
        addLog(`ADMIN tước quyền, bãi nhiệm nhân sự: ${username} (${name}).`);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "Không tìm thấy cán bộ" });
    }
});

app.post('/api/resident/register', (req, res) => {
    const { username, name, dob, gender, pob, job, licenses, status, officerName } = req.body;
    citizenIdentityRegistry[username] = {
        name, dob, gender, pob, job,
        licenses: licenses ? licenses.split(',').map(l => l.trim()) : [],
        status
    };
    addLog(`Cán bộ [${officerName}] số hóa định danh cư dân: @${username} (${name}).`);
    res.json({ success: true });
});

app.post('/api/applications/submit', (req, res) => {
    const { sender, agency, docType, content } = req.body;
    const id = `HS-${Object.keys(systemState.applications).length + Object.keys(systemState.archivedApplications).length + 1001}`;
    const timeNow = new Date().toLocaleTimeString('vi-VN');

    systemState.applications[id] = {
        id, sender, agency, docType, content,
        status: "Đang Chờ Tiếp Nhận", stamp: "stamp-pending", handler: "Chưa phân phối", handlerTitle: "Hệ thống tự động",
        logs: [{ sender: "Hệ thống", msg: `Đơn thư [${docType}] gửi đến [${agency}] thành công.`, time: timeNow }],
        satisfaction: null
    };
    addLog(`Công dân @${sender} gửi hồ sơ trực tuyến [${id}] lĩnh vực [${agency}].`);
    res.json({ success: true, id });
});

// XỬ LÝ HỒ SƠ VÀ QUY TRÌNH KHIẾU NẠI LIÊN THÔNG BỘ NGÀNH
app.post('/api/applications/action', (req, res) => {
    const { id, action, msg, officerName, officerRole, status, stamp, targetAgency } = req.body;
    
    // Tìm kiếm hồ sơ bao gồm cả trong kho lưu trữ hoạt động
    let app = systemState.applications[id] || systemState.archivedApplications[id];
    if (!app) return res.status(404).json({ error: "Không tìm thấy hồ sơ hành chính này." });

    const timeNow = new Date().toLocaleTimeString('vi-VN');

    if (action === 'chat') {
        app.logs.push({ sender: officerName, msg, time: timeNow });
    } else if (action === 'claim_packet') {
        // NÚT TIẾP NHẬN HỒ SƠ ĐỘC QUYỀN CỦA CÁN BỘ ĐƠN VỊ
        app.status = "Đã Tiếp Nhận Xử Lý";
        app.stamp = "stamp-forwarded";
        app.handler = officerName;
        app.handlerTitle = officerRole;
        app.logs.push({ sender: "Hệ thống", msg: `Hồ sơ đã được tiếp nhận và xử lý bởi Cán bộ: ${officerName} (Chức vụ: ${officerRole}).`, time: timeNow });
        addLog(`Hồ sơ ${id} đã được tiếp nhận làm việc bởi ${officerName}.`);
    } else if (action === 'status') {
        app.status = status; 
        app.stamp = stamp; 
        app.handler = officerName;
        app.handlerTitle = officerRole;
        app.logs.push({ sender: "Hệ thống", msg: `Cán bộ ${officerName} cập nhật kết quả: [${status}].`, time: timeNow });
        addLog(`Hồ sơ ${id} thay đổi trạng thái thành: ${status} bởi ${officerName}.`);
    } else if (action === 'investigate') {
        // THANH TRA YÊU CẦU ĐIỀU TRA XÁC MINH HỒ SƠ
        app.status = "Thanh Tra Đang Điều Tra";
        app.stamp = "stamp-leader";
        app.logs.push({ sender: "Thanh Tra Chính Phủ", msg: `Thanh tra viên ${officerName} phát lệnh đóng băng hồ sơ để thẩm tra, xác minh tính trung thực và chứng cứ lý lịch tư pháp.`, time: timeNow });
        addLog(`Thanh Tra Chính Phủ mở cuộc điều tra độc lập hồ sơ mang mã số: ${id}.`);
    } else if (action === 'forward') {
        app.logs.push({ sender: "Hệ thống", msg: `${officerName} điều chuyển hồ sơ liên ngành sang Bộ phận: [${targetAgency}].`, time: timeNow });
        app.agency = targetAgency; 
        app.status = "Đang Chờ Tiếp Nhận"; 
        app.stamp = "stamp-pending";
        addLog(`Hồ sơ ${id} được điều hướng chuyển ngành sang [${targetAgency}].`);
    } else if (action === 'to_leader') {
        app.status = "Chờ Lãnh Đạo Duyệt"; 
        app.stamp = "stamp-leader";
        app.logs.push({ sender: "Hệ thống", msg: `Cán bộ ${officerName} trình hồ sơ lên Cấp Lãnh Đạo cấp cao của Bộ phê duyệt văn bản chỉ thị.`, time: timeNow });
        addLog(`Cán bộ trình hồ sơ ${id} lên cấp Lãnh Đạo phê duyệt.`);
    } else if (action === 'archive') {
        app.status = "Đã Đóng & Lưu Kho";
        app.stamp = "stamp-archived";
        app.logs.push({ sender: "Hệ thống", msg: `Hồ sơ chính thức khép lại, đóng dữ liệu niêm phong đưa vào Kho Lưu Trữ Quốc Gia bởi ${officerName}.`, time: timeNow });
        
        systemState.archivedApplications[id] = app;
        delete systemState.applications[id];
        addLog(`Hồ sơ ${id} đã được đóng con dấu niêm phong chuyển vào Kho Lưu Trữ.`);
    } else if (action === 'unarchive') {
        // TRẢ LẠI HỒ SƠ TỪ KHO LƯU TRỮ
        app.status = "Mở Lại Xử Lý Lại";
        app.stamp = "stamp-pending";
        app.logs.push({ sender: "Văn Phòng Điều Hành", msg: `Cấp cao ban sắc lệnh Khôi phục / Trả lại hồ sơ từ kho lưu trữ để tái thẩm định hoặc bổ sung chứng cứ kịch bản.`, time: timeNow });
        
        systemState.applications[id] = app;
        delete systemState.archivedApplications[id];
        addLog(`Hồ sơ ${id} đã được TRẢ LẠI từ Kho lưu trữ để đưa về luồng xử lý hoạt động.`);
    } else if (action === 'satisfaction') {
        app.satisfaction = status;
        if (status === 'KHIẾU NẠI CẤP CAO') {
            app.status = "Đang Khiếu Nại Cấp Cao";
            app.stamp = "stamp-rejected";
            app.agency = "THANH TRA"; // Chuyển thẳng về đơn vị Thanh Tra xử lý
            app.logs.push({ sender: "Công Dân", msg: "CÔNG DÂN GỬI ĐƠN KHIẾU NẠI KHẨN CẤP: Yêu cầu Thanh tra Chính phủ và lãnh đạo tối cao vào cuộc điều tra quy trình làm việc của cán bộ xử lý.", time: timeNow });
            addLog(`Công dân @${app.sender} nộp đơn KHIẾU NẠI KHẨN CẤP đối với hồ sơ ${id}.`);
        } else {
            Object.values(systemState.authorizedPersonnel).forEach(u => {
                if (u.displayName === app.handler) {
                    if (status === 'HÀI LÒNG') u.positiveRatings++;
                    else u.negativeRatings++;
                }
            });
            addLog(`Công dân đánh giá chất lượng phục vụ tại hồ sơ ${id}: [${status}].`);
        }
    }
    res.json({ success: true });
});

app.post('/api/national/publish', (req, res) => {
    const { type, title, content, author } = req.body;
    const timeNow = new Date().toLocaleTimeString('vi-VN') + " - 15/06/2026";

    if (type === 'TRUY NÃ') {
        systemState.criminalWantedList.unshift({ name: title, crime: content, bounty: "Theo khung hình sự giả lập", date: new Date().toLocaleDateString('vi-VN') });
        addLog(`LÃNH ĐẠO (${author}) phát lệnh truy nã khẩn cấp đối tượng quốc gia: @${title}.`);
    } else {
        systemState.announcements.unshift({ id: `NEWS-${Date.now().toString().slice(-4)}`, type, title, content, timestamp: timeNow });
        addLog(`LÃNH ĐẠO (${author}) ban hành chỉ thị ấn bản mới: ${title}.`);
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

app.post('/api/national/security', (req, res) => {
    systemState.securityLevel = req.body.level;
    addLog(`Thay đổi mức độ cảnh báo an ninh toàn hệ thống sang: [${req.body.level}].`);
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`Hệ thống đang chạy mượt mà trên cổng: ${PORT}`));