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
        return venta != null ? ResponseEntity.ok(venta) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> createVentas(@RequestBody Ventas ventas) {
        try {
            Ventas created = ventasService.saveVentas(ventas);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{codigoVenta}")
    public ResponseEntity<?> updateVentas(@PathVariable Integer codigoVenta,
                                          @RequestBody Ventas ventas) {
        try {
            Ventas updated = ventasService.updateVentas(codigoVenta, ventas);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @DeleteMapping("/{codigoVenta}")
    public ResponseEntity<String> deleteVentas(@PathVariable Integer codigoVenta) {
        try {
            ventasService.deleteVentas(codigoVenta);
            return ResponseEntity.ok("Venta eliminada con éxito");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}