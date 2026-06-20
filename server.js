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

// CƠ SỞ DỮ LIỆU ĐIỆN TỬ TOÀN QUỐC GIẢ LẬP
let systemState = {
    securityLevel: "AN TOÀN",
    tickerMessage: "⚡ CỔNG THÔNG TIN LIÊN THÔNG QUỐC GIA v9.0: Hệ thống kiểm soát 3 bên ký nghiêm ngặt. Phôi căn cước và bằng cấp tích hợp con dấu ban ngành số hóa.",
    systemLogs: [
        { time: new Date().toLocaleTimeString('vi-VN') + " - 2026", text: "Hệ thống lõi an ninh bảo mật v9.0.0 khởi chạy thành công." }
    ],
    announcements: [
        { id: \"NEWS-1001\", type: \"QUYẾT ĐỊNH\", title: \"Vận hành quy trình ký số liên thông 3 bên\", content: \"Yêu cầu tất cả biên bản xử phạt và đơn thư phải được Công dân ký nhận, Cán bộ thẩm định và Lãnh đạo phê chuẩn trước khi niêm phong lưu kho.\", timestamp: \"18:00:00\" }
    ],
    criminalWantedList: [],
    // Quản lý tài khoản cán bộ nghiệp vụ
    authorizedPersonnel: {
        "admin": { username: "admin", password: "123", displayName: "Giám Sát Tối Cao", role: "ADMIN", agency: "CHÍNH PHỦ", positiveRatings: 0, negativeRatings: 0 }
    },
    // Kho hồ sơ đang hoạt động
    applications: {},
    // Kho lưu trữ quốc gia vĩnh viễn (Sửa lỗi đồng bộ dữ liệu)
    archivedApplications: {}
};

// Đăng ký mặc định một số tài khoản cư dân để test phôi đồ họa
let citizenIdentityRegistry = {
    "Nguyen_Manh_Hoang": {
        username: "Nguyen_Manh_Hoang",
        name: "Nguyễn Mạnh Hoàng",
        dob: "18/05/1996",
        gender: "Nam",
        pob: "Đà Lạt, Lâm Đồng",
        job: "Purchasing Supervisor",
        licenses: ["Căn Cước Công Dân Gắn Chíp Số Hóa"],
        status: "Dân Cư Hợp Pháp - Lý Lịch Trong Sạch",
        customDocInfo: {}
    }
};

let criminalRecordsRegistry = {};

function addLog(text) {
    const timeNow = new Date().toLocaleTimeString('vi-VN') + " - Realtime";
    systemState.systemLogs.unshift({ time: timeNow, text });
    if (systemState.systemLogs.length > 100) systemState.systemLogs.pop();
}

function broadcastUpdate() {
    io.emit('stateUpdate', {
        systemState,
        citizenIdentityRegistry,
        criminalRecordsRegistry
    });
}

// ROUTING TRANG CHỦ
app.get('/', (req, res) => {
    res.render('index', {
        state: systemState,
        registry: citizenIdentityRegistry,
        violations: criminalRecordsRegistry
    });
});

// ROUTE API KHỞI TẠO ĐƠN THƯ HÀNH CHÍNH SỐ
app.post('/api/applications/submit', (req, res) => {
    const { sender, agency, docType, content } = req.body;
    const id = `HS-${Date.now().toString().slice(-4)}`;
    
    systemState.applications[id] = {
        id, sender, agency, docType, content,
        status: "Đang Chờ Tiếp Nhận",
        stamp: "stamp-pending",
        citizenSigned: false,
        officerSigned: false,
        leaderSigned: false,
        satisfaction: null,
        logs: [{ sender: "Hệ thống điện tử", msg: `Đơn thư khởi tạo thành công vào ban ngành [${agency}]. Đang chờ cán bộ tiếp nhận phân luồng.`, time: new Date().toLocaleTimeString('vi-VN') }]
    };
    
    addLog(`Công dân @${sender} nộp đơn thư thủ tục: [${docType}] gửi ban ngành [${agency}].`);
    io.emit('newApplicationAlert', systemState.applications[id]);
    broadcastUpdate();
    res.json({ success: true, id });
});

// ROUTE API LẬP BIÊN BẢN VI PHẠM (QUY TRÌNH LUỒNG TỰ ĐỘNG KHỞI TẠO ĐƠN 3 BÊN KÝ)
app.post('/api/resident/violation', (req, res) => {
    const { username, type, lawClause, fine, status, officerName } = req.body;
    const vId = `BB-${Date.now().toString().slice(-4)}`;
    
    // Đẩy vào danh sách vi phạm của công dân
    if (!criminalRecordsRegistry[username]) criminalRecordsRegistry[username] = [];
    criminalRecordsRegistry[username].push({ id: vId, type, lawClause, fine, status, officer: officerName, date: new Date().toLocaleDateString('vi-VN') });
    
    // Tự động đồng bộ biên bản thành một hồ sơ cần ký 3 bên liên thông
    systemState.applications[vId] = {
        id: vId,
        sender: username,
        agency: type,
        docType: "BIÊN BẢN XỬ PHẠT TƯ PHÁP",
        content: `Cáo buộc vi phạm: ${lawClause}. Khung tiền hình phạt: ${fine}. Tiến độ sơ bộ lập bởi cán bộ: ${officerName}. Trạng thái luồng: [${status}]. Yêu cầu người vi phạm tiến hành ký nhận hoặc khiếu nại lên cấp Lãnh đạo/Admin.`,
        status: "Chờ Công Dân Ký",
        stamp: "stamp-pending",
        citizenSigned: false,
        officerSigned: true, // Cán bộ lập đơn coi như đã ký lớp thứ nhất
        leaderSigned: false,
        satisfaction: null,
        logs: [{ sender: `Cán bộ ${officerName}`, msg: `Đã lập biên bản vi phạm xử lý số hiệu ${vId}. Đang chờ tài khoản bị lập @${username} vào ký xác nhận biên bản.`, time: new Date().toLocaleTimeString('vi-VN') }]
    };

    addLog(`Cán bộ ${officerName} lập hồ sơ biên bản vi phạm hình sự ${vId} đối với @${username}.`);
    broadcastUpdate();
    res.json({ success: true, id: vId });
});

// ROUTE API XỬ LÝ HÀNH ĐỘNG HỒ SƠ - QUY TRÌNH KÝ LUÂN CHUYỂN PHÂN QUYỀN VÀ XEM KHO LƯU TRỮ TRỰC TIẾP
app.post('/api/applications/action', (req, res) => {
    const { id, action, status, stamp, targetAgency, officerName, officerRole, msg } = req.body;
    let app = systemState.applications[id] || systemState.archivedApplications[id];
    
    if (!app) return res.status(404).json({ error: "Không tìm thấy hồ sơ số." });

    if (action === 'chat') {
        app.logs.push({ sender: officerName, msg: msg, time: new Date().toLocaleTimeString('vi-VN') });
        io.emit('newChatMessage', { fileId: id });
    } 
    else if (action === 'claim_packet') {
        app.status = "Cán bộ đang thẩm định";
        app.stamp = "stamp-forwarded";
        app.officerSigned = true;
        app.logs.push({ sender: officerName, msg: `Cán bộ ${officerName} đã tiếp nhận phụ trách thẩm tra hồ sơ và ký xác nhận chữ ký Cán Bộ.`, time: new Date().toLocaleTimeString('vi-VN') });
    } 
    else if (action === 'citizen_sign') {
        app.citizenSigned = true;
        app.status = "Chờ Lãnh Đạo Ký Duyệt";
        app.stamp = "stamp-pending";
        app.logs.push({ sender: "Hệ thống xác thực", msg: `Công dân @${app.sender} đã hoàn tất ký tên điện tử đồng ý biên bản/đơn thư. Hồ sơ tự động chuyển tiếp lên cấp Lãnh Đạo đơn vị.`, time: new Date().toLocaleTimeString('vi-VN') });
    }
    else if (action === 'citizen_reject_sign') {
        app.citizenSigned = false;
        app.status = "Tranh Chấp - Trình Cấp Cao Xử Lý";
        app.stamp = "stamp-rejected";
        app.logs.push({ sender: "Hệ thống xác thực", msg: `Công dân @${app.sender} từ chối ký biên bản vi phạm! Hồ sơ lập tức chuyển lên cấp Lãnh đạo đơn vị và Ban Giám sát Admin tối cao thụ lý giải quyết tranh chấp.`, time: new Date().toLocaleTimeString('vi-VN') });
    }
    else if (action === 'to_leader') {
        app.status = "Trình Lãnh Đạo Ký Duyệt";
        app.stamp = "stamp-leader";
        app.logs.push({ sender: officerName, msg: `Cán bộ ${officerName} đã ký tên duyệt sơ bộ và đẩy hồ sơ lên danh sách chờ Lãnh Đạo ban ngành đóng dấu phê chuẩn sau cùng.`, time: new Date().toLocaleTimeString('vi-VN') });
    } 
    else if (action === 'forward') {
        app.agency = targetAgency;
        app.status = "Đang Chờ Tiếp Nhận";
        app.stamp = "stamp-forwarded";
        app.logs.push({ sender: officerName, msg: `Cán bộ ${officerName} thực hiện phân luồng điều chuyển hồ sơ liên thông sang ban ngành mới: [${targetAgency}].`, time: new Date().toLocaleTimeString('vi-VN') });
    } 
    else if (action === 'status') {
        app.status = status;
        app.stamp = stamp;
        if (status === 'Đã Phê Duyệt') {
            app.leaderSigned = true; // Lãnh đạo duyệt coi như ký lớp sau cùng
        }
        app.logs.push({ sender: officerName, msg: `Lãnh Đạo đơn vị (${officerName}) phê chuẩn thay đổi trạng thái hồ sơ thành: [${status}].`, time: new Date().toLocaleTimeString('vi-VN') });
    } 
    else if (action === 'satisfaction') {
        app.satisfaction = status;
        app.logs.push({ sender: "Hệ thống khảo sát", msg: `Người dân phản hồi mức độ giải quyết: [${status}].`, time: new Date().toLocaleTimeString('vi-VN') });
    } 
    else if (action === 'archive') {
        // CHỈ KHI ĐỦ 3 CHỮ KÝ HOẶC ĐƯỢC ADMIN PHÊ DUYỆT ĐẶC CÁCH MỚI ĐƯỢC LƯU KHO QUỐC GIA
        if ((app.citizenSigned && app.officerSigned && app.leaderSigned) || officerRole === 'ADMIN') {
            app.status = "Đã Khóa & Lưu Kho Quốc Gia";
            app.stamp = "stamp-archived";
            app.logs.push({ sender: officerName, msg: `Thực hiện niêm phong mã hóa, đồng bộ hồ sơ chuyển giao vào Kho Lưu Trữ Quốc Gia Tối Cao.`, time: new Date().toLocaleTimeString('vi-VN') });
            
            // Chuyển giao vùng nhớ sang Kho lưu trữ vĩnh viễn (Đảm bảo không bị mất thuộc tính)
            systemState.archivedApplications[id] = app;
            delete systemState.applications[id];
            addLog(`Hồ sơ số ${id} đã đủ 3 chữ ký số ban ngành, niêm phong thành công vào Kho lưu trữ Quốc gia.`);
        } else {
            return res.json({ success: false, error: "Hồ sơ chưa đủ điều kiện lưu trữ! Yêu cầu phải có đủ chữ ký của cả 3 bên (Công dân, Cán bộ lập, Lãnh đạo duyệt)." });
        }
    } 
    else if (action === 'unarchive') {
        // ĐẶC QUYỀN ADMIN TÁI THẨM PHỤC HỒI HỒ SƠ TỪ KHO LƯU TRỮ
        app.status = "Cấp Admin Phục Hồi - Tái Thẩm";
        app.stamp = "stamp-pending";
        app.leaderSigned = false;
        app.logs.push({ sender: "ADMIN TỐI CAO", msg: `Kích hoạt đặc quyền Tái Thẩm Tối Cao. Trục xuất hồ sơ khỏi kho lưu trữ quốc gia để xử lý lại kịch bản nghiệp vụ.`, time: new Date().toLocaleTimeString('vi-VN') });
        
        systemState.applications[id] = app;
        delete systemState.archivedApplications[id];
        addLog(`ADMIN kích hoạt quyền lực tái thẩm, phục hồi hồ sơ lưu kho số ${id}.`);
    }

    broadcastUpdate();
    res.json({ success: true });
});

// ROUTE API SỐ HÓA VÀ CẤP PHÔI VĂN BẰNG ĐẦY ĐỦ THÔNG TIN NHẬP LIỆU
app.post('/api/resident/register', (req, res) => {
    const { username, name, dob, gender, pob, job, licenses, status, officerName, customDocInfo } = req.body;
    
    // Tách mảng văn bằng từ chuỗi
    let licenseArray = Array.isArray(licenses) ? licenses : licenses.split(',').map(l => l.trim()).filter(Boolean);

    citizenIdentityRegistry[username] = {
        username, name, dob, gender, pob, job,
        licenses: licenseArray,
        status,
        officer: officerName,
        customDocInfo: customDocInfo || {} // Lưu các thông tin nhập vai mở rộng (Số hiệu bằng, ngày cấp, v.v)
    };

    addLog(`Cán bộ ${officerName} cập nhật phôi văn bằng và thông tin lý lịch cho tài khoản cư dân @${username}.`);
    broadcastUpdate();
    res.json({ success: true });
});

// ROUTE CẤP PHÂN QUYỀN NHÂN SỰ CÁN BỘ CỦA ADMIN
app.post('/api/officer/save', (req, res) => {
    const { username, password, displayName, role, agency, isEdit } = req.body;
    systemState.authorizedPersonnel[username] = { username, password, displayName, role, agency, positiveRatings: 0, negativeRatings: 0 };
    addLog(`ADMIN thiết lập sắc lệnh phân quyền nhân sự cấp bậc cho cán bộ: @${username} [${role}] thuộc [${agency}].`);
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/officer/delete', (req, res) => {
    delete systemState.authorizedPersonnel[req.body.username];
    addLog(`ADMIN trục xuất, tước sắc lệnh công vụ vĩnh viễn của tài khoản: @${req.body.username}.`);
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/national/publish', (req, res) => {
    const { type, title, content, author } = req.body;
    const timeNow = new Date().toLocaleTimeString('vi-VN');
    if (type === 'TRUY NÃ') {
        systemState.criminalWantedList.unshift({ name: title, crime: content, bounty: "Theo khung hình sự giả lập", date: new Date().toLocaleDateString('vi-VN') });
        addLog(`LÃNH ĐẠO (${author}) phát lệnh truy nã khẩn cấp đối tượng quốc gia: @${title}.`);
    } else {
        systemState.announcements.unshift({ id: `NEWS-${Date.now().toString().slice(-4)}`, type, title, content, timestamp: timeNow });
        addLog(`LÃNH ĐẠO (${author}) ban hành chỉ thị ấn bản mới: ${title}.`);
    }
    broadcastUpdate();
    res.json({ success: true });
});

app.post('/api/national/ticker', (req, res) => { systemState.tickerMessage = req.body.message; broadcastUpdate(); res.json({ success: true }); });
app.post('/api/national/delete-announcement', (req, res) => { systemState.announcements = systemState.announcements.filter(a => a.id !== req.body.id); broadcastUpdate(); res.json({ success: true }); });
app.post('/api/national/security', (req, res) => { systemState.securityLevel = req.body.level; addLog(`Thay đổi mức độ cảnh báo an ninh toàn hệ thống sang: [${req.body.level}].`); broadcastUpdate(); res.json({ success: true }); });

io.on('connection', (socket) => {
    socket.emit('initData', {
        systemState,
        citizenIdentityRegistry,
        criminalRecordsRegistry
    });
});

server.listen(PORT, () => {
    console.log(`Server v9.0 đang chạy trên cổng ${PORT}`);
});
