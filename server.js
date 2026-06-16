const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// CƠ SỞ DỮ LIỆU TẠM THỜI CHẠY BẰNG RAM (Lưu biến hệ thống như hôm qua)
let systemState = {
    securityLevel: "AN TOÀN",
    tickerMessage: "⚡ HỆ THỐNG LIÊN THÔNG QUỐC GIA - CHÚC CÁN BỘ VÀ CƯ DÂN MỘT NGÀY LÀM VIỆC HIỆU QUẢ!",
    systemLogs: [
        { time: "22:00:15", text: "Trạm điều hành hệ thống bảo mật tối cao đã khởi động thành công." }
    ],
    announcements: [],
    criminalWantedList: [],
    applications: {
        "HS-1001": { id: "HS-1001", sender: "HoangNguyen", agency: "BỘ CÔNG AN", docType: "Xin Cấp Thị Thực Quốc Tế", content: "Yêu cầu cấp thị thực di chuyển liên lục địa giả lập phục vụ công tác đặc biệt.", status: "Đang Chờ Tiếp Nhận" },
        "HS-1002": { id: "HS-1002", sender: "MinhQuang", agency: "BỘ TÀI CHÍNH", docType: "Cấp Phát Ngân Sách Quân Khu", content: "Đơn xin phê duyệt ngân sách mua sắm trang thiết bị tuần tra đô thị tuần mới.", status: "Đang Chờ Tiếp Nhận" }
    },
    archivedApplications: {},
    authorizedPersonnel: {}
};

// Giao diện trang chủ
app.get('/', (req, res) => {
    res.render('index', systemState);
});

// API Lấy dữ liệu đồng bộ sang Roblox
app.get('/api/state', (req, res) => {
    res.json({ systemState });
});

// API Thao tác duyệt/từ chối hồ sơ đơn thư
app.post('/api/applications/action', (req, res) => {
    const { id, action, status, officerName } = req.body;
    
    if (systemState.applications[id]) {
        const timeNow = new Date().toLocaleTimeString('vi-VN');
        if (status === 'Chấp Thuận Hợp Pháp') {
            systemState.applications[id].status = "ĐÃ PHÊ DUYỆT";
            systemState.systemLogs.unshift({ time: timeNow, text: `Hồ sơ [${id}] đã được phê duyệt bởi ${officerName}.` });
        } else {
            systemState.applications[id].status = "BỊ BÁC BỎ";
            systemState.systemLogs.unshift({ time: timeNow, text: `Hồ sơ [${id}] bị bác bỏ hủy bỏ bởi ${officerName}.` });
        }
        // Chuyển sang kho lưu trữ để làm trống danh sách xử lý
        systemState.archivedApplications[id] = systemState.applications[id];
        delete systemState.applications[id];
        
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "Không tìm thấy mã hồ sơ." });
    }
});

// API Thay đổi trạng thái Cấp độ an ninh quốc gia
app.post('/api/national/security', (req, res) => {
    const { level } = req.body;
    systemState.securityLevel = level;
    
    const timeNow = new Date().toLocaleTimeString('vi-VN');
    systemState.systemLogs.unshift({ time: timeNow, text: `⚠️ CẢNH BÁO: Mức độ an ninh toàn quốc đổi thành [${level}].` });
    
    if (level === "BÁO ĐỘNG ĐỎ") {
        systemState.tickerMessage = "🚨 BÁO ĐỘNG ĐỎ TOÀN QUỐC! TẤT CẢ CÁN BỘ VÀO VỊ TRÍ CHIẾN ĐẤU, TẠM DỪNG TIẾP NHẬN DÂN SỰ!";
    } else {
        systemState.tickerMessage = "⚡ HỆ THỐNG LIÊN THÔNG QUỐC GIA - CHÚC CÁN BỘ VÀ CƯ DÂN MỘT NGÀY LÀM VIỆC HIỆU QUẢ!";
    }
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server hiệu ứng đang chạy trên cổng: ${PORT}`);
});
