package chandanv.local.chandanv.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import chandanv.local.chandanv.models.entity.BanAn;
import chandanv.local.chandanv.repositories.BanAnRepository;
import org.springframework.web.client.RestTemplate;

@Configuration
public class BanAnDataInit implements CommandLineRunner {

    private final BanAnRepository repo;

    public BanAnDataInit(BanAnRepository repo) {
        this.repo = repo;
    }

    @Override
    public void run(String... args) {

        RestTemplate restTemplate = new RestTemplate();
        for (int i = 1; i <= 10; i++) {
            BanAn ban = repo.findByIdBan(i).orElse(new BanAn());
            ban.setIdBan(i);
            ban.setTenBan("Bàn " + (i < 10 ? "0" + i : i));
            ban.setTrangThai(0);
            String url = "http://localhost:8080/customer-menu?idBan=" + i;
            
            try {
                String qrApiUrl = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + java.net.URLEncoder.encode(url, java.nio.charset.StandardCharsets.UTF_8.toString());
                byte[] imageBytes = restTemplate.getForObject(qrApiUrl, byte[].class);
                if (imageBytes != null) {
                    String base64Image = java.util.Base64.getEncoder().encodeToString(imageBytes);
                    ban.setMaQR(base64Image);
                }
            } catch (Exception e) {
                System.err.println("Failed to fetch QR for table " + i + ": " + e.getMessage());
            }

            repo.save(ban);
        }

        System.out.println("Đã tạo/cập nhật mã QR cho 10 bàn (1–10)");
    }
}