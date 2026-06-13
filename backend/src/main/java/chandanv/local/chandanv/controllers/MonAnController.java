package chandanv.local.chandanv.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import chandanv.local.chandanv.models.entity.MonAn;
import chandanv.local.chandanv.services.MonAnService;
import chandanv.local.chandanv.services.MonAnService.LoaiMonAnDto;
import chandanv.local.chandanv.services.MonAnService.MonAnRequest;

@RestController
@RequestMapping("/api/mon-an")
@CrossOrigin(origins = "*")
public class MonAnController {

    private final MonAnService service;

    public MonAnController(MonAnService service) {
        this.service = service;
    }

    @GetMapping
    public List<MonAn> getAllMonAn() {
        return service.getAll();
    }

    @GetMapping("/loai")
    public List<LoaiMonAnDto> getLoaiMonAn() {
        return service.getLoaiMonAn();
    }

    @GetMapping("/loai/{idLoai}")
    public List<MonAn> getMonAnByLoai(@PathVariable int idLoai) {
        return service.getByIdLoai(idLoai);
    }

    @GetMapping("/{id}")
    public MonAn getMonAnById(@PathVariable String id) {
        return service.getById(id);
    }

    @PostMapping
    public MonAn createMonAn(@RequestBody MonAnRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public MonAn updateMonAn(@PathVariable String id, @RequestBody MonAnRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteMonAn(@PathVariable String id) {
        service.delete(id);
    }
}
