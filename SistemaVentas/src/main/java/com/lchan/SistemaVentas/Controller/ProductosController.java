package com.lchan.SistemaVentas.Controller;
import com.lchan.SistemaVentas.Entity.Productos;
import com.lchan.SistemaVentas.Service.ProductosService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductosController {

    private final ProductosService productosService;

    public ProductosController(ProductosService productosService) {
        this.productosService = productosService;
    }

    @GetMapping
    public List<Productos> getAllProductos() {
        return productosService.getAllProductos();
    }

    @GetMapping("/{codigoProducto}")
    public ResponseEntity<Productos> getProductosById(@PathVariable Integer codigoProducto) {
        Productos producto = productosService.getProductosById(codigoProducto);
        if (producto != null) {
            return ResponseEntity.ok(producto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Productos> createProductos(@RequestBody Productos productos) {
        Productos created = productosService.saveProductos(productos);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{codigoProducto}")
    public ResponseEntity<Productos> updateProductos(@PathVariable Integer codigoProducto, @RequestBody Productos productos) {
        Productos updated = productosService.updateProductos(codigoProducto, productos);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{codigoProducto}")
    public ResponseEntity<String> deleteProductos(@PathVariable Integer codigoProducto) {
        productosService.deleteProductos(codigoProducto);
        return ResponseEntity.ok("Producto eliminado con éxito");
    }
}