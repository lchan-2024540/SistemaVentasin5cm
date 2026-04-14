package com.lchan.SistemaVentas.Controller;
import com.lchan.SistemaVentas.Entity.Ventas;
import com.lchan.SistemaVentas.Service.VentasService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ventas")
public class VentasController {

    private final VentasService ventasService;

    public VentasController(VentasService ventasService) {
        this.ventasService = ventasService;
    }

    @GetMapping
    public List<Ventas> getAllVentas() {
        return ventasService.getAllVentas();
    }

    @GetMapping("/{codigoVenta}")
    public ResponseEntity<Ventas> getVentasById(@PathVariable Integer codigoVenta) {
        Ventas venta = ventasService.getVentasById(codigoVenta);
        if (venta != null) {
            return ResponseEntity.ok(venta);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Ventas> createVentas(@RequestBody Ventas ventas) {
        Ventas created = ventasService.saveVentas(ventas);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{codigoVenta}")
    public ResponseEntity<Ventas> updateVentas(@PathVariable Integer codigoVenta, @RequestBody Ventas ventas) {
        Ventas updated = ventasService.updateVentas(codigoVenta, ventas);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{codigoVenta}")
    public ResponseEntity<String> deleteVentas(@PathVariable Integer codigoVenta) {
        ventasService.deleteVentas(codigoVenta);
        return ResponseEntity.ok("Venta eliminada con éxito");
    }
}