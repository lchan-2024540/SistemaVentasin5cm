package com.lchan.SistemaVentas.Controller;

import com.lchan.SistemaVentas.Entity.Usuarios;
import com.lchan.SistemaVentas.Service.UsuariosService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuariosController {

    private final UsuariosService usuariosService;

    public UsuariosController(UsuariosService usuariosService) {
        this.usuariosService = usuariosService;
    }

    // ── CRUD original ──────────────────────────────────────────────────────────

    @GetMapping
    public List<Usuarios> getAllUsuarios() {
        // No exponer la foto en el listado (puede ser pesado)
        List<Usuarios> lista = usuariosService.getAllUsuarios();
        lista.forEach(u -> u.setFotoPerfil(null));
        return lista;
    }

    @GetMapping("/{codigoUsuario}")
    public ResponseEntity<Usuarios> getUsuariosById(@PathVariable Integer codigoUsuario) {
        Usuarios usuario = usuariosService.getUsuariosById(codigoUsuario);
        if (usuario == null) return ResponseEntity.notFound().build();
        usuario.setFotoPerfil(null); // foto se sirve por endpoint dedicado
        return ResponseEntity.ok(usuario);
    }

    @PostMapping
    public ResponseEntity<Usuarios> createUsuarios(@RequestBody Usuarios usuarios) {
        Usuarios created = usuariosService.saveUsuarios(usuarios);
        created.setFotoPerfil(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{codigoUsuario}")
    public ResponseEntity<Usuarios> updateUsuarios(@PathVariable Integer codigoUsuario,
                                                   @RequestBody Usuarios usuarios) {
        Usuarios updated = usuariosService.updateUsuarios(codigoUsuario, usuarios);
        updated.setFotoPerfil(null);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{codigoUsuario}")
    public ResponseEntity<String> deleteUsuarios(@PathVariable Integer codigoUsuario) {
        usuariosService.deleteUsuarios(codigoUsuario);
        return ResponseEntity.ok("Usuario eliminado con éxito");
    }

    // ── Login ──────────────────────────────────────────────────────────────────

    /**
     * POST /api/usuarios/login
     * Body: { "username": "...", "password": "..." }
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        if (username == null || password == null)
            return ResponseEntity.badRequest().body("Faltan credenciales");

        Usuarios u = usuariosService.login(username, password);
        if (u == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Credenciales incorrectas o cuenta inactiva");

        u.setFotoPerfil(null); // no enviar binario en la sesión
        return ResponseEntity.ok(u);
    }

    // ── Registro ───────────────────────────────────────────────────────────────

    /**
     * POST /api/usuarios/registro
     * Body: { "username": "...", "password": "...", "email": "...", "rol": "..." }
     * rol es opcional — si no viene se asigna "vendedor"
     */
    @PostMapping("/registro")
    public ResponseEntity<?> registro(@RequestBody Usuarios usuarios) {
        try {
            Usuarios created = usuariosService.registrar(usuarios);
            created.setFotoPerfil(null);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    // ── Foto de perfil ─────────────────────────────────────────────────────────

    /**
     * GET /api/usuarios/foto/{id}
     * Devuelve la imagen en bytes (JPEG/PNG).
     * Si no tiene foto → 404 (el frontend mostrará la imagen por defecto).
     */
    @GetMapping("/foto/{id}")
    public ResponseEntity<byte[]> getFoto(@PathVariable Integer id) {
        try {
            byte[] foto = usuariosService.getFoto(id);
            if (foto == null || foto.length == 0)
                return ResponseEntity.notFound().build();

            // Detectar tipo básico por magic bytes
            MediaType tipo = MediaType.IMAGE_JPEG;
            if (foto.length > 3 && foto[0] == (byte) 0x89 && foto[1] == 0x50)
                tipo = MediaType.IMAGE_PNG;

            return ResponseEntity.ok()
                    .contentType(tipo)
                    .body(foto);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST /api/usuarios/foto/{id}
     * multipart/form-data con campo "file"
     */
    @PostMapping("/foto/{id}")
    public ResponseEntity<?> uploadFoto(@PathVariable Integer id,
                                        @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty())
                return ResponseEntity.badRequest().body("Archivo vacío");

            long maxSize = 5 * 1024 * 1024; // 5 MB
            if (file.getSize() > maxSize)
                return ResponseEntity.badRequest().body("La imagen no debe superar 5 MB");

            byte[] bytes = file.getBytes();
            usuariosService.updateFoto(id, bytes);
            return ResponseEntity.ok(Map.of("mensaje", "Foto actualizada correctamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al guardar la foto: " + e.getMessage());
        }
    }
}