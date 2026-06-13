package chandanv.local.chandanv.controllers;

import java.time.Instant;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.bson.types.ObjectId;

@RestController
@RequestMapping("/api/management")
@CrossOrigin(origins = "*")
public class ManagementController {

    private final MongoTemplate mongoTemplate;

    public ManagementController(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @GetMapping("/nhan-vien")
    public List<EmployeeDto> getEmployees() {
        return mongoTemplate.findAll(Document.class, "nhan_vien")
                .stream()
                .map(this::toEmployee)
                .sorted(Comparator.comparing(EmployeeDto::idNV))
                .toList();
    }

    @GetMapping("/nhan-vien/{id}")
    public ResponseEntity<EmployeeDto> getEmployee(@PathVariable String id) {
        Document employee = findEmployeeById(id);
        if (employee == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(toEmployee(employee));
    }

    @PostMapping("/nhan-vien")
    public ResponseEntity<?> createEmployee(@RequestBody EmployeeWriteRequest request) {
        if (isBlank(request.hoVaTen()) || isBlank(request.username()) || isBlank(request.matKhau())) {
            return ResponseEntity.badRequest().body("Họ tên, username và mật khẩu là bắt buộc");
        }

        if (usernameExists(request.username(), null)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username đã tồn tại");
        }

        Document employee = new Document()
                .append("idNV", nextIdNV())
                .append("HoVaten", request.hoVaTen().trim())
                .append("Username", request.username().trim())
                .append("ChucVu", defaultString(request.chucVu(), "Phục vụ"))
                .append("HinhThuc", defaultString(request.hinhThuc(), "FULLTIME"))
                .append("SoDienThoai", defaultString(request.soDienThoai(), ""))
                .append("MatKhau", request.matKhau());

        if (!isBlank(request.caLam())) {
            employee.append("CaLam", request.caLam().trim());
        }

        mongoTemplate.save(employee, "nhan_vien");
        return ResponseEntity.ok(toEmployee(employee));
    }

    @PutMapping("/nhan-vien/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable String id, @RequestBody EmployeeWriteRequest request) {
        Document employee = findEmployeeById(id);
        if (employee == null) {
            return ResponseEntity.notFound().build();
        }

        if (isBlank(request.hoVaTen()) || isBlank(request.username())) {
            return ResponseEntity.badRequest().body("Họ tên và username là bắt buộc");
        }

        if (usernameExists(request.username(), id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username đã tồn tại");
        }

        employee.put("HoVaten", request.hoVaTen().trim());
        employee.put("Username", request.username().trim());
        employee.put("ChucVu", defaultString(request.chucVu(), stringValue(employee, "ChucVu")));
        employee.put("HinhThuc", defaultString(request.hinhThuc(), stringValue(employee, "HinhThuc")));
        employee.put("SoDienThoai", defaultString(request.soDienThoai(), stringValue(employee, "SoDienThoai")));

        if (!isBlank(request.matKhau())) {
            employee.put("MatKhau", request.matKhau());
        }

        if (!isBlank(request.caLam())) {
            employee.put("CaLam", request.caLam().trim());
        }

        mongoTemplate.save(employee, "nhan_vien");
        return ResponseEntity.ok(toEmployee(employee));
    }

    @DeleteMapping("/nhan-vien/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable String id) {
        Document employee = findEmployeeById(id);
        if (employee == null) {
            return ResponseEntity.notFound().build();
        }

        mongoTemplate.remove(employee, "nhan_vien");
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/phan-quyen")
    public List<RoleDto> getRoles() {
        Map<String, Long> counts = getEmployees()
                .stream()
                .collect(Collectors.groupingBy(
                        employee -> roleName(employee.chucVu()),
                        LinkedHashMap::new,
                        Collectors.counting()));

        ensureDefaultPermissions(counts);

        Map<String, Integer> peopleCount = new LinkedHashMap<>();
        peopleCount.put("Admin", 2);
        counts.forEach((role, count) -> peopleCount.put(roleName(role), count.intValue()));

        return mongoTemplate.findAll(Document.class, "phan_quyen")
                .stream()
                .map(doc -> new RoleDto(
                        stringValue(doc, "tenVaiTro"),
                        peopleCount.getOrDefault(stringValue(doc, "tenVaiTro"), 0),
                        permissionMap(doc)))
                .sorted(Comparator.comparing(RoleDto::tenVaiTro))
                .toList();
    }

    @PutMapping("/phan-quyen")
    public RoleDto updatePermission(@RequestBody PermissionUpdateRequest request) {
        ensureDefaultPermissions(new LinkedHashMap<>());

        Document role = mongoTemplate.findOne(
                Query.query(Criteria.where("tenVaiTro").is(request.tenVaiTro())),
                Document.class,
                "phan_quyen");

        if (role == null) {
            role = new Document("tenVaiTro", request.tenVaiTro())
                    .append("quyen", defaultPermissions(request.tenVaiTro()));
        }

        Document permissions = role.get("quyen", Document.class);
        if (permissions == null) {
            permissions = new Document(defaultPermissions(request.tenVaiTro()));
        }

        permissions.put(request.tenQuyen(), request.enabled());
        role.put("quyen", permissions);
        mongoTemplate.save(role, "phan_quyen");

        return new RoleDto(request.tenVaiTro(), 0, permissionMap(role));
    }

    @GetMapping("/kho")
    public InventoryResponse getInventory() {
        List<NguyenLieuItemDto> nguyenLieuItems = getNguyenLieuInventory();
        long lowIngredient = nguyenLieuItems.stream().filter(NguyenLieuItemDto::canhBao).count();
        return new InventoryResponse(nguyenLieuItems.size(), lowIngredient, nguyenLieuItems);
    }

    @GetMapping("/nguyen-lieu")
    public List<NguyenLieuItemDto> getNguyenLieu() {
        return getNguyenLieuInventory();
    }

    @PostMapping("/nguyen-lieu")
    public ResponseEntity<?> createNguyenLieu(@RequestBody NguyenLieuWriteRequest request) {
        if (isBlank(request.tenNguyenLieu())) {
            return ResponseEntity.badRequest().body("Tên nguyên liệu là bắt buộc");
        }

        int idNL = nextIdNL();
        Document ingredient = new Document()
                .append("idNL", idNL)
                .append("tenNguyenLieu", request.tenNguyenLieu().trim())
                .append("donViTinh", defaultString(request.donViTinh(), "Kg"))
                .append("loai", defaultString(request.loai(), "Khác"));

        mongoTemplate.save(ingredient, "nguyen_lieu");

        int stock = request.soLuongTon() != null ? request.soLuongTon() : 0;
        int minStock = request.mucCanhBao() != null ? request.mucCanhBao() : 5;
        upsertTonKho(idNL, stock, minStock);

        return ResponseEntity.ok(toNguyenLieuItem(ingredient, stock, minStock));
    }

    @PutMapping("/ton-kho/{idNL}")
    public ResponseEntity<?> updateTonKho(@PathVariable int idNL, @RequestBody TonKhoWriteRequest request) {
        Document ingredient = mongoTemplate.findOne(
                Query.query(Criteria.where("idNL").is(idNL)),
                Document.class,
                "nguyen_lieu");

        if (ingredient == null) {
            return ResponseEntity.notFound().build();
        }

        int stock = request.soLuongTon() != null ? request.soLuongTon() : 0;
        int minStock = request.mucCanhBao() != null ? request.mucCanhBao() : 5;
        upsertTonKho(idNL, stock, minStock);

        return ResponseEntity.ok(toNguyenLieuItem(ingredient, stock, minStock));
    }

    @PutMapping("/mon-an/{idMon}/ton-kho")
    public ResponseEntity<?> updateMonAnStock(@PathVariable int idMon, @RequestBody TonKhoWriteRequest request) {
        Document monAn = mongoTemplate.findOne(
                Query.query(Criteria.where("idMon").is(idMon)),
                Document.class,
                "mon_an");

        if (monAn == null) {
            return ResponseEntity.notFound().build();
        }

        if (request.soLuongTon() != null) {
            monAn.put("soLuongTon", request.soLuongTon());
        }
        if (request.mucCanhBao() != null) {
            monAn.put("mucCanhBao", request.mucCanhBao());
        }

        mongoTemplate.save(monAn, "mon_an");
        return ResponseEntity.ok(monAn);
    }

    @GetMapping("/bao-cao")
    public ReportDto getReport() {
        List<Document> orders = mongoTemplate.findAll(Document.class, "don_hang");
        List<Document> details = mongoTemplate.findAll(Document.class, "chi_tiet_don");
        List<Document> history = mongoTemplate.findAll(Document.class, "lich_su_ban_hang");

        double revenue = orders.stream()
                .mapToDouble(doc -> numberValue(doc, "tongTien"))
                .sum();
        long orderCount = orders.size();
        double average = orderCount == 0 ? 0 : revenue / orderCount;

        Map<Integer, Long> byStatus = orders.stream()
                .collect(Collectors.groupingBy(doc -> intValue(doc, "trangThai"), Collectors.counting()));

        Map<String, Double> hourly = new LinkedHashMap<>();
        for (int hour = 7; hour <= 18; hour++) {
            hourly.put(String.format("%02d:00", hour), 0.0);
        }

        for (Document order : orders) {
            int hour = orderHour(order);
            String key = String.format("%02d:00", Math.max(7, Math.min(18, hour)));
            hourly.put(key, hourly.getOrDefault(key, 0.0) + numberValue(order, "tongTien"));
        }

        List<TopProductDto> topProducts = topProducts(details);
        double paidRevenue = history.stream()
                .mapToDouble(doc -> numberValue(doc, "tongTienThanhToan"))
                .sum();

        return new ReportDto(
                revenue,
                paidRevenue,
                orderCount,
                average,
                byStatus.getOrDefault(0, 0L),
                byStatus.getOrDefault(1, 0L),
                byStatus.getOrDefault(2, 0L),
                hourly,
                topProducts);
    }

    private List<TopProductDto> topProducts(List<Document> details) {
        Map<Integer, ProductAggregate> aggregates = new HashMap<>();
        Map<Integer, String> productNames = mongoTemplate.findAll(Document.class, "mon_an")
                .stream()
                .collect(Collectors.toMap(
                        doc -> intValue(doc, "idMon"),
                        doc -> stringValue(doc, "TenMon"),
                        (left, right) -> left));

        for (Document detail : details) {
            int idMon = intValue(detail, "idMon");
            if (idMon == 0) {
                idMon = intValue(detail, "idChiTiet");
            }

            int quantity = Math.max(1, intValue(detail, "soLuong"));
            double total = 0;
            Object price = detail.get("donGiaThanhTien");
            if (price instanceof Document priceDoc) {
                total = numberValue(priceDoc, "thanhTien");
            }

            ProductAggregate aggregate = aggregates.computeIfAbsent(idMon, key -> new ProductAggregate());
            aggregate.quantity += quantity;
            aggregate.revenue += total;
        }

        return aggregates.entrySet()
                .stream()
                .map(entry -> new TopProductDto(
                        productNames.getOrDefault(entry.getKey(), "Món #" + entry.getKey()),
                        entry.getValue().quantity,
                        entry.getValue().revenue))
                .sorted(Comparator.comparing(TopProductDto::quantity).reversed())
                .limit(5)
                .toList();
    }

    private EmployeeDto toEmployee(Document doc) {
        return new EmployeeDto(
                stringValue(doc, "_id"),
                intValue(doc, "idNV"),
                stringValue(doc, "HoVaten"),
                stringValue(doc, "Username"),
                stringValue(doc, "ChucVu"),
                stringValue(doc, "HinhThuc"),
                stringValue(doc, "SoDienThoai"),
                "Đang làm",
                stringValue(doc, "CaLam"));
    }

    private Document findEmployeeById(String id) {
        if (ObjectId.isValid(id)) {
            Document byObjectId = mongoTemplate.findById(new ObjectId(id), Document.class, "nhan_vien");
            if (byObjectId != null) {
                return byObjectId;
            }
        }

        return mongoTemplate.findOne(
                Query.query(Criteria.where("idNV").is(parseIntOrZero(id))),
                Document.class,
                "nhan_vien");
    }

    private int nextIdNV() {
        return mongoTemplate.findAll(Document.class, "nhan_vien")
                .stream()
                .mapToInt(doc -> intValue(doc, "idNV"))
                .max()
                .orElse(0) + 1;
    }

    private int nextIdNL() {
        return mongoTemplate.findAll(Document.class, "nguyen_lieu")
                .stream()
                .mapToInt(doc -> intValue(doc, "idNL"))
                .max()
                .orElse(0) + 1;
    }

    private int nextIdTonKho() {
        return mongoTemplate.findAll(Document.class, "ton_kho")
                .stream()
                .mapToInt(doc -> intValue(doc, "idTonKho"))
                .max()
                .orElse(0) + 1;
    }

    private boolean usernameExists(String username, String excludeId) {
        Document existing = mongoTemplate.findOne(
                Query.query(Criteria.where("Username").is(username.trim())),
                Document.class,
                "nhan_vien");

        if (existing == null) {
            return false;
        }

        if (excludeId == null) {
            return true;
        }

        String existingId = stringValue(existing, "_id");
        return !existingId.equals(excludeId);
    }

    private List<NguyenLieuItemDto> getNguyenLieuInventory() {
        Map<Integer, Document> stockByIngredient = mongoTemplate.findAll(Document.class, "ton_kho")
                .stream()
                .collect(Collectors.toMap(
                        doc -> intValue(doc, "idNL"),
                        doc -> doc,
                        (left, right) -> left));

        return mongoTemplate.findAll(Document.class, "nguyen_lieu")
                .stream()
                .map(doc -> {
                    int idNL = intValue(doc, "idNL");
                    Document stock = stockByIngredient.get(idNL);
                    int quantity = stock == null ? 0 : intValue(stock, "soLuongTon");
                    int minStock = stock == null ? 5 : intValueOrDefault(stock, "mucCanhBao", 5);
                    return toNguyenLieuItem(doc, quantity, minStock);
                })
                .sorted(Comparator.comparing(NguyenLieuItemDto::idNL))
                .toList();
    }

    private NguyenLieuItemDto toNguyenLieuItem(Document doc, int stock, int minStock) {
        return new NguyenLieuItemDto(
                intValue(doc, "idNL"),
                stringValue(doc, "tenNguyenLieu"),
                stringValue(doc, "donViTinh"),
                stringValue(doc, "loai"),
                stock,
                minStock,
                stock <= minStock);
    }

    private void upsertTonKho(int idNL, int stock, int minStock) {
        Document existing = mongoTemplate.findOne(
                Query.query(Criteria.where("idNL").is(idNL)),
                Document.class,
                "ton_kho");

        if (existing == null) {
            existing = new Document()
                    .append("idTonKho", nextIdTonKho())
                    .append("idNL", idNL);
        }

        existing.put("soLuongTon", stock);
        existing.put("mucCanhBao", minStock);
        existing.put("ngayCapNhat", Instant.now());
        mongoTemplate.save(existing, "ton_kho");
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String defaultString(String value, String fallback) {
        return isBlank(value) ? fallback : value.trim();
    }

    private int parseIntOrZero(String value) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException ignored) {
            return 0;
        }
    }

    private Map<String, Boolean> permissions(boolean employees, boolean reports, boolean orders, boolean inventory, boolean qr, boolean settings) {
        Map<String, Boolean> permissions = new LinkedHashMap<>();
        permissions.put("Quản lý nhân viên", employees);
        permissions.put("Báo cáo doanh thu", reports);
        permissions.put("Xem đơn hàng", orders);
        permissions.put("Quản lý kho", inventory);
        permissions.put("Quản lý mã QR", qr);
        permissions.put("Cài đặt hệ thống", settings);
        return permissions;
    }

    private void ensureDefaultPermissions(Map<String, Long> counts) {
        upsertDefaultPermission("Admin");

        if (counts.isEmpty()) {
            upsertDefaultPermission("Thu ngân");
            upsertDefaultPermission("Phục vụ");
            return;
        }

        counts.keySet().forEach(role -> upsertDefaultPermission(roleName(role)));
    }

    private void upsertDefaultPermission(String role) {
        Document existing = mongoTemplate.findOne(
                Query.query(Criteria.where("tenVaiTro").is(role)),
                Document.class,
                "phan_quyen");

        if (existing == null) {
            mongoTemplate.save(
                    new Document("tenVaiTro", role).append("quyen", defaultPermissions(role)),
                    "phan_quyen");
        }
    }

    private Map<String, Boolean> defaultPermissions(String role) {
        String normalized = role == null ? "" : role.toLowerCase();
        boolean admin = normalized.contains("admin") || normalized.contains("quản") || normalized.contains("quan");
        boolean cashier = normalized.contains("thu");
        return permissions(admin, admin || cashier, true, admin, admin, admin);
    }

    private Map<String, Boolean> permissionMap(Document role) {
        Object value = role.get("quyen");
        if (value instanceof Document doc) {
            Map<String, Boolean> result = new LinkedHashMap<>();
            doc.forEach((key, enabled) -> result.put(key, Boolean.TRUE.equals(enabled)));
            return result;
        }

        return defaultPermissions(stringValue(role, "tenVaiTro"));
    }

    private String roleName(String chucVu) {
        if (chucVu == null || chucVu.isBlank()) {
            return "Nhân viên";
        }

        String normalized = chucVu.trim().toLowerCase();
        if (normalized.contains("admin") || normalized.contains("quản") || normalized.contains("quan")) {
            return "Admin";
        }
        if (normalized.contains("thu")) {
            return "Thu ngân";
        }
        if (normalized.contains("phục") || normalized.contains("phuc")) {
            return "Phục vụ";
        }

        return chucVu;
    }

    private int orderHour(Document order) {
        Object value = order.get("thoiGian");

        if (value instanceof java.util.Date date) {
            return date.toInstant().atZone(ZoneId.systemDefault()).getHour();
        }

        if (value instanceof Instant instant) {
            return instant.atZone(ZoneId.systemDefault()).getHour();
        }

        return LocalTime.now().getHour();
    }

    private String stringValue(Document doc, String key) {
        Object value = doc.get(key);
        return value == null ? "" : Objects.toString(value, "");
    }

    private int intValue(Document doc, String key) {
        return intValueOrDefault(doc, key, 0);
    }

    private int intValueOrDefault(Document doc, String key, int fallback) {
        Object value = doc.get(key);

        if (value instanceof Number number) {
            return number.intValue();
        }

        if (value instanceof String text) {
            try {
                return Integer.parseInt(text.replaceAll("[^0-9]", ""));
            } catch (NumberFormatException ignored) {
                return fallback;
            }
        }

        return fallback;
    }

    private double numberValue(Document doc, String key) {
        Object value = doc.get(key);

        if (value instanceof Number number) {
            return number.doubleValue();
        }

        if (value instanceof String text) {
            try {
                return Double.parseDouble(text);
            } catch (NumberFormatException ignored) {
                return 0;
            }
        }

        return 0;
    }

    public record EmployeeDto(
            String id,
            int idNV,
            String hoVaTen,
            String username,
            String chucVu,
            String hinhThuc,
            String soDienThoai,
            String trangThai,
            String caLam) {
    }

    public record EmployeeWriteRequest(
            String hoVaTen,
            String username,
            String chucVu,
            String hinhThuc,
            String soDienThoai,
            String matKhau,
            String caLam) {
    }

    public record RoleDto(
            String tenVaiTro,
            int soNguoi,
            Map<String, Boolean> quyen) {
    }

    public record PermissionUpdateRequest(
            String tenVaiTro,
            String tenQuyen,
            boolean enabled) {
    }

    public record InventoryResponse(
            int tongNguyenLieu,
            long nguyenLieuSapHet,
            List<NguyenLieuItemDto> nguyenLieuItems) {
    }

    public record NguyenLieuItemDto(
            int idNL,
            String tenNguyenLieu,
            String donViTinh,
            String loai,
            int soLuongTon,
            int mucCanhBao,
            boolean canhBao) {
    }

    public record NguyenLieuWriteRequest(
            String tenNguyenLieu,
            String donViTinh,
            String loai,
            Integer soLuongTon,
            Integer mucCanhBao) {
    }

    public record TonKhoWriteRequest(
            Integer soLuongTon,
            Integer mucCanhBao) {
    }

    public record TopProductDto(
            String tenMon,
            int quantity,
            double revenue) {
    }

    public record ReportDto(
            double doanhThu,
            double doanhThuDaThanhToan,
            long soDon,
            double trungBinhDon,
            long choXuLy,
            long daXacNhan,
            long daHuy,
            Map<String, Double> doanhThuTheoGio,
            List<TopProductDto> topSanPham) {
    }

    private static class ProductAggregate {
        int quantity;
        double revenue;
    }
}
