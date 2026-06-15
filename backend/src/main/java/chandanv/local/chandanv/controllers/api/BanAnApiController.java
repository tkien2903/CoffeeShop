package chandanv.local.chandanv.controllers.api;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

import chandanv.local.chandanv.models.entity.BanAn;
import chandanv.local.chandanv.services.BanAnService;

@RestController
@RequestMapping("/api/ban-an")
@CrossOrigin
public class BanAnApiController {

    private final BanAnService service;

    public BanAnApiController(BanAnService service) {
        this.service = service;
    }

    @GetMapping
    public List<BanAn> layDanhSachBan() {
        return service.layDanhSachBan();
    }

    @PostMapping("/luu-qr-image/{idBan}")
    public ResponseEntity<Map<String, Boolean>> luuQrImage(
            @PathVariable int idBan,
            @RequestBody String base64Image) {

        service.luuAnhQR(idBan, base64Image);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PutMapping("/{idBan}/trang-thai/{trangThai}")
    public ResponseEntity<Map<String, Boolean>> capNhatTrangThai(
            @PathVariable int idBan,
            @PathVariable int trangThai) {

        service.capNhatTrangThai(idBan, trangThai);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PutMapping("/reset")
    public ResponseEntity<Map<String, Boolean>> resetTrangThaiTatCaBan() {
        service.resetTatCaBan();
        return ResponseEntity.ok(Map.of("success", true));
    }
}
