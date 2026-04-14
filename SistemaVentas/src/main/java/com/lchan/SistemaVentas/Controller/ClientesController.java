package com.lchan.SistemaVentas.Controller;
import com.lchan.SistemaVentas.Entity.Clientes;
import com.lchan.SistemaVentas.Service.ClientesService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClientesController {

    private final ClientesService clientesService;

    public ClientesController(ClientesService clientesService) {
        this.clientesService = clientesService;
    }

    @GetMapping
    public List<Clientes> getAllClientes() {
        return clientesService.getAllClientes();
    }

    @GetMapping("/{dpiCliente}")
    public ResponseEntity<Clientes> getClientesById(@PathVariable Integer dpiCliente) {
        Clientes cliente = clientesService.getClientesById(dpiCliente);
        if (cliente != null) {
            return ResponseEntity.ok(cliente);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Clientes> createClientes(@RequestBody Clientes clientes) {
        Clientes created = clientesService.saveClientes(clientes);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{dpiCliente}")
    public ResponseEntity<Clientes> updateClientes(@PathVariable Integer dpiCliente, @RequestBody Clientes clientes) {
        Clientes updated = clientesService.updateClientes(dpiCliente, clientes);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{dpiCliente}")
    public ResponseEntity<String> deleteClientes(@PathVariable Integer dpiCliente) {
        clientesService.deleteClientes(dpiCliente);
        return ResponseEntity.ok("Cliente eliminado con éxito");
    }
}