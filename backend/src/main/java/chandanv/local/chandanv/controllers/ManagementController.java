package chandanv.local.chandanv.controllers;

import java.time.Instant;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @GetMapping("/phan-quyen")
    public List<RoleDto> getRoles() {
        Map<String, Long> counts = getEmployees()
                .stream()
                .collect(Collectors.groupingBy(
                        employee -> roleName(employee.chucVu()),
                        LinkedHashMap::new,
                        Collectors.counting()));

        List<RoleDto> roles = new ArrayList<>();
        roles.add(new RoleDto("Admin", 2, permissions(true, true, true, true, true)));

        counts.forEach((role, count) -> {
            boolean manager = role.toLowerCase().contains("quản") || role.toLowerCase().contains("quan");
            boolean cashier = role.toLowerCase().contains("thu");

            roles.add(new RoleDto(
                    role,
                    count.intValue(),
                    permissions(manager, manager || cashier, true, manager, manager)));
        });

        return roles;
    }

    @GetMapping("/kho")
    public InventoryResponse getInventory() {
        Map<Integer, String> categories = mongoTemplate.findAll(Document.class, "loai_mon_an")
                .stream()
                .collect(Collectors.toMap(
                        doc -> intValue(doc, "idLoai"),
                        doc -> stringValue(doc, "tenLoai"),
                        (left, right) -> left));

        List<InventoryItemDto> items = mongoTemplate.findAll(Document.class, "mon_an")
                .stream()
                .map(doc -> {
                    int idLoai = intValue(doc, "idLoai");
                    int stock = intValue(doc, "soLuongTon");
                    int minStock = intValueOrDefault(doc, "mucCanhBao", 10);

                    return new InventoryItemDto(
                            intValue(doc, "idMon"),
                            stringValue(doc, "TenMon"),
                            categories.getOrDefault(idLoai, "Chưa phân loại"),
                            stock,
                            minStock,
                            stock <= minStock,
                            numberValue(doc, "Gia"));
                })
                .sorted(Comparator.comparing(InventoryItemDto::idMon))
                .toList();

        long lowStock = items.stream().filter(InventoryItemDto::canhBao).count();
        return new InventoryResponse(items.size(), lowStock, items);
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
                "Đang làm");
    }

    private Map<String, Boolean> permissions(boolean employees, boolean reports, boolean orders, boolean inventory, boolean settings) {
        Map<String, Boolean> permissions = new LinkedHashMap<>();
        permissions.put("Quản lý nhân viên", employees);
        permissions.put("Báo cáo doanh thu", reports);
        permissions.put("Xem đơn hàng", orders);
        permissions.put("Quản lý kho", inventory);
        permissions.put("Cài đặt hệ thống", settings);
        return permissions;
    }

    private String roleName(String chucVu) {
        if (chucVu == null || chucVu.isBlank()) {
            return "Nhân viên";
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
                return Integer.parseInt(text);
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
            String trangThai) {
    }

    public record RoleDto(
            String tenVaiTro,
            int soNguoi,
            Map<String, Boolean> quyen) {
    }

    public record InventoryItemDto(
            int idMon,
            String tenMon,
            String loai,
            int soLuongTon,
            int mucCanhBao,
            boolean canhBao,
            double giaTriDonVi) {
    }

    public record InventoryResponse(
            int tongMatHang,
            long sapHet,
            List<InventoryItemDto> items) {
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
