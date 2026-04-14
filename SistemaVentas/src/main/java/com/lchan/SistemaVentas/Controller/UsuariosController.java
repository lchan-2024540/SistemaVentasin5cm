package com.lchan.SistemaVentas.Controller;
import com.lchan.SistemaVentas.Entity.Usuarios;
import com.lchan.SistemaVentas.Service.UsuariosService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuariosController {

    private final UsuariosService usuariosService;

    public UsuariosController(UsuariosService usuariosService) {
        this.usuariosService = usuariosService;
    }

    @GetMapping
    public List<Usuarios> getAllUsuarios() {
        return usuariosService.getAllUsuarios();
    }

    @GetMapping("/{codigoUsuario}")
    public ResponseEntity<Usuarios> getUsuariosById(@PathVariable Integer codigoUsuario) {
        Usuarios usuario = usuariosService.getUsuariosById(codigoUsuario);
        if (usuario != null) {
            return ResponseEntity.ok(usuario);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Usuarios> createUsuarios(@RequestBody Usuarios usuarios) {
        Usuarios created = usuariosService.saveUsuarios(usuarios);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{codigoUsuario}")
    public ResponseEntity<Usuarios> updateUsuarios(@PathVariable Integer codigoUsuario, @RequestBody Usuarios usuarios) {
        Usuarios updated = usuariosService.updateUsuarios(codigoUsuario, usuarios);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{codigoUsuario}")
    public ResponseEntity<String> deleteUsuarios(@PathVariable Integer codigoUsuario) {
        usuariosService.deleteUsuarios(codigoUsuario);
        return ResponseEntity.ok("Usuario eliminado con éxito");
    }
}