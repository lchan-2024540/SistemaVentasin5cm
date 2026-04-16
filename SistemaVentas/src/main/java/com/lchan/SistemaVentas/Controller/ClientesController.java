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
        return cliente != null ? ResponseEntity.ok(cliente) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> createClientes(@RequestBody Clientes clientes) {
        try {
            Clientes created = clientesService.saveClientes(clientes);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{dpiCliente}")
    public ResponseEntity<?> updateClientes(@PathVariable Integer dpiCliente,
                                            @RequestBody Clientes clientes) {
        try {
            Clientes updated = clientesService.updateClientes(dpiCliente, clientes);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @DeleteMapping("/{dpiCliente}")
    public ResponseEntity<String> deleteClientes(@PathVariable Integer dpiCliente) {
        try {
            clientesService.deleteClientes(dpiCliente);
            return ResponseEntity.ok("Cliente eliminado con éxito");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}