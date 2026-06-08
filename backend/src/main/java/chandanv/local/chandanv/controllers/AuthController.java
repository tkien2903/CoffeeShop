package chandanv.local.chandanv.controllers;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;

import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final MongoTemplate mongoTemplate;

    public AuthController(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String username, @RequestParam String matKhau) {
        Document admin = mongoTemplate.findOne(
                Query.query(Criteria.where("username").is(username).and("matKhau").is(matKhau)),
                Document.class,
                "admin");

        if (admin != null) {
            return ResponseEntity.ok(new AuthUserDto(
                    stringValue(admin, "_id"),
                    intValue(admin, "idAdmin"),
                    stringValue(admin, "username"),
                    stringValue(admin, "username"),
                    "Admin",
                    "Quản lý cửa hàng",
                    "FULLTIME",
                    "Ca B",
                    Instant.now().toString(),
                    permissionsFor("Admin")));
        }

        Document employee = mongoTemplate.findOne(
                Query.query(Criteria.where("Username").is(username).and("MatKhau").is(matKhau)),
                Document.class,
                "nhan_vien");

        if (employee != null) {
            String role = stringValue(employee, "ChucVu");
            return ResponseEntity.ok(new AuthUserDto(
                    stringValue(employee, "_id"),
                    intValue(employee, "idNV"),
                    stringValue(employee, "Username"),
                    stringValue(employee, "HoVaten"),
                    role,
                    roleName(role),
                    stringValue(employee, "HinhThuc"),
                    shiftFor(employee),
                    Instant.now().toString(),
                    permissionsFor(role)));
        }

        return ResponseEntity.badRequest().body("Sai tài khoản hoặc mật khẩu!");
    }

    private Map<String, Boolean> permissionsFor(String role) {
        Document permission = mongoTemplate.findOne(
                Query.query(Criteria.where("tenVaiTro").is(roleName(role))),
                Document.class,
                "phan_quyen");

        if (permission == null) {
            permission = new Document("tenVaiTro", roleName(role))
                    .append("quyen", defaultPermissions(roleName(role)));
            mongoTemplate.save(permission, "phan_quyen");
        }

        Object value = permission.get("quyen");
        if (value instanceof Document doc) {
            Map<String, Boolean> result = new LinkedHashMap<>();
            doc.forEach((key, enabled) -> result.put(key, Boolean.TRUE.equals(enabled)));
            return result;
        }

        return defaultPermissions(roleName(role));
    }

    private Map<String, Boolean> defaultPermissions(String role) {
        String normalized = normalize(role);
        boolean admin = normalized.contains("admin") || normalized.contains("quan ly") || normalized.contains("quản lý");
        boolean cashier = normalized.contains("thu ngan") || normalized.contains("thu ngân");

        Map<String, Boolean> permissions = new LinkedHashMap<>();
        permissions.put("Quản lý nhân viên", admin);
        permissions.put("Báo cáo doanh thu", admin || cashier);
        permissions.put("Xem đơn hàng", true);
        permissions.put("Quản lý kho", admin);
        permissions.put("Quản lý mã QR", admin);
        permissions.put("Cài đặt hệ thống", admin);
        return permissions;
    }

    private String roleName(String role) {
        if (role == null || role.isBlank()) {
            return "Nhân viên";
        }

        String normalized = normalize(role);
        if (normalized.contains("admin") || normalized.contains("quan ly") || normalized.contains("quản lý")) {
            return "Admin";
        }
        if (normalized.contains("thu ngan") || normalized.contains("thu ngân")) {
            return "Thu ngân";
        }
        if (normalized.contains("phuc vu") || normalized.contains("phục vụ")) {
            return "Phục vụ";
        }
        return role;
    }

    private String shiftFor(Document employee) {
        Object value = employee.get("CaLam");
        if (value != null) {
            return Objects.toString(value, "Ca B");
        }
        return "Ca B";
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }

    private String stringValue(Document doc, String key) {
        Object value = doc.get(key);
        return value == null ? "" : Objects.toString(value, "");
    }

    private int intValue(Document doc, String key) {
        Object value = doc.get(key);
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value instanceof String text) {
            try {
                return Integer.parseInt(text.replaceAll("[^0-9]", ""));
            } catch (NumberFormatException ignored) {
                return 0;
            }
        }
        return 0;
    }

    public record AuthUserDto(
            String id,
            int employeeCode,
            String username,
            String displayName,
            String rawRole,
            String role,
            String workType,
            String shift,
            String loginAt,
            Map<String, Boolean> permissions) {
    }
}
