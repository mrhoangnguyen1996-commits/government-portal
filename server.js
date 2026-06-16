const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// GIỮ NGUYÊN HOÀN TOÀN CẤU TRÚC LOGIC DỮ LIỆU CHẠY BẰNG RAM HÔM QUA
let systemState = {
    securityLevel: "AN TOÀN",
    tickerMessage: "⚡ HỆ THỐNG LIÊN THÔNG QUỐC GIA - CHÚC CÁN BỘ VÀ CƯ DÂN MỘT NGÀY LÀM VIỆC HIỆU QUẢ!",
    systemLogs: [
        { time: "22:15:30", text: "Hệ thống điện tử chỉ huy tối cao trực tuyến đã thiết lập kết nối ổn định." }
    ],
    announcements: [],
    criminalWantedList: [],
    applications: {
        "HS-8801": { id: "HS-8801", sender: "HoangManh", agency: "BỘ TƯ LỆNH", docType: "Cấp Phép Vận Chuyển Vũ Khí", content: "Đơn xin phê duyệt xe hộ tống vận tải khí tài quân sự giả lập qua các quận an ninh.", status: "Đang Chờ Tiếp Nhận" },
        "HS-8802": { id: "HS-8802", sender: "QuangTran", agency: "TÒA ÁN TỐI CAO", docType: "Lệnh Khám Xét Khẩn Cấp", content: "Lệnh phê chuẩn kiểm tra hành chính các khu vực có dấu hiệu vi phạm quy chế đô thị.", status: "Đang Chờ Tiếp Nhận" }
    },
    archivedApplications: {},
    authorizedPersonnel: {},
    citizenIdentityRegistry: {} // Lưu trữ căn cước công dân đồng bộ Roblox
};

// Route hiển thị trang chủ EJS
app.get('/', (req, res) => {
    res.render('index', { state: systemState });
});

// Route API lấy dữ liệu thô đồng bộ sang Game Roblox
app.get('/api/state', (req, res) => {
    res.json({ systemState });
});

// GIỮ NGUYÊN LOGIC XỬ LÝ ĐƠN THƯ HÔM QUA
app.post('/api/applications/action', (req, res) => {
    const { id, action, status, officerName } = req.body;
    
    if (systemState.applications[id]) {
        const timeNow = new Date().toLocaleTimeString('vi-VN');
        
        systemState.applications[id].status = status;
        systemState.systemLogs.unshift({ 
            time: timeNow, 
            text: `Hồ sơ [${id}] được xử lý trạng thái sang [${status}] bởi C cán bộ: ${officerName}.` 
        });

        // Chuyển hồ sơ sang kho lưu trữ để dọn sạch màn hình chính
        systemState.archivedApplications[id] = systemState.applications[id];
        delete systemState.applications[id];
        
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "Không tìm thấy hồ sơ chỉ định." });
    }
});

// GIỮ NGUYÊN LOGIC CẬP NHẬT MỨC ĐỘ AN NINH QUỐC GIA
app.post('/api/national/security', (req, res) => {
    const { level } = req.body;
    systemState.securityLevel = level;
    
    const timeNow = new Date().toLocaleTimeString('vi-VN');
    systemState.systemLogs.unshift({ time: timeNow, text: `HỆ THỐNG: Cấp độ an ninh quốc gia được chuyển sang mức [${level}].` });
    
    if (level === "BÁO ĐỘNG ĐỎ") {
        systemState.tickerMessage = "🚨 CẢNH BÁO: QUỐC GIA BƯỚC VÀO TRẠNG THÁI CHIẾN ĐẤU CAO ĐỘ! TOÀN BỘ CÁN BỘ QUÂN SỰ, CÔNG AN VÀO VỊ TRÍ!";
    } else {
        systemState.tickerMessage = "⚡ HỆ THỐNG LIÊN THÔNG QUỐC GIA - CHÚC CÁN BỘ VÀ CƯ DÂN MỘT NGÀY LÀM VIỆC HIỆU QUẢ!";
    }
    res.json({ success: true });
});

// Lệnh cập nhật chữ chạy độc lập từ Trạm chỉ huy
app.post('/api/national/ticker', (req, res) => {
    systemState.tickerMessage = req.body.message;
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`[HỆ THỐNG] Máy chủ phân phối chạy ổn định tại cổng mạng: ${PORT}`);
});
