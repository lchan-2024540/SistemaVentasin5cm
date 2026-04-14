package com.lchan.SistemaVentas.Controller;
import com.lchan.SistemaVentas.Entity.DetalleVenta;
import com.lchan.SistemaVentas.Service.DetalleVentaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/detalle-venta")
public class DetalleVentaController {

    private final DetalleVentaService detalleVentaService;

    public DetalleVentaController(DetalleVentaService detalleVentaService) {
        this.detalleVentaService = detalleVentaService;
    }

    @GetMapping
    public List<DetalleVenta> getAllDetalleVenta() {
        return detalleVentaService.getAllDetalleVenta();
    }

    @GetMapping("/{codigoDetalleVenta}")
    public ResponseEntity<DetalleVenta> getDetalleVentaById(@PathVariable Integer codigoDetalleVenta) {
        DetalleVenta detalle = detalleVentaService.getDetalleVentaById(codigoDetalleVenta);
        if (detalle != null) {
            return ResponseEntity.ok(detalle);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<DetalleVenta> createDetalleVenta(@RequestBody DetalleVenta detalleVenta) {
        DetalleVenta created = detalleVentaService.saveDetalleVenta(detalleVenta);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{codigoDetalleVenta}")
    public ResponseEntity<DetalleVenta> updateDetalleVenta(@PathVariable Integer codigoDetalleVenta, @RequestBody DetalleVenta detalleVenta) {
        DetalleVenta updated = detalleVentaService.updateDetalleVenta(codigoDetalleVenta, detalleVenta);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{codigoDetalleVenta}")
    public ResponseEntity<String> deleteDetalleVenta(@PathVariable Integer codigoDetalleVenta) {
        detalleVentaService.deleteDetalleVenta(codigoDetalleVenta);
        return ResponseEntity.ok("Detalle de venta eliminado con éxito");
    }
}