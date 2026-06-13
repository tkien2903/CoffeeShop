package chandanv.local.chandanv.services;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.data.mongodb.core.MongoTemplate;

import chandanv.local.chandanv.models.entity.MonAn;
import chandanv.local.chandanv.repositories.MonAnRepository;

@Service
public class MonAnService {

    private final MonAnRepository repository;
    private final MongoTemplate mongoTemplate;

    private static final String BASE_IMAGE_URL = "http://localhost:8080/uploads/";

    public MonAnService(MonAnRepository repository, MongoTemplate mongoTemplate) {
        this.repository = repository;
        this.mongoTemplate = mongoTemplate;
    }

    public List<MonAn> getAll() {
        return repository.findAll().stream()
                .map(this::attachImageUrl)
                .collect(Collectors.toList());
    }

    public List<MonAn> getByIdLoai(int idLoai) {
        return repository.findByIdLoai(idLoai).stream()
                .map(this::attachImageUrl)
                .collect(Collectors.toList());
    }

    public MonAn getById(String id) {
        return repository.findById(id)
                .map(this::attachImageUrl)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy món ăn"));
    }

    public MonAn create(MonAnRequest request) {
        MonAn monAn = new MonAn();
        monAn.setIdMon(nextIdMon());
        monAn.setTenMon(request.tenMon());
        monAn.setIdLoai(request.idLoai());
        monAn.setGia(request.gia());
        monAn.setSoLuongTon(request.soLuongTon() != null ? request.soLuongTon() : 0);
        monAn.setMucCanhBao(request.mucCanhBao() != null ? request.mucCanhBao() : 10);
        return attachImageUrl(repository.save(monAn));
    }

    public MonAn update(String id, MonAnRequest request) {
        MonAn existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy món ăn"));

        existing.setTenMon(request.tenMon());
        existing.setIdLoai(request.idLoai());
        existing.setGia(request.gia());
        if (request.soLuongTon() != null) {
            existing.setSoLuongTon(request.soLuongTon());
        }
        if (request.mucCanhBao() != null) {
            existing.setMucCanhBao(request.mucCanhBao());
        }

        return attachImageUrl(repository.save(existing));
    }

    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy món ăn");
        }
        repository.deleteById(id);
    }

    private int nextIdMon() {
        Optional<MonAn> max = repository.findAll().stream()
                .max((left, right) -> Integer.compare(left.getIdMon(), right.getIdMon()));
        return max.map(mon -> mon.getIdMon() + 1).orElse(1);
    }

    public List<LoaiMonAnDto> getLoaiMonAn() {
        return mongoTemplate.findAll(org.bson.Document.class, "loai_mon_an")
                .stream()
                .map(doc -> new LoaiMonAnDto(
                        intValue(doc, "idLoai"),
                        stringValue(doc, "tenLoai"),
                        stringValue(doc, "moTa")))
                .sorted(java.util.Comparator.comparing(LoaiMonAnDto::idLoai))
                .collect(Collectors.toList());
    }

    private int intValue(org.bson.Document doc, String key) {
        Object value = doc.get(key);
        if (value instanceof Number number) {
            return number.intValue();
        }
        return 0;
    }

    private String stringValue(org.bson.Document doc, String key) {
        Object value = doc.get(key);
        return value == null ? "" : value.toString();
    }

    private MonAn attachImageUrl(MonAn monAn) {
        String image = monAn.getImage();
        if (image != null && !image.isBlank()) {
            if (!image.startsWith("http")) {
                monAn.setImage("http://localhost:8080" + (image.startsWith("/") ? image : "/" + image));
            }
            return monAn;
        }

        monAn.setImage(BASE_IMAGE_URL + monAn.getIdMon() + ".jpg");
        return monAn;
    }

    public record LoaiMonAnDto(int idLoai, String tenLoai, String moTa) {
    }

    public record MonAnRequest(
            String tenMon,
            int idLoai,
            int gia,
            Integer soLuongTon,
            Integer mucCanhBao) {
    }
}
